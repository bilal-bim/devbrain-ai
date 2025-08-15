import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { HealthService } from '../services/health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check application health status' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async check() {
    return this.healthService.checkHealth();
  }

  @Get('database')
  @Public()
  @ApiOperation({ summary: 'Check database connectivity' })
  @ApiResponse({ status: 200, description: 'Database is accessible' })
  @ApiResponse({ status: 503, description: 'Database is not accessible' })
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }

  @Get('redis')
  @Public()
  @ApiOperation({ summary: 'Check Redis connectivity' })
  @ApiResponse({ status: 200, description: 'Redis is accessible' })
  @ApiResponse({ status: 503, description: 'Redis is not accessible' })
  async checkRedis() {
    return this.healthService.checkRedis();
  }

  @Get('ai-services')
  @Public()
  @ApiOperation({ summary: 'Check AI services availability' })
  @ApiResponse({ status: 200, description: 'AI services are available' })
  @ApiResponse({ status: 503, description: 'AI services are not available' })
  async checkAiServices() {
    return this.healthService.checkAiServices();
  }
}