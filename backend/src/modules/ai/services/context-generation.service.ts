import { Injectable } from '@nestjs/common';

@Injectable()
export class ContextGenerationService {
  generateContext(projectId: string): any {
    return {
      projectId,
      context: 'Mock context for development',
      timestamp: new Date(),
    };
  }
}