import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CacheService } from '@common/utils/cache.service';

@Injectable()
export class HealthService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
  ) {}

  async checkHealth() {
    const startTime = Date.now();
    
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkAiServices(),
    ]);

    const responseTime = Date.now() - startTime;
    const allHealthy = checks.every(check => check.status === 'fulfilled' && check.value.status === 'up');
    
    return {
      status: allHealthy ? 'up' : 'down',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV'),
      checks: {
        database: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'down' },
        redis: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'down' },
        aiServices: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'down' },
      },
    };
  }

  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'up',
        message: 'Database connection successful',
        responseTime: Date.now(),
      };
    } catch (error) {
      return {
        status: 'down',
        message: 'Database connection failed',
        error: error.message,
      };
    }
  }

  async checkRedis() {
    try {
      const testKey = 'health_check';
      const testValue = Date.now().toString();
      
      await this.cacheService.set(testKey, testValue, 10);
      const retrievedValue = await this.cacheService.get(testKey);
      
      if (retrievedValue === testValue) {
        await this.cacheService.del(testKey);
        return {
          status: 'up',
          message: 'Redis connection successful',
          responseTime: Date.now(),
        };
      } else {
        throw new Error('Redis read/write test failed');
      }
    } catch (error) {
      return {
        status: 'down',
        message: 'Redis connection failed',
        error: error.message,
      };
    }
  }

  async checkAiServices() {
    const claudeApiKey = this.configService.get('ai.claude.apiKey');
    
    if (!claudeApiKey) {
      return {
        status: 'down',
        message: 'AI services not configured',
        services: {
          claude: 'not configured',
        },
      };
    }

    try {
      // Simple health check - just verify API key format
      // In production, you might want to make a minimal API call
      const isValidKey = claudeApiKey.startsWith('sk-') && claudeApiKey.length > 20;
      
      if (isValidKey) {
        return {
          status: 'up',
          message: 'AI services available',
          services: {
            claude: 'configured',
          },
        };
      } else {
        throw new Error('Invalid API key format');
      }
    } catch (error) {
      return {
        status: 'down',
        message: 'AI services unavailable',
        error: error.message,
        services: {
          claude: 'error',
        },
      };
    }
  }
}