import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: Logger;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
      ),
      defaultMeta: {
        service: 'devbrainai-backend',
        environment: process.env.NODE_ENV,
      },
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
          ),
        }),
      ],
    });

    // Add file transport in production
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
      );
      this.logger.add(
        new transports.File({
          filename: 'logs/combined.log',
        }),
      );
    }
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Custom methods for structured logging
  logUserAction(userId: string, action: string, metadata?: any) {
    this.logger.info('User action', {
      userId,
      action,
      metadata,
      type: 'user_action',
    });
  }

  logApiCall(method: string, endpoint: string, statusCode: number, duration: number, userId?: string) {
    this.logger.info('API call', {
      method,
      endpoint,
      statusCode,
      duration,
      userId,
      type: 'api_call',
    });
  }

  logAiInteraction(model: string, tokens: number, cost: number, success: boolean) {
    this.logger.info('AI interaction', {
      model,
      tokens,
      cost,
      success,
      type: 'ai_interaction',
    });
  }
}