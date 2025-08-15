import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AIProvider, AIMessage, AIResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;
  private model: string;
  private logger = new Logger(OpenAIProvider.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4');
    
    if (apiKey && apiKey !== 'your_openai_api_key_here') {
      this.client = new OpenAI({
        apiKey,
      });
      this.logger.log(`OpenAI provider initialized with model: ${this.model}`);
    } else {
      this.logger.warn('OpenAI API key not configured');
    }
  }

  async generateResponse(messages: AIMessage[], options?: any): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error('OpenAI provider is not available. Please check your API key.');
    }

    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 2000,
        ...options,
      });

      const response = completion.choices[0];
      
      return {
        content: response.message.content || '',
        provider: this.name,
        model: this.model,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
        metadata: {
          finishReason: response.finish_reason,
        },
      };
    } catch (error) {
      this.logger.error('Error generating OpenAI response:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  isAvailable(): boolean {
    return !!this.client;
  }
}