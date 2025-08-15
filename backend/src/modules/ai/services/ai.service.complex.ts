import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@common/utils/logger.service';
import { CacheService } from '@common/utils/cache.service';
import { ClaudeService } from './claude.service';
import { 
  AIProvider, 
  AIResponse, 
  ConversationContext, 
  MultiAIResponse 
} from '../interfaces/ai-provider.interface';

@Injectable()
export class AIService {
  private providers: Map<string, AIProvider> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly claudeService: ClaudeService,
  ) {
    // Register AI providers
    this.providers.set('claude', this.claudeService);
    
    // TODO: Add other providers (Qwen, DeepSeek) when implemented
    this.logger.log(`Initialized AI service with ${this.providers.size} providers`);
  }

  async generateResponse(
    prompt: string,
    context: ConversationContext,
    model = 'claude',
    useCache = true,
  ): Promise<AIResponse> {
    // Try cache first if enabled
    if (useCache) {
      const cachedResponse = await this.cacheService.getAiResponse(prompt, model);
      if (cachedResponse) {
        this.logger.debug('Using cached AI response', { model, promptLength: prompt.length });
        return cachedResponse;
      }
    }

    const provider = this.providers.get(model);
    if (!provider) {
      throw new Error(`AI provider '${model}' not found`);
    }

    try {
      const response = await provider.generateResponse(prompt, context);
      
      // Validate response quality
      if (!provider.validateResponse(response.content)) {
        this.logger.warn('AI response failed validation', { 
          model, 
          contentLength: response.content.length 
        });
      }

      // Cache successful response
      if (useCache && response.content) {
        await this.cacheService.cacheAiResponse(prompt, model, response, 3600);
      }

      return response;

    } catch (error) {
      this.logger.error('AI generation failed', { 
        model, 
        error: error.message,
        promptLength: prompt.length 
      });
      throw error;
    }
  }

  async generateMultiPerspective(
    prompt: string,
    context: ConversationContext,
    requestedModels: string[] = ['claude'],
    includeConsensus = true,
  ): Promise<MultiAIResponse> {
    const responses: AIResponse[] = [];
    const errors: Array<{ model: string; error: string }> = [];

    // Generate responses from each requested model
    for (const model of requestedModels) {
      try {
        const response = await this.generateResponse(prompt, context, model, true);
        responses.push(response);
      } catch (error) {
        errors.push({ model, error: error.message });
        this.logger.error(`Multi-AI generation failed for ${model}`, error);
      }
    }

    if (responses.length === 0) {
      throw new Error('All AI providers failed to generate responses');
    }

    const result: MultiAIResponse = {
      primary: responses[0], // First successful response is primary
      alternatives: responses.slice(1),
    };

    // Generate consensus analysis if requested and we have multiple responses
    if (includeConsensus && responses.length > 1) {
      result.consensus = await this.generateConsensus(responses);
    }

    return result;
  }

  async generateBusinessAnalysis(
    idea: string,
    context: Partial<ConversationContext>,
  ): Promise<AIResponse> {
    const analysisPrompt = `
Analyze this business idea and provide comprehensive insights:

Business Idea: ${idea}

Please provide:
1. Market opportunity assessment
2. Target user analysis
3. Competitive landscape overview
4. Technical feasibility assessment
5. MVP scope recommendations
6. Go-to-market strategy suggestions
7. Risk analysis and mitigation

Format your response with clear sections and actionable insights.
`;

    return this.generateResponse(analysisPrompt, context as ConversationContext, 'claude');
  }

  async generateTechnicalSpec(
    requirements: string,
    techStack: Record<string, any>,
    context: Partial<ConversationContext>,
  ): Promise<AIResponse> {
    const specPrompt = `
Generate detailed technical specifications for the following requirements:

Requirements: ${requirements}

Preferred Tech Stack: ${JSON.stringify(techStack)}

Please provide:
1. System architecture overview
2. Database schema recommendations
3. API endpoint specifications
4. Frontend component structure
5. Integration requirements
6. Security considerations
7. Performance optimization suggestions
8. Testing strategy
9. Deployment recommendations

Format as detailed technical specifications suitable for developers.
`;

    return this.generateResponse(specPrompt, context as ConversationContext, 'claude');
  }

  async generateUserStories(
    features: string[],
    userPersonas: string[],
    context: Partial<ConversationContext>,
  ): Promise<AIResponse> {
    const storiesPrompt = `
Generate comprehensive user stories for the following features and user personas:

Features: ${features.join(', ')}
User Personas: ${userPersonas.join(', ')}

For each feature, create:
1. Epic-level user story
2. Detailed user stories with acceptance criteria
3. Technical tasks and implementation notes
4. Testing scenarios
5. Priority and effort estimates

Format as structured user stories ready for development planning.
`;

    return this.generateResponse(storiesPrompt, context as ConversationContext, 'claude');
  }

  private async generateConsensus(responses: AIResponse[]): Promise<{
    confidence: number;
    summary: string;
    keyPoints: string[];
    disagreements?: string[];
  }> {
    if (responses.length < 2) {
      return {
        confidence: 1.0,
        summary: 'Single response available',
        keyPoints: this.extractKeyPoints(responses[0].content),
      };
    }

    // This is a simplified consensus algorithm
    // In production, you might use more sophisticated NLP techniques
    
    const allContent = responses.map(r => r.content).join('\n\n---\n\n');
    const consensusPrompt = `
Analyze the following AI responses and provide a consensus summary:

${allContent}

Provide:
1. Overall confidence score (0-1) based on agreement between responses
2. Unified summary that captures the main insights
3. Key points that all or most responses agree on
4. Any significant disagreements or conflicting recommendations

Format as JSON with confidence, summary, keyPoints, and disagreements fields.
`;

    try {
      const consensusResponse = await this.claudeService.generateResponse(
        consensusPrompt,
        {} as ConversationContext,
      );

      // Try to parse as JSON, fallback to structured text parsing
      try {
        return JSON.parse(consensusResponse.content);
      } catch {
        return this.parseConsensusText(consensusResponse.content);
      }
    } catch (error) {
      this.logger.error('Consensus generation failed', error);
      
      // Fallback to simple analysis
      return {
        confidence: 0.7,
        summary: 'Multiple perspectives available - review individual responses',
        keyPoints: this.extractKeyPoints(responses[0].content),
      };
    }
  }

  private extractKeyPoints(content: string): string[] {
    // Simple key point extraction - look for numbered lists or bullet points
    const lines = content.split('\n');
    const keyPoints: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.match(/^[0-9]+\./) || trimmed.startsWith('-') || trimmed.startsWith('•')) {
        keyPoints.push(trimmed.replace(/^[0-9]+\.|^[-•]\s*/, ''));
      }
    }

    return keyPoints.slice(0, 10); // Limit to top 10 points
  }

  private parseConsensusText(content: string): {
    confidence: number;
    summary: string;
    keyPoints: string[];
    disagreements?: string[];
  } {
    // Simple text parsing fallback
    const lines = content.split('\n').map(line => line.trim()).filter(Boolean);
    
    return {
      confidence: 0.8, // Default confidence
      summary: lines[0] || 'Consensus analysis available',
      keyPoints: this.extractKeyPoints(content),
      disagreements: [],
    };
  }

  // Utility methods
  getAvailableModels(): string[] {
    return Array.from(this.providers.keys());
  }

  getProviderInfo(model: string): { name: string; available: boolean } | null {
    const provider = this.providers.get(model);
    return provider ? { name: provider.name, available: true } : null;
  }
}