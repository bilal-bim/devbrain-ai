import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageRole, MessageType, AIModel } from '../entities/message.entity';
import { ConversationsService } from './conversations.service';
import { AIService } from '@modules/ai/services/ai.service';
import { LoggerService } from '@common/utils/logger.service';
import { ConversationContext } from '@modules/ai/interfaces/ai-provider.interface';

export interface SendMessageDto {
  conversationId: string;
  content: string;
  aiModel?: AIModel;
  messageType?: MessageType;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly conversationsService: ConversationsService,
    private readonly aiService: AIService,
    private readonly logger: LoggerService,
  ) {}

  async sendMessage(dto: SendMessageDto, userId: string): Promise<Message> {
    const { conversationId, content, aiModel = AIModel.CLAUDE, messageType = MessageType.TEXT } = dto;

    // Validate conversation exists and is active
    const conversation = await this.conversationsService.findById(conversationId);
    if (conversation.status !== 'active') {
      throw new BadRequestException('Cannot send message to inactive conversation');
    }

    // Create user message
    const userMessage = await this.createMessage({
      conversationId,
      role: MessageRole.USER,
      content,
      messageType,
    });

    this.logger.logUserAction(userId, 'message_sent', {
      conversationId,
      messageId: userMessage.id,
      contentLength: content.length,
    });

    // Generate AI response
    try {
      const aiResponse = await this.generateAIResponse(conversation, aiModel, userId);
      
      // Update conversation message count and tokens
      await this.conversationsService.incrementMessageCount(
        conversationId, 
        aiResponse.tokens.total,
      );

      return aiResponse;

    } catch (error) {
      this.logger.error('AI response generation failed', {
        conversationId,
        userId,
        error: error.message,
      });

      // Create error message for user feedback
      const errorMessage = await this.createMessage({
        conversationId,
        role: MessageRole.ASSISTANT,
        content: 'I apologize, but I encountered an issue generating a response. Please try again or contact support if the problem persists.',
        messageType: MessageType.TEXT,
        metadata: { error: true, originalError: error.message },
      });

      return errorMessage;
    }
  }

  async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });
  }

  async getLatestMessages(conversationId: string, count = 10): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: count,
    });
  }

  async findById(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['conversation'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  async updateQualityScore(id: string, score: number): Promise<Message> {
    const message = await this.findById(id);
    message.qualityScore = score;
    return this.messagesRepository.save(message);
  }

  private async createMessage(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
    aiModel?: AIModel;
    messageType?: MessageType;
    responseTimeMs?: number;
    metadata?: Record<string, any>;
  }): Promise<Message> {
    const message = this.messagesRepository.create({
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      aiModel: data.aiModel,
      messageType: data.messageType || MessageType.TEXT,
      responseTimeMs: data.responseTimeMs,
      metadata: data.metadata || {},
    });

    return this.messagesRepository.save(message);
  }

  private async generateAIResponse(
    conversation: any,
    aiModel: AIModel,
    userId: string,
  ): Promise<Message> {
    const startTime = Date.now();

    // Build conversation context
    const messages = await this.getLatestMessages(conversation.id, 20);
    const context: ConversationContext = {
      projectId: conversation.projectId,
      conversationId: conversation.id,
      messages: messages.reverse().map(msg => ({
        role: msg.role as any,
        content: msg.content,
        timestamp: msg.createdAt,
      })),
      projectContext: conversation.project ? {
        name: conversation.project.name,
        description: conversation.project.description,
        industry: conversation.project.industry,
        targetUsers: conversation.project.targetUsers,
        techStack: conversation.project.techStack,
        marketAnalysis: conversation.project.marketAnalysis,
      } : undefined,
    };

    // Get the latest user message as the prompt
    const latestUserMessage = messages.find(msg => msg.role === MessageRole.USER);
    if (!latestUserMessage) {
      throw new BadRequestException('No user message found to respond to');
    }

    // Generate AI response
    const aiResponse = await this.aiService.generateResponse(
      latestUserMessage.content,
      context,
      aiModel,
    );

    const responseTime = Date.now() - startTime;

    // Create assistant message
    const assistantMessage = await this.createMessage({
      conversationId: conversation.id,
      role: MessageRole.ASSISTANT,
      content: aiResponse.content,
      aiModel: aiModel,
      messageType: MessageType.TEXT,
      responseTimeMs: responseTime,
      metadata: {
        tokens: aiResponse.tokens,
        cost: aiResponse.cost,
        model: aiResponse.model,
        ...aiResponse.metadata,
      },
    });

    // Update conversation stage based on content analysis
    await this.updateConversationStageIfNeeded(conversation, aiResponse.content);

    this.logger.logAiInteraction(
      aiResponse.model,
      aiResponse.tokens.total,
      aiResponse.cost || 0,
      true,
    );

    return assistantMessage;
  }

  private async updateConversationStageIfNeeded(
    conversation: any,
    responseContent: string,
  ): Promise<void> {
    // Simple stage detection based on keywords in AI response
    const content = responseContent.toLowerCase();

    if (conversation.conversationStage === 'discovery') {
      if (content.includes('market analysis') || 
          content.includes('competitive landscape') ||
          content.includes('target users')) {
        await this.conversationsService.updateStage(
          conversation.id,
          'analysis' as any,
          'system',
        );
      }
    } else if (conversation.conversationStage === 'analysis') {
      if (content.includes('technical specification') ||
          content.includes('user stories') ||
          content.includes('mvp scope')) {
        await this.conversationsService.updateStage(
          conversation.id,
          'specification' as any,
          'system',
        );
      }
    } else if (conversation.conversationStage === 'specification') {
      if (content.includes('context generated') ||
          content.includes('ready for development') ||
          content.includes('implementation plan')) {
        await this.conversationsService.updateStage(
          conversation.id,
          'completion' as any,
          'system',
        );
      }
    }
  }

  async getMessageStats(conversationId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageResponseTime: number;
    totalTokens: number;
  }> {
    const messages = await this.messagesRepository.find({
      where: { conversationId },
    });

    const assistantMessages = messages.filter(m => m.role === MessageRole.ASSISTANT);
    const responseTimeSum = assistantMessages
      .filter(m => m.responseTimeMs)
      .reduce((sum, m) => sum + (m.responseTimeMs || 0), 0);

    const totalTokens = assistantMessages
      .reduce((sum, m) => {
        const tokens = m.metadata?.tokens?.total || 0;
        return sum + tokens;
      }, 0);

    return {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === MessageRole.USER).length,
      assistantMessages: assistantMessages.length,
      averageResponseTime: assistantMessages.length > 0 
        ? Math.round(responseTimeSum / assistantMessages.length)
        : 0,
      totalTokens,
    };
  }
}