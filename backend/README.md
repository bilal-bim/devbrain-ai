# DevbrainAI Backend

A conversational AI business consultant platform backend built with NestJS, GraphQL, and PostgreSQL.

## 🚀 Features

### Core Services
- **AI Integration**: Claude (primary), Qwen, DeepSeek support
- **Conversation Management**: Real-time AI conversations with context
- **Context Generation**: MCP-compatible context creation and export
- **Project Management**: Complete project lifecycle management
- **Team Collaboration**: Real-time team features with role-based access
- **Progress Tracking**: GitHub webhook integration for development progress
- **Analytics**: Comprehensive usage and performance analytics

### Technical Highlights
- **GraphQL + REST**: Hybrid API approach for optimal performance
- **Real-time**: WebSocket support with Socket.IO
- **Caching**: Multi-layer caching with Redis
- **Queue System**: Background job processing with Bull
- **Authentication**: JWT with Auth0 integration
- **Database**: PostgreSQL with TypeORM
- **Security**: Rate limiting, input validation, encryption
- **Monitoring**: Health checks and logging with Winston

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Claude API key from Anthropic

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Configure the following required variables in `.env`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/devbrainai"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# AI Services
CLAUDE_API_KEY="your-anthropic-claude-api-key"

# Application
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

### 3. Database Setup

Create a PostgreSQL database and run the schema:

```bash
# Create database
createdb devbrainai

# Run migrations (when available)
npm run migration:run

# Or manually execute the schema
psql -d devbrainai -f ../docs/architecture/database-schema.sql
```

### 4. Redis Setup

Ensure Redis is running:

```bash
# macOS with Homebrew
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Docker
docker run -d -p 6379:6379 redis:7-alpine
```

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at:
- **REST API**: http://localhost:3000/api
- **GraphQL Playground**: http://localhost:3000/graphql
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

### Production Mode

```bash
npm run build
npm run start:prod
```

### Debug Mode

```bash
npm run start:debug
```

## 📊 API Documentation

### GraphQL Schema

The GraphQL schema includes:

- **Queries**: Projects, conversations, messages, context items, analytics
- **Mutations**: CRUD operations, AI interactions, team management
- **Subscriptions**: Real-time updates for conversations and progress

Example queries:

```graphql
# Get user projects
query GetProjects {
  projects {
    id
    name
    status
    conversations {
      id
      status
      totalMessages
    }
  }
}

# Send a message
mutation SendMessage($conversationId: ID!, $content: String!) {
  sendMessage(conversationId: $conversationId, content: $content) {
    id
    content
    role
    aiModel
    createdAt
  }
}

# Subscribe to conversation updates
subscription ConversationUpdates($conversationId: ID!) {
  messageAdded(conversationId: $conversationId) {
    id
    content
    role
    createdAt
  }
}
```

### REST Endpoints

Key REST endpoints:

```bash
# Authentication
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh

# Conversations
POST /api/conversations/:projectId
POST /api/conversations/:id/messages
GET  /api/conversations/:id/messages

# Health checks
GET  /health
GET  /health/database
GET  /health/redis
GET  /health/ai-services
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `CLAUDE_API_KEY` | Anthropic Claude API key | - |
| `RATE_LIMIT_TTL` | Rate limit window (seconds) | `60` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

### AI Model Configuration

Configure AI models in your environment:

```bash
# Claude (Primary)
CLAUDE_API_KEY="sk-ant-..."
CLAUDE_API_URL="https://api.anthropic.com"

# Additional models (optional)
OPENAI_API_KEY="sk-..."
QWEN_API_KEY="..."
DEEPSEEK_API_KEY="..."
```

## 📈 Monitoring and Logging

### Health Checks

Monitor application health:

```bash
curl http://localhost:3000/health
```

Response includes:
- Overall application status
- Database connectivity
- Redis connectivity  
- AI services availability
- Response times and uptime

### Logging

Logs are structured using Winston:

```typescript
// User actions
logger.logUserAction(userId, 'conversation_created', metadata);

// API calls
logger.logApiCall('POST', '/api/conversations', 201, 150, userId);

// AI interactions
logger.logAiInteraction('claude', 1500, 0.02, true);
```

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Test Coverage

```bash
npm run test:cov
```

### E2E Tests

```bash
npm run test:e2e
```

## 🏗️ Architecture

### Module Structure

```
src/
├── common/           # Shared utilities and guards
├── config/           # Configuration files
├── modules/
│   ├── auth/         # Authentication & authorization
│   ├── users/        # User management
│   ├── projects/     # Project lifecycle
│   ├── conversations/# AI conversations
│   ├── ai/           # AI service integration
│   ├── context/      # Context management
│   ├── team/         # Team collaboration
│   ├── progress/     # Progress tracking
│   └── health/       # Health monitoring
└── database/         # Migrations and seeds
```

### Core Services

1. **AI Service**: Manages multiple AI providers with response caching
2. **Conversation Service**: Handles chat sessions and context management
3. **Context Service**: Generates MCP-compatible packages
4. **Cache Service**: Multi-layer caching with Redis
5. **Logger Service**: Structured logging with Winston

### Database Design

The database schema includes:

- **Users**: Authentication and subscription management
- **Projects**: Business project containers
- **Conversations**: AI chat sessions
- **Messages**: Individual chat messages
- **Context Items**: MCP-formatted development contexts
- **Team Members**: Collaboration management
- **Progress Events**: Development tracking

## 🔐 Security

### Authentication

- JWT tokens with refresh mechanism
- Auth0 integration support
- Role-based access control

### API Security

- Rate limiting by subscription tier
- Input validation with Joi schemas
- SQL injection protection with TypeORM
- CORS configuration
- Helmet security headers

### Data Protection

- Password hashing with bcrypt
- Sensitive data encryption
- Webhook signature verification
- Environment variable protection

## 📦 Deployment

### Docker (Recommended)

```bash
# Build image
docker build -t devbrainai-backend .

# Run with docker-compose
docker-compose up -d
```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set production environment variables**:
   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   ```

3. **Run database migrations**:
   ```bash
   npm run migration:run
   ```

4. **Start the application**:
   ```bash
   npm run start:prod
   ```

### AWS Deployment

For AWS deployment:

1. **ECS with Fargate**: Containerized deployment
2. **RDS PostgreSQL**: Managed database
3. **ElastiCache Redis**: Managed caching
4. **Application Load Balancer**: Traffic distribution
5. **CloudWatch**: Logging and monitoring

## 🔄 Development Workflow

### 1. Adding New Features

```bash
# Generate a new module
nest g module features/my-feature
nest g service features/my-feature
nest g resolver features/my-feature
```

### 2. Database Changes

```bash
# Generate migration
npm run migration:generate -- -n MyMigration

# Run migrations
npm run migration:run
```

### 3. Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npx tsc --noEmit
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes and add tests**
4. **Ensure all tests pass**: `npm run test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Style

- Follow NestJS conventions
- Use TypeScript strict mode
- Write comprehensive tests
- Document GraphQL schemas
- Use semantic commit messages

## 📝 API Examples

### Authentication

```typescript
// Register
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!',
    name: 'John Doe'
  })
});

// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const { accessToken } = await loginResponse.json();
```

### AI Conversations

```typescript
// Start conversation
const conversation = await fetch('/api/conversations/project-id', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Send message
const message = await fetch(`/api/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'I need help building a SaaS platform for freelancers',
    aiModel: 'claude'
  })
});
```

### Real-time Subscriptions

```typescript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3000', {
  auth: { token: accessToken }
});

// Join project room
socket.emit('join-project', projectId);

// Listen for new messages
socket.on('message-received', (message) => {
  console.log('New AI response:', message);
});
```

## 📚 Additional Resources

- [NestJS Documentation](https://nestjs.com/)
- [GraphQL Schema Best Practices](https://graphql.org/learn/best-practices/)
- [TypeORM Documentation](https://typeorm.io/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Bull Queue Documentation](https://github.com/OptimalBits/bull)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: GitHub Issues
- **Documentation**: `/api/docs` endpoint
- **Health Status**: `/health` endpoint

---

**DevbrainAI Backend** - Transforming ideas into deployed MVPs through intelligent conversation.# Development Backend
