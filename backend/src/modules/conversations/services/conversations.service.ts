import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation, ConversationStatus, ConversationStage } from '../entities/conversation.entity';
import { LoggerService } from '@common/utils/logger.service';
import { CacheService } from '@common/utils/cache.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
  ) {}

  async create(projectId: string, userId: string): Promise<Conversation> {
    // TODO: Verify user has access to project
    const conversation = this.conversationsRepository.create({
      projectId,
      sessionId: this.generateSessionId(),
      status: ConversationStatus.ACTIVE,
      conversationStage: ConversationStage.DISCOVERY,
    });

    const savedConversation = await this.conversationsRepository.save(conversation);
    
    this.logger.logUserAction(userId, 'conversation_created', {
      conversationId: savedConversation.id,
      projectId,
    });

    return savedConversation;
  }

  async findById(id: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: ['project', 'messages'],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async findByProject(projectId: string, limit = 20, offset = 0): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: { projectId },
      relations: ['messages'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findActiveConversation(projectId: string): Promise<Conversation | null> {
    return this.conversationsRepository.findOne({
      where: { 
        projectId, 
        status: ConversationStatus.ACTIVE 
      },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
    });
  }

  async updateStage(id: string, stage: ConversationStage, userId: string): Promise<Conversation> {
    const conversation = await this.findById(id);
    
    conversation.conversationStage = stage;
    conversation.updatedAt = new Date();

    const updatedConversation = await this.conversationsRepository.save(conversation);

    this.logger.logUserAction(userId, 'conversation_stage_updated', {
      conversationId: id,
      newStage: stage,
    });

    // Invalidate cache
    await this.cacheService.del(`conversation_context:${id}`);

    return updatedConversation;
  }

  async complete(
    id: string, 
    userId: string, 
    satisfactionRating?: number, 
    feedback?: string
  ): Promise<Conversation> {
    const conversation = await this.findById(id);
    
    conversation.status = ConversationStatus.COMPLETED;
    conversation.conversationStage = ConversationStage.COMPLETION;
    conversation.satisfactionRating = satisfactionRating;
    conversation.feedback = feedback;
    conversation.updatedAt = new Date();

    const updatedConversation = await this.conversationsRepository.save(conversation);

    this.logger.logUserAction(userId, 'conversation_completed', {
      conversationId: id,
      satisfactionRating,
      totalMessages: conversation.totalMessages,
      totalTokens: conversation.totalTokens,
    });

    return updatedConversation;
  }

  async archive(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.findById(id);
    
    conversation.status = ConversationStatus.ARCHIVED;
    conversation.updatedAt = new Date();

    const updatedConversation = await this.conversationsRepository.save(conversation);

    this.logger.logUserAction(userId, 'conversation_archived', {
      conversationId: id,
    });

    return updatedConversation;
  }

  async updateMetadata(id: string, metadata: Record<string, any>): Promise<Conversation> {
    const conversation = await this.findById(id);
    
    conversation.metadata = {
      ...conversation.metadata,
      ...metadata,
    };
    conversation.updatedAt = new Date();

    return this.conversationsRepository.save(conversation);
  }

  async incrementMessageCount(id: string, tokenCount = 0): Promise<void> {
    await this.conversationsRepository.increment(
      { id },
      'totalMessages',
      1,
    );

    if (tokenCount > 0) {
      await this.conversationsRepository.increment(
        { id },
        'totalTokens',
        tokenCount,
      );
    }
  }

  async markContextGenerated(id: string): Promise<void> {
    await this.conversationsRepository.update(
      { id },
      { 
        contextGenerated: true,
        updatedAt: new Date(),
      },
    );
  }

  async getConversationStats(projectId: string): Promise<{
    total: number;
    active: number;
    completed: number;
    averageMessages: number;
    averageTokens: number;
  }> {
    const cacheKey = `conversation_stats:${projectId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const conversations = await this.conversationsRepository.find({
      where: { projectId },
    });

    const stats = {
      total: conversations.length,
      active: conversations.filter(c => c.status === ConversationStatus.ACTIVE).length,
      completed: conversations.filter(c => c.status === ConversationStatus.COMPLETED).length,
      averageMessages: conversations.length > 0 
        ? Math.round(conversations.reduce((sum, c) => sum + c.totalMessages, 0) / conversations.length)
        : 0,
      averageTokens: conversations.length > 0
        ? Math.round(conversations.reduce((sum, c) => sum + c.totalTokens, 0) / conversations.length)
        : 0,
    };

    await this.cacheService.set(cacheKey, stats, 300); // 5 minutes cache
    return stats;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}