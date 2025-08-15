import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly saltLength = 32;

  constructor(private readonly configService: ConfigService) {}

  encrypt(text: string, password?: string): { encrypted: string; salt: string } {
    const salt = crypto.randomBytes(this.saltLength);
    const key = password 
      ? crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256')
      : crypto.scryptSync(this.getEncryptionKey(), salt, this.keyLength);
    
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex'),
      salt: salt.toString('hex'),
    };
  }

  decrypt(encryptedData: string, salt: string, password?: string): string {
    const [ivHex, encrypted, tagHex] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const saltBuffer = Buffer.from(salt, 'hex');
    
    const key = password 
      ? crypto.pbkdf2Sync(password, saltBuffer, 100000, this.keyLength, 'sha256')
      : crypto.scryptSync(this.getEncryptionKey(), saltBuffer, this.keyLength);
    
    const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
    algorithm = 'sha256'
  ): boolean {
    const expectedSignature = crypto
      .createHmac(algorithm, secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  private getEncryptionKey(): string {
    return this.configService.get('JWT_SECRET') || 'default-encryption-key';
  }
}