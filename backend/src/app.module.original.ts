import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import * as redisStore from 'cache-manager-redis-store';

// Configuration
import { databaseConfig } from '@config/database.config';
import { redisConfig } from '@config/redis.config';
import { jwtConfig } from '@config/jwt.config';
import { aiConfig } from '@config/ai.config';
import { appConfig } from '@config/app.config';

// Core modules
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { ContextModule } from '@modules/context/context.module';
import { TeamModule } from '@modules/team/team.module';
import { ProgressModule } from '@modules/progress/progress.module';
import { AnalyticsModule } from '@modules/analytics/analytics.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { IntegrationsModule } from '@modules/integrations/integrations.module';
import { FilesModule } from '@modules/files/files.module';
import { WebhooksModule } from '@modules/webhooks/webhooks.module';
import { HealthModule } from '@modules/health/health.module';
import { AiModule } from '@modules/ai/ai.module';

// Common modules
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        redisConfig,
        jwtConfig,
        aiConfig,
        appConfig,
      ],
      envFilePath: ['.env', '.env.local', '.env.development'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'database/migrations', '*.{ts,js}')],
      }),
      inject: [ConfigService],
    }),

    // GraphQL
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: configService.get('NODE_ENV') !== 'production',
        introspection: configService.get('NODE_ENV') !== 'production',
        context: ({ req, res, connection }) => {
          if (connection) {
            return { req: connection.context, res };
          }
          return { req, res };
        },
        subscriptions: {
          'graphql-ws': {
            onConnect: (context) => {
              const { connectionParams, extra } = context;
              return {
                req: {
                  headers: {
                    ...connectionParams,
                  },
                },
              };
            },
          },
        },
        formatError: (error) => {
          const isDevelopment = configService.get('NODE_ENV') !== 'production';
          
          return {
            message: error.message,
            code: error.extensions?.code,
            ...(isDevelopment && {
              locations: error.locations,
              path: error.path,
              extensions: error.extensions,
            }),
          };
        },
      }),
      inject: [ConfigService],
    }),

    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        db: configService.get('redis.db'),
        ttl: 300, // 5 minutes default TTL
      }),
      inject: [ConfigService],
    }),

    // Queue system
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host'),
          port: configService.get('redis.port'),
          password: configService.get('redis.password'),
          db: configService.get('redis.queueDb', 1),
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('RATE_LIMIT_TTL', 60),
        limit: configService.get('RATE_LIMIT_MAX', 100),
        storage: redisStore,
      }),
      inject: [ConfigService],
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Feature modules
    CommonModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ConversationsModule,
    ContextModule,
    TeamModule,
    ProgressModule,
    AnalyticsModule,
    NotificationsModule,
    IntegrationsModule,
    FilesModule,
    WebhooksModule,
    HealthModule,
    AiModule,
  ],
})
export class AppModule {}