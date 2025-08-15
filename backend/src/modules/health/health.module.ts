import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { HealthService } from './services/health.service';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forFeature([]), // Empty array as we don't need specific entities
  ],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}