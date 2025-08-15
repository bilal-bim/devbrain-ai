import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const contextType = context.getType();
    
    let info: string;
    
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      const fieldName = info.fieldName;
      const parentType = info.parentType.name;
      info = `GraphQL ${parentType}.${fieldName}`;
    } else {
      const request = context.switchToHttp().getRequest();
      const { method, url, ip } = request;
      const userAgent = request.get('User-Agent') || '';
      info = `${method} ${url} - ${ip} - ${userAgent}`;
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${info} - ${duration}ms`);
      }),
    );
  }
}