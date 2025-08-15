import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private logger = new Logger(AIService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI initialized successfully');
    } else {
      this.logger.error('OpenAI API key not found');
    }
  }

  async chat(message: string, context?: any[]): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are DevbrainAI, an AI business consultant that helps founders transform ideas into MVPs. Be helpful, specific, and actionable.'
          },
          ...(context || []),
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        content: completion.choices[0].message.content,
        provider: 'openai',
        model: 'gpt-4',
      };
    } catch (error) {
      this.logger.error('Error calling OpenAI:', error);
      throw error;
    }
  }
}