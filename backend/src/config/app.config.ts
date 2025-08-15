import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
  
  // External services
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@devbrainai.com',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: process.env.S3_BUCKET_NAME || 'devbrainai-contexts',
    cloudfrontUrl: process.env.CLOUDFRONT_URL,
  },
  
  github: {
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET,
  },
  
  monitoring: {
    datadogApiKey: process.env.DATADOG_API_KEY,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  websocket: {
    corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN || 'http://localhost:3001',
  },
  
  rateLimiting: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
}));