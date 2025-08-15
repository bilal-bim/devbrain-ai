import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
  expirationTime: process.env.JWT_EXPIRATION_TIME || '7d',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  refreshExpirationTime: process.env.JWT_REFRESH_EXPIRATION_TIME || '30d',
}));