import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    await this.cacheManager.reset();
  }

  // Specialized cache methods
  async cacheUserSession(userId: string, sessionData: any, ttl = 3600): Promise<void> {
    await this.set(`user_session:${userId}`, sessionData, ttl);
  }

  async getUserSession(userId: string): Promise<any> {
    return this.get(`user_session:${userId}`);
  }

  async cacheConversationContext(conversationId: string, context: any, ttl = 1800): Promise<void> {
    await this.set(`conversation_context:${conversationId}`, context, ttl);
  }

  async getConversationContext(conversationId: string): Promise<any> {
    return this.get(`conversation_context:${conversationId}`);
  }

  async cacheAiResponse(prompt: string, model: string, response: any, ttl = 3600): Promise<void> {
    const key = `ai_response:${model}:${this.hashString(prompt)}`;
    await this.set(key, response, ttl);
  }

  async getAiResponse(prompt: string, model: string): Promise<any> {
    const key = `ai_response:${model}:${this.hashString(prompt)}`;
    return this.get(key);
  }

  async cacheProjectAnalytics(projectId: string, analytics: any, ttl = 900): Promise<void> {
    await this.set(`project_analytics:${projectId}`, analytics, ttl);
  }

  async getProjectAnalytics(projectId: string): Promise<any> {
    return this.get(`project_analytics:${projectId}`);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const patterns = [
      `user_session:${userId}`,
      `user_projects:${userId}`,
      `user_analytics:${userId}`,
    ];
    
    await Promise.all(patterns.map(pattern => this.del(pattern)));
  }

  async invalidateProjectCache(projectId: string): Promise<void> {
    const patterns = [
      `project_analytics:${projectId}`,
      `project_context:${projectId}`,
      `project_progress:${projectId}`,
    ];
    
    await Promise.all(patterns.map(pattern => this.del(pattern)));
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}