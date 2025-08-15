import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@common/utils/logger.service';
import { AIProvider, AIResponse, ConversationContext } from '../interfaces/ai-provider.interface';

@Injectable()
export class ClaudeService implements AIProvider {
  public readonly name = 'claude';
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.apiKey = this.configService.get('ai.claude.apiKey');
    this.apiUrl = this.configService.get('ai.claude.apiUrl');
    this.model = this.configService.get('ai.claude.model');
    this.maxTokens = this.configService.get('ai.claude.maxTokens');
    this.temperature = this.configService.get('ai.claude.temperature');

    if (!this.apiKey) {
      this.logger.warn('Claude API key not configured');
    }
  }

  async generateResponse(prompt: string, context: ConversationContext): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new HttpException('Claude API not configured', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const startTime = Date.now();
    
    try {
      const messages = this.formatMessages(prompt, context);
      const systemPrompt = this.buildSystemPrompt(context);

      const requestBody = {
        model: this.model,
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        system: systemPrompt,
        messages: messages,
      };

      this.logger.debug('Sending request to Claude API', { model: this.model });

      const response = await fetch(`${this.apiUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error('Claude API error', { status: response.status, error });
        throw new HttpException(
          `Claude API error: ${response.status}`,
          HttpStatus.BAD_GATEWAY,
        );
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const result: AIResponse = {
        content: data.content[0]?.text || '',
        model: this.model,
        tokens: {
          prompt: data.usage?.input_tokens || 0,
          completion: data.usage?.output_tokens || 0,
          total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        cost: this.calculateCost((data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)),
        responseTime,
        metadata: {
          stopReason: data.stop_reason,
          stopSequence: data.stop_sequence,
          claudeModel: data.model,
        },
      };

      this.logger.logAiInteraction(this.model, result.tokens.total, result.cost, true);

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Claude service error', error.stack);
      this.logger.logAiInteraction(this.model, 0, 0, false);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to generate AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  validateResponse(response: string): boolean {
    if (!response || response.trim().length === 0) {
      return false;
    }

    // Check for common error patterns
    const errorPatterns = [
      /I'm sorry, I can't/i,
      /I don't have access/i,
      /I cannot provide/i,
      /As an AI assistant/i, // Generic responses
    ];

    return !errorPatterns.some(pattern => pattern.test(response));
  }

  estimateTokens(prompt: string): number {
    // Rough estimation: 1 token ≈ 0.75 words ≈ 4 characters
    return Math.ceil(prompt.length / 4);
  }

  calculateCost(tokens: number): number {
    // Claude pricing (approximate - update with actual rates)
    const costPerToken = 0.000015; // $0.015 per 1K tokens
    return (tokens / 1000) * costPerToken;
  }

  private formatMessages(prompt: string, context: ConversationContext) {
    const messages = [];

    // Add conversation history (last 10 messages to stay within token limits)
    const recentMessages = context.messages.slice(-10);
    for (const message of recentMessages) {
      if (message.role !== 'system') {
        messages.push({
          role: message.role,
          content: message.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: prompt,
    });

    return messages;
  }

  private buildSystemPrompt(context: ConversationContext): string {
    const { projectContext, userProfile } = context;

    let systemPrompt = `You are DevbrainAI, an expert business consultant and technical advisor. You help founders transform their ideas into viable MVPs through intelligent conversation and context generation.

Your role:
- Analyze business ideas and provide market insights
- Guide technical architecture and implementation decisions  
- Generate actionable specifications and user stories
- Provide multiple perspectives and alternatives
- Create MCP-compatible context for developers

Current conversation context:`;

    if (projectContext) {
      systemPrompt += `
Project: ${projectContext.name}`;
      
      if (projectContext.description) {
        systemPrompt += `
Description: ${projectContext.description}`;
      }

      if (projectContext.industry) {
        systemPrompt += `
Industry: ${projectContext.industry}`;
      }

      if (projectContext.targetUsers.length > 0) {
        systemPrompt += `
Target Users: ${projectContext.targetUsers.join(', ')}`;
      }

      if (Object.keys(projectContext.techStack).length > 0) {
        systemPrompt += `
Tech Stack: ${JSON.stringify(projectContext.techStack)}`;
      }
    }

    if (userProfile) {
      systemPrompt += `

User Profile:
- Subscription: ${userProfile.subscriptionTier}`;
      
      if (userProfile.preferences && Object.keys(userProfile.preferences).length > 0) {
        systemPrompt += `
- Preferences: ${JSON.stringify(userProfile.preferences)}`;
      }
    }

    systemPrompt += `

Guidelines:
- Be conversational and encouraging
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Consider market realities and constraints
- Generate visual data when appropriate
- Reference industry best practices
- Suggest concrete next steps

Focus on helping the founder make informed decisions and move forward with confidence.`;

    return systemPrompt;
  }
}