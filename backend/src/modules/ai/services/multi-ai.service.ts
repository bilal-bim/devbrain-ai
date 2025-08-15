import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAIProvider } from '../providers/openai.provider';
import { AIProvider, AIMessage, AIResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class MultiAIService {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string;
  private logger = new Logger(MultiAIService.name);

  constructor(
    private configService: ConfigService,
    private openAIProvider: OpenAIProvider,
  ) {
    // Register providers
    this.registerProvider('openai', openAIProvider);
    
    // Set default provider from config
    this.defaultProvider = this.configService.get<string>('AI_PROVIDER', 'openai');
    this.logger.log(`Default AI provider set to: ${this.defaultProvider}`);
  }

  private registerProvider(name: string, provider: AIProvider) {
    this.providers.set(name, provider);
    this.logger.log(`Registered AI provider: ${name}`);
  }

  async generateResponse(
    messages: AIMessage[],
    providerName?: string,
    options?: any,
  ): Promise<AIResponse> {
    const provider = this.getProvider(providerName);
    
    if (!provider) {
      throw new Error(`AI provider '${providerName || this.defaultProvider}' not found`);
    }

    if (!provider.isAvailable()) {
      throw new Error(`AI provider '${provider.name}' is not available`);
    }

    try {
      const response = await provider.generateResponse(messages, options);
      this.logger.log(`Generated response using ${provider.name}`);
      return response;
    } catch (error) {
      this.logger.error(`Error with provider ${provider.name}:`, error);
      throw error;
    }
  }

  async chat(
    userMessage: string,
    context?: AIMessage[],
    providerName?: string,
  ): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `You are DevbrainAI, an AI business consultant that helps founders and developers transform ideas into deployed MVPs. 
        You provide expert guidance on business strategy, technical architecture, and implementation details.
        Be helpful, specific, and actionable in your responses.`,
      },
      ...(context || []),
      {
        role: 'user',
        content: userMessage,
      },
    ];

    return this.generateResponse(messages, providerName);
  }

  getProvider(name?: string): AIProvider | undefined {
    const providerName = name || this.defaultProvider;
    return this.providers.get(providerName);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isAvailable())
      .map(([name]) => name);
  }

  getCurrentProvider(): string {
    return this.defaultProvider;
  }

  setDefaultProvider(name: string): void {
    if (this.providers.has(name)) {
      this.defaultProvider = name;
      this.logger.log(`Default provider changed to: ${name}`);
    } else {
      throw new Error(`Provider '${name}' not found`);
    }
  }
}