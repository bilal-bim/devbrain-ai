# DevbrainAI Infrastructure & Deployment Architecture

## Overview

DevbrainAI is designed for cloud-native deployment with high availability, auto-scaling, and comprehensive monitoring. This document outlines the complete infrastructure setup, deployment strategies, and operational procedures.

## Cloud Architecture

### AWS Infrastructure Design

```
┌─────────────────────────────────────────────────────────────────┐
│                          AWS Cloud                             │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │   Route 53 DNS      │    │        CloudFront CDN           │  │
│  │   - devbrainai.com  │    │   - Static assets caching      │  │
│  │   - api.devbrainai  │    │   - Global edge locations      │  │
│  └─────────────────────┘    └─────────────────────────────────┘  │
│                                             │                   │
│  ┌─────────────────────────────────────────┼─────────────────┐  │
│  │            Application Load Balancer     │                 │  │
│  │         - SSL/TLS termination           │                 │  │
│  │         - Health check routing          │                 │  │
│  │         - WebSocket support             │                 │  │
│  └─────────────────────────────────────────┼─────────────────┘  │
│                                             │                   │
│  ┌──────────────────┐  ┌──────────────────┐ ┌─────────────────┐ │
│  │   Web Frontend   │  │   API Services   │ │ Background Jobs │ │
│  │   ECS/Fargate    │  │   ECS/Fargate    │ │   ECS/Fargate   │ │
│  │   - React App    │  │   - NestJS API   │ │   - Queue Jobs  │ │
│  │   - Auto Scaling │  │   - Auto Scaling │ │   - AI Process  │ │
│  └──────────────────┘  └──────────────────┘ └─────────────────┘ │
│                                             │                   │
│  ┌─────────────────────────────────────────┼─────────────────┐  │
│  │              Data Services               │                 │  │
│  │                                         │                 │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────┼───────────────┐ │ │
│  │  │ RDS Postgres│ │ ElastiCache │ │ S3  │ Bucket        │ │ │
│  │  │ Multi-AZ    │ │ Redis       │ │ Fil│ Storage       │ │ │
│  │  │ Read Replica│ │ Cluster     │ │ Cac│e & Backups   │ │ │
│  │  └─────────────┘ └─────────────┘ └─────┼───────────────┘ │ │
│  └─────────────────────────────────────────┼─────────────────┘  │
│                                             │                   │
│  ┌─────────────────────────────────────────┼─────────────────┐  │
│  │           Monitoring & Logging           │                 │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌────┼──────────────┐ │ │
│  │  │ CloudWatch   │ │ DataDog APM  │ │ ES │ Log Cluster  │ │ │
│  │  │ Metrics      │ │ Monitoring   │ │ Lo│ging Search   │ │ │
│  │  └──────────────┘ └──────────────┘ └────┼──────────────┘ │ │
│  └─────────────────────────────────────────┼─────────────────┘  │
└─────────────────────────────────────────────┼───────────────────┘
```

### Multi-Environment Setup

```
Development Environment:
├── Single ECS cluster
├── RDS db.t3.micro (development tier)
├── ElastiCache single node
├── S3 bucket (dev-devbrainai-storage)
└── Basic CloudWatch monitoring

Staging Environment:
├── ECS cluster (2 services)
├── RDS db.t3.small with snapshot backups
├── ElastiCache cluster (2 nodes)
├── S3 bucket (staging-devbrainai-storage)
├── Full monitoring with DataDog
└── SSL certificates

Production Environment:
├── ECS cluster (multi-AZ, auto-scaling)
├── RDS Multi-AZ with read replicas
├── ElastiCache cluster (3 nodes, multi-AZ)
├── S3 with versioning and cross-region replication
├── Comprehensive monitoring and alerting
├── WAF protection
└── 99.9% uptime SLA
```

## Container Architecture

### Docker Configuration

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1
```

```dockerfile
# Backend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

USER nestjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
```

### ECS Task Definitions

```json
{
  "family": "devbrainai-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/devbrainai-task-role",
  "containerDefinitions": [
    {
      "name": "devbrainai-api",
      "image": "ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/devbrainai-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/devbrainai/database-url"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/devbrainai/redis-url"
        },
        {
          "name": "CLAUDE_API_KEY",
          "valueFrom": "arn:aws:ssm:us-east-1:ACCOUNT:parameter/devbrainai/claude-api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/devbrainai-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### Auto Scaling Configuration

```json
{
  "ServiceName": "devbrainai-api-service",
  "Namespace": "ecs",
  "ScalableDimension": "ecs:service:DesiredCount",
  "MinCapacity": 2,
  "MaxCapacity": 20,
  "ScalingPolicies": [
    {
      "PolicyName": "cpu-scaling-policy",
      "PolicyType": "TargetTrackingScaling",
      "TargetTrackingScalingPolicyConfiguration": {
        "TargetValue": 70.0,
        "PredefinedMetricSpecification": {
          "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleOutCooldown": 300,
        "ScaleInCooldown": 300
      }
    },
    {
      "PolicyName": "memory-scaling-policy",
      "PolicyType": "TargetTrackingScaling",
      "TargetTrackingScalingPolicyConfiguration": {
        "TargetValue": 80.0,
        "PredefinedMetricSpecification": {
          "PredefinedMetricType": "ECSServiceAverageMemoryUtilization"
        }
      }
    }
  ]
}
```

## Database Infrastructure

### RDS PostgreSQL Configuration

```yaml
# Production RDS Configuration
Engine: postgres
EngineVersion: "15.4"
DBInstanceClass: db.r6g.xlarge
AllocatedStorage: 100
MaxAllocatedStorage: 1000
StorageType: gp3
StorageEncrypted: true
MultiAZ: true
PubliclyAccessible: false
VpcSecurityGroupIds:
  - sg-database-access
DBSubnetGroupName: devbrainai-db-subnet-group
BackupRetentionPeriod: 7
PreferredBackupWindow: "03:00-04:00"
PreferredMaintenanceWindow: "sun:04:00-sun:05:00"
MonitoringInterval: 60
PerformanceInsightsEnabled: true
DeletionProtection: true

# Read Replica Configuration
SourceDBInstanceIdentifier: devbrainai-prod-primary
DBInstanceClass: db.r6g.large
PubliclyAccessible: false
AutoMinorVersionUpgrade: true
```

### Database Migration Strategy

```sql
-- Migration versioning table
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by VARCHAR(255) DEFAULT 'system'
);

-- Example migration script structure
-- migrations/001_initial_schema.sql
BEGIN;

-- Create initial tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- ... table definition
);

-- Insert migration record
INSERT INTO schema_migrations (version, applied_by) 
VALUES ('001_initial_schema', 'deployment-system');

COMMIT;
```

### Database Connection Pooling

```typescript
// Prisma connection configuration
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
    { level: 'error', emit: 'event' },
  ],
});

// Connection pool settings via DATABASE_URL
// postgresql://user:password@host:5432/dbname?
//   connection_limit=20&
//   pool_timeout=20&
//   socket_timeout=60&
//   connect_timeout=60
```

## Redis Configuration

### ElastiCache Setup

```yaml
# Production Redis Cluster
CacheNodeType: cache.r6g.large
Engine: redis
EngineVersion: "7.0"
NumCacheNodes: 3
ReplicationGroupDescription: "DevbrainAI Redis Cluster"
AutomaticFailoverEnabled: true
MultiAZEnabled: true
AtRestEncryptionEnabled: true
TransitEncryptionEnabled: true
SecurityGroupIds:
  - sg-redis-access
SubnetGroupName: devbrainai-cache-subnet-group
MaintenanceWindow: "sun:03:00-sun:04:00"
SnapshotRetentionLimit: 5
SnapshotWindow: "02:00-03:00"
```

### Redis Usage Patterns

```typescript
// Cache configuration
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keyPrefix: 'devbrainai:',
});

// Cache layers
export const CacheKeys = {
  USER_SESSION: (userId: string) => `session:${userId}`,
  PROJECT_DATA: (projectId: string) => `project:${projectId}`,
  CONVERSATION_CONTEXT: (conversationId: string) => `context:${conversationId}`,
  AI_RESPONSE_CACHE: (hash: string) => `ai:response:${hash}`,
  CONTEXT_PACK: (packId: string) => `pack:${packId}`,
  RATE_LIMIT: (userId: string, endpoint: string) => `ratelimit:${userId}:${endpoint}`,
};

// TTL settings
export const CacheTTL = {
  USER_SESSION: 24 * 60 * 60, // 24 hours
  PROJECT_DATA: 30 * 60, // 30 minutes
  CONVERSATION_CONTEXT: 60 * 60, // 1 hour
  AI_RESPONSE_CACHE: 7 * 24 * 60 * 60, // 7 days
  CONTEXT_PACK: 24 * 60 * 60, // 24 hours
  RATE_LIMIT: 60, // 1 minute
};
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_API: devbrainai-api
  ECR_REPOSITORY_FRONTEND: devbrainai-frontend
  ECS_SERVICE_API: devbrainai-api-service
  ECS_SERVICE_FRONTEND: devbrainai-frontend-service
  ECS_CLUSTER: devbrainai-cluster

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd frontend && npm ci

      - name: Run linting
        run: |
          npm run lint
          cd frontend && npm run lint

      - name: Run unit tests
        run: |
          npm run test:unit
          cd frontend && npm run test

      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
        run: npm run test:integration

      - name: Run E2E tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
        run: npm run test:e2e

      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  build-and-push:
    name: Build and Push Images
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push API image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY_API:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_API:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_API:latest

      - name: Build, tag, and push Frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest

  deploy:
    name: Deploy to ECS
    runs-on: ubuntu-latest
    needs: build-and-push
    environment: 
      name: ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }}
    
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Download task definition
        run: |
          aws ecs describe-task-definition \
            --task-definition devbrainai-api \
            --query taskDefinition > task-definition.json

      - name: Fill in the new image ID in task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: task-definition.json
          container-name: devbrainai-api
          image: ${{ steps.login-ecr.outputs.registry }}/${{ env.ECR_REPOSITORY_API }}:${{ github.sha }}

      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE_API }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true

      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition devbrainai-migrations \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.SUBNET_IDS }}],securityGroups=[${{ secrets.SECURITY_GROUP_ID }}],assignPublicIp=ENABLED}"

  notify:
    name: Notify Team
    runs-on: ubuntu-latest
    needs: [deploy]
    if: always()
    
    steps:
      - name: Notify Slack
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Blue-Green Deployment Strategy

```bash
#!/bin/bash
# Blue-Green deployment script

set -e

CLUSTER_NAME="devbrainai-cluster"
SERVICE_NAME="devbrainai-api-service"
NEW_TASK_DEF="devbrainai-api:$BUILD_NUMBER"

echo "Starting blue-green deployment..."

# Update service with new task definition
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $NEW_TASK_DEF \
  --deployment-configuration maximumPercent=200,minimumHealthyPercent=100

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME

# Run health checks
echo "Running health checks..."
LOAD_BALANCER_DNS=$(aws elbv2 describe-load-balancers \
  --names devbrainai-alb \
  --query 'LoadBalancers[0].DNSName' \
  --output text)

for i in {1..10}; do
  if curl -f "http://$LOAD_BALANCER_DNS/health"; then
    echo "Health check passed"
    break
  else
    echo "Health check failed, attempt $i/10"
    sleep 10
  fi
done

echo "Blue-green deployment completed successfully!"
```

## Monitoring & Observability

### DataDog Configuration

```yaml
# datadog-agent.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: datadog-agent
spec:
  selector:
    matchLabels:
      app: datadog-agent
  template:
    metadata:
      labels:
        app: datadog-agent
    spec:
      containers:
      - name: datadog-agent
        image: gcr.io/datadoghq/agent:7
        env:
        - name: DD_API_KEY
          valueFrom:
            secretKeyRef:
              name: datadog-secret
              key: api-key
        - name: DD_SITE
          value: "datadoghq.com"
        - name: DD_LOGS_ENABLED
          value: "true"
        - name: DD_LOGS_CONFIG_CONTAINER_COLLECT_ALL
          value: "true"
        - name: DD_APM_ENABLED
          value: "true"
        - name: DD_APM_NON_LOCAL_TRAFFIC
          value: "true"
        - name: DD_PROCESS_AGENT_ENABLED
          value: "true"
        volumeMounts:
        - name: dockersock
          mountPath: /var/run/docker.sock
        - name: procdir
          mountPath: /host/proc
          readOnly: true
        - name: cgroups
          mountPath: /host/sys/fs/cgroup
          readOnly: true
```

### Application Metrics

```typescript
// Custom metrics collection
import { StatsD } from 'node-statsd';

const statsd = new StatsD({
  host: process.env.DATADOG_AGENT_HOST || 'localhost',
  port: 8125,
  prefix: 'devbrainai.',
  tags: [`env:${process.env.NODE_ENV}`]
});

export class MetricsService {
  recordConversationDuration(duration: number, model: string, tier: string) {
    statsd.histogram('conversation.duration', duration, 1, [
      `ai_model:${model}`,
      `user_tier:${tier}`
    ]);
  }

  recordAIRequestLatency(latency: number, model: string, success: boolean) {
    statsd.histogram('ai.request.latency', latency, 1, [
      `ai_model:${model}`,
      `success:${success}`
    ]);
  }

  recordContextGeneration(success: boolean, format: string, size: number) {
    statsd.increment('context.generation', 1, [
      `success:${success}`,
      `format:${format}`
    ]);
    
    if (success) {
      statsd.histogram('context.size', size, 1, [`format:${format}`]);
    }
  }

  recordDatabaseQuery(operation: string, duration: number, table: string) {
    statsd.histogram('database.query.duration', duration, 1, [
      `operation:${operation}`,
      `table:${table}`
    ]);
  }
}
```

### Health Check Implementation

```typescript
// Comprehensive health check endpoint
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: Redis
  ) {}

  @Get()
  async healthCheck() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkAIServices(),
      this.checkExternalServices()
    ]);

    const results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || 'unknown',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        database: checks[0],
        redis: checks[1],
        ai_services: checks[2],
        external_services: checks[3]
      }
    };

    const hasFailures = checks.some(check => check.status === 'rejected');
    if (hasFailures) {
      results.status = 'degraded';
    }

    return results;
  }

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', latency: Date.now() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private async checkRedis() {
    try {
      const start = Date.now();
      await this.redis.ping();
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private async checkAIServices() {
    // Check Claude API availability
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      });

      return {
        status: response.ok ? 'healthy' : 'unhealthy',
        claude_api: response.status
      };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  private async checkExternalServices() {
    // Check GitHub API, Stripe, etc.
    const checks = await Promise.allSettled([
      fetch('https://api.github.com/rate_limit'),
      fetch('https://api.stripe.com/v1/charges?limit=1', {
        headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` }
      })
    ]);

    return {
      github: checks[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
      stripe: checks[1].status === 'fulfilled' ? 'healthy' : 'unhealthy'
    };
  }
}
```

## Security Configuration

### AWS IAM Policies

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ECSTaskPolicy",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "secretsmanager:GetSecretValue",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:ssm:*:*:parameter/devbrainai/*",
        "arn:aws:secretsmanager:*:*:secret:devbrainai/*",
        "arn:aws:s3:::devbrainai-*",
        "arn:aws:s3:::devbrainai-*/*"
      ]
    },
    {
      "Sid": "CloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/ecs/devbrainai-*"
    }
  ]
}
```

### Security Group Configuration

```yaml
# Database Security Group
DatabaseSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for RDS database
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        SourceSecurityGroupId: !Ref ApplicationSecurityGroup
        Description: PostgreSQL access from application

# Application Security Group
ApplicationSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for ECS tasks
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 3000
        ToPort: 3000
        SourceSecurityGroupId: !Ref LoadBalancerSecurityGroup
        Description: HTTP access from load balancer
    SecurityGroupEgress:
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: 0.0.0.0/0
        Description: HTTPS outbound traffic
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        DestinationSecurityGroupId: !Ref DatabaseSecurityGroup
        Description: Database access

# Load Balancer Security Group
LoadBalancerSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for Application Load Balancer
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 80
        ToPort: 80
        CidrIp: 0.0.0.0/0
        Description: HTTP access
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: 0.0.0.0/0
        Description: HTTPS access
```

### SSL/TLS Configuration

```nginx
# nginx.conf for frontend container
server {
    listen 80;
    server_name devbrainai.com www.devbrainai.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name devbrainai.com www.devbrainai.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # SSL configuration handled by ALB
    # Real IP forwarding
    real_ip_header X-Forwarded-For;
    set_real_ip_from 0.0.0.0/0;

    location / {
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Backup & Disaster Recovery

### Database Backup Strategy

```bash
#!/bin/bash
# Automated backup script

set -e

# Configuration
DB_INSTANCE_ID="devbrainai-prod-primary"
BACKUP_BUCKET="devbrainai-backups"
RETENTION_DAYS=30

# Create RDS snapshot
SNAPSHOT_ID="devbrainai-backup-$(date +%Y%m%d-%H%M%S)"
aws rds create-db-snapshot \
  --db-instance-identifier $DB_INSTANCE_ID \
  --db-snapshot-identifier $SNAPSHOT_ID

# Wait for snapshot to complete
aws rds wait db-snapshot-completed \
  --db-snapshot-identifier $SNAPSHOT_ID

# Export snapshot to S3 (for cross-region backup)
aws rds start-export-task \
  --export-task-identifier "${SNAPSHOT_ID}-export" \
  --source-arn "arn:aws:rds:us-east-1:ACCOUNT:snapshot:${SNAPSHOT_ID}" \
  --s3-bucket-name $BACKUP_BUCKET \
  --iam-role-arn "arn:aws:iam::ACCOUNT:role/rds-export-role" \
  --kms-key-id "arn:aws:kms:us-east-1:ACCOUNT:key/KEY-ID"

# Clean up old snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier $DB_INSTANCE_ID \
  --snapshot-type manual \
  --query "DBSnapshots[?SnapshotCreateTime<='$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)'].DBSnapshotIdentifier" \
  --output text | \
  xargs -n 1 aws rds delete-db-snapshot --db-snapshot-identifier

echo "Backup completed: $SNAPSHOT_ID"
```

### Disaster Recovery Plan

```yaml
# RTO/RPO Targets
Recovery Time Objective (RTO): 4 hours
Recovery Point Objective (RPO): 1 hour

# Multi-Region Setup
Primary Region: us-east-1 (N. Virginia)
DR Region: us-west-2 (Oregon)

# Disaster Recovery Procedures:

1. Database Recovery:
   - Restore from automated backup (RPO: 1 hour)
   - Or restore from manual snapshot (RPO: varies)
   - Cross-region replication for major disasters

2. Application Recovery:
   - Deploy from latest Docker images in ECR
   - Use Infrastructure as Code (CloudFormation/Terraform)
   - Route traffic to DR region via Route 53 health checks

3. Data Recovery:
   - S3 cross-region replication for file storage
   - Redis cluster backup and restore
   - ElasticSearch cluster snapshots

# Failover Process:
automated_failover:
  - Route 53 health checks detect primary region failure
  - Traffic automatically routes to DR region
  - RDS read replica promoted to primary
  - Application auto-scales in DR region

manual_failover:
  - DevOps team executes runbook procedures
  - Database restored from backup in DR region
  - DNS updated to point to DR region
  - Team coordinates recovery efforts via incident management
```

This infrastructure and deployment architecture provides DevbrainAI with a robust, scalable, and highly available platform that can handle the expected growth and complexity of the application while maintaining security and operational excellence.