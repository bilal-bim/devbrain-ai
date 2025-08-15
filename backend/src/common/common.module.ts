import { Global, Module } from '@nestjs/common';
import { LoggerService } from './utils/logger.service';
import { CacheService } from './utils/cache.service';
import { EncryptionService } from './utils/encryption.service';
import { ValidationService } from './utils/validation.service';

@Global()
@Module({
  providers: [
    LoggerService,
    CacheService,
    EncryptionService,
    ValidationService,
  ],
  exports: [
    LoggerService,
    CacheService,
    EncryptionService,
    ValidationService,
  ],
})
export class CommonModule {}