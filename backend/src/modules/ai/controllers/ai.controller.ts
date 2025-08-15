import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { MultiAIService } from '../services/multi-ai.service';
import { AIMessage } from '../interfaces/ai-provider.interface';

@Controller('api/ai')
export class AIController {
  constructor(private readonly multiAIService: MultiAIService) {}

  @Post('chat')
  async chat(
    @Body() body: { 
      message: string; 
      context?: AIMessage[];
      provider?: string;
    },
  ) {
    try {
      const response = await this.multiAIService.chat(
        body.message,
        body.context,
        body.provider,
      );
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('generate')
  async generate(
    @Body() body: { 
      messages: AIMessage[];
      provider?: string;
      options?: any;
    },
  ) {
    try {
      const response = await this.multiAIService.generateResponse(
        body.messages,
        body.provider,
        body.options,
      );
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('providers')
  getProviders() {
    return {
      available: this.multiAIService.getAvailableProviders(),
      current: this.multiAIService.getCurrentProvider(),
    };
  }

  @Post('provider')
  setProvider(@Body() body: { provider: string }) {
    try {
      this.multiAIService.setDefaultProvider(body.provider);
      return {
        success: true,
        provider: body.provider,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('health')
  health() {
    const providers = this.multiAIService.getAvailableProviders();
    return {
      status: providers.length > 0 ? 'healthy' : 'unhealthy',
      providers,
      current: this.multiAIService.getCurrentProvider(),
    };
  }
}