import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { join } from 'path';

// Common module for shared services
import { CommonModule } from './common/common.module';

// Existing modules only
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { HealthModule } from './modules/health/health.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.sqlite', '.env.local'],
    }),

    // Database - SQLite for simplicity
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DATABASE_TYPE', 'sqlite');
        
        if (dbType === 'sqlite') {
          return {
            type: 'sqlite',
            database: configService.get('DATABASE_NAME', 'devbrain.sqlite'),
            autoLoadEntities: true,
            synchronize: true,
            logging: configService.get('NODE_ENV') !== 'production',
          };
        }
        
        // PostgreSQL fallback
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: parseInt(configService.get('DATABASE_PORT', '5432')),
          username: configService.get('DATABASE_USER', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'postgres'),
          database: configService.get('DATABASE_NAME', 'devbrain_db'),
          autoLoadEntities: true,
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') !== 'production',
        };
      },
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
        context: ({ req, res }) => ({ req, res }),
      }),
      inject: [ConfigService],
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ttl: parseInt(configService.get('THROTTLE_TTL', '60')),
        limit: parseInt(configService.get('THROTTLE_LIMIT', '100')),
      }),
      inject: [ConfigService],
    }),

    // Cache module - in-memory cache for development
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // seconds
      max: 100, // maximum number of items in cache
    }),

    // Common module - provides global services
    CommonModule,

    // Feature modules - only the ones that exist
    AuthModule,
    UsersModule,
    ConversationsModule,
    HealthModule,
    AiModule,
  ],
})
export class AppModule {}