import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptService {
  generatePrompt(context: any): string {
    return `You are a helpful AI assistant. Context: ${JSON.stringify(context)}`;
  }
}