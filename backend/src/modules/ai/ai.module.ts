import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIService } from './services/ai.service';
import { ClaudeService } from './services/claude.service';
import { PromptService } from './services/prompt.service';
import { ContextGenerationService } from './services/context-generation.service';
import { MultiAIService } from './services/multi-ai.service';
import { OpenAIProvider } from './providers/openai.provider';
import { AIController } from './controllers/ai.controller';

@Module({
  imports: [ConfigModule],
  controllers: [AIController],
  providers: [
    AIService,
    ClaudeService,
    PromptService,
    ContextGenerationService,
    MultiAIService,
    OpenAIProvider,
  ],
  exports: [
    AIService,
    ClaudeService,
    PromptService,
    ContextGenerationService,
    MultiAIService,
  ],
})
export class AiModule {}