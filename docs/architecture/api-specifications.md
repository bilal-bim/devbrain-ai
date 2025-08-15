# DevbrainAI API Specifications

## Overview

DevbrainAI uses a hybrid API approach combining GraphQL for complex data queries and mutations with REST endpoints for specific integrations and file operations. This document outlines all API endpoints, schemas, and integration patterns.

## GraphQL API Schema

### Core Types

```graphql
scalar DateTime
scalar JSON
scalar Upload

# User Management
type User {
  id: ID!
  email: String!
  name: String
  avatarUrl: String
  subscriptionTier: SubscriptionTier!
  subscriptionStatus: SubscriptionStatus!
  onboardingCompleted: Boolean!
  preferences: JSON
  projects: [Project!]!
  teamMemberships: [TeamMember!]!
  usageQuotas: [UsageQuota!]!
  createdAt: DateTime!
  lastLoginAt: DateTime
}

# Project Management
type Project {
  id: ID!
  name: String!
  description: String
  status: ProjectStatus!
  industry: String
  targetUsers: [String!]!
  techStack: TechStack
  githubRepo: String
  projectType: ProjectType!
  estimatedTimeline: Int
  estimatedBudget: Float
  marketAnalysis: JSON
  competitiveLandscape: JSON
  mvpScope: JSON
  owner: User!
  conversations: [Conversation!]!
  contextItems: [ContextItem!]!
  teamMembers: [TeamMember!]!
  progressEvents: [ProgressEvent!]!
  featureProgress: [FeatureProgress!]!
  integrations: [Integration!]!
  analytics: ProjectAnalytics
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Conversation Management
type Conversation {
  id: ID!
  project: Project!
  sessionId: String
  status: ConversationStatus!
  messages: [Message!]!
  totalMessages: Int!
  totalTokens: Int!
  contextGenerated: Boolean!
  conversationStage: ConversationStage!
  satisfactionRating: Int
  feedback: String
  metadata: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Message {
  id: ID!
  conversation: Conversation!
  role: MessageRole!
  content: String!
  aiModel: AIModel
  messageType: MessageType!
  metadata: JSON
  responseTimeMs: Int
  qualityScore: Float
  createdAt: DateTime!
}

# Context Management
type ContextItem {
  id: ID!
  project: Project!
  type: String!
  category: String
  title: String!
  description: String
  content: JSON!
  tags: [String!]!
  priority: Int!
  status: ContextItemStatus!
  implementationNotes: String
  version: Int!
  parent: ContextItem
  children: [ContextItem!]!
  createdBy: User
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Team Collaboration
type TeamMember {
  id: ID!
  project: Project!
  user: User!
  role: TeamRole!
  permissions: JSON
  invitationToken: String
  invitedBy: User
  invitedAt: DateTime!
  joinedAt: DateTime
  lastActiveAt: DateTime
  status: TeamMemberStatus!
}

# Progress Tracking
type ProgressEvent {
  id: ID!
  project: Project!
  user: User
  eventType: String!
  eventCategory: ProgressEventCategory!
  title: String
  description: String
  eventData: JSON!
  impactScore: Int!
  source: ProgressEventSource!
  sourceId: String
  relatedContextItems: [ContextItem!]!
  createdAt: DateTime!
}

type FeatureProgress {
  id: ID!
  project: Project!
  contextItem: ContextItem
  featureName: String!
  featureType: FeatureType!
  status: FeatureStatus!
  priority: Priority!
  estimatedEffort: Int
  actualEffort: Int
  assignedTo: User
  completionPercentage: Int!
  testCoveragePercentage: Float!
  qualityMetrics: JSON
  blockers: [String!]!
  startDate: DateTime
  targetDate: DateTime
  completionDate: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

# Context Library
type ContextPack {
  id: ID!
  title: String!
  slug: String!
  description: String
  category: String
  subcategory: String
  tags: [String!]!
  content: JSON!
  readmeContent: String
  techRequirements: JSON
  compatibilityMatrix: JSON
  setupInstructions: String
  demoUrl: String
  githubUrl: String
  qualityScore: Float
  difficultyLevel: DifficultyLevel!
  estimatedSetupTime: Int
  downloadCount: Int!
  rating: Float
  ratingCount: Int!
  featured: Boolean!
  premium: Boolean!
  version: String!
  changelog: String
  createdBy: String!
  verified: Boolean!
  reviews: [ContextPackReview!]!
  createdAt: DateTime!
  lastUpdatedAt: DateTime!
}

type ContextPackDownload {
  id: ID!
  contextPack: ContextPack!
  user: User
  project: Project
  downloadFormat: String
  implementationReported: Boolean!
  implementationSuccess: Boolean
  implementationFeedback: String
  setupTimeMinutes: Int
  rating: Int
  reviewText: String
  downloadedAt: DateTime!
  implementedAt: DateTime
}

# Analytics and Usage
type ProjectAnalytics {
  project: Project!
  timeRange: TimeRange!
  conversationMetrics: ConversationMetrics!
  progressMetrics: ProgressMetrics!
  teamMetrics: TeamMetrics!
  aiUsageMetrics: AIUsageMetrics!
}

type ConversationMetrics {
  totalConversations: Int!
  averageDuration: Float!
  completionRate: Float!
  satisfactionRating: Float!
  messageCount: Int!
  tokenUsage: Int!
}

type ProgressMetrics {
  featuresTotal: Int!
  featuresCompleted: Int!
  featuresInProgress: Int!
  completionPercentage: Float!
  averageFeatureTime: Float!
  velocityTrend: [VelocityPoint!]!
}

type TeamMetrics {
  activeMembers: Int!
  contributorCount: Int!
  collaborationScore: Float!
  activityTrend: [ActivityPoint!]!
}

type AIUsageMetrics {
  totalRequests: Int!
  totalTokens: Int!
  averageResponseTime: Float!
  modelDistribution: [ModelUsage!]!
  costBreakdown: CostBreakdown!
}

# AI Usage Tracking
type AIUsage {
  id: ID!
  user: User
  project: Project
  conversation: Conversation
  aiModel: AIModel!
  requestType: AIRequestType!
  promptTokens: Int!
  completionTokens: Int!
  totalTokens: Int!
  costUsd: Float!
  responseTimeMs: Int!
  success: Boolean!
  errorType: String
  errorMessage: String
  createdAt: DateTime!
}

# Notifications
type Notification {
  id: ID!
  user: User!
  project: Project
  notificationType: String!
  title: String!
  message: String
  data: JSON
  channel: NotificationChannel!
  priority: NotificationPriority!
  read: Boolean!
  delivered: Boolean!
  deliveryAttempts: Int!
  scheduledFor: DateTime
  deliveredAt: DateTime
  readAt: DateTime
  createdAt: DateTime!
}

# Enums
enum SubscriptionTier {
  FREE
  STARTER
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  TRIALING
  PAST_DUE
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
  ON_HOLD
}

enum ProjectType {
  WEB_APP
  MOBILE_APP
  SAAS
  ECOMMERCE
  OTHER
}

enum ConversationStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
  PAUSED
}

enum ConversationStage {
  DISCOVERY
  ANALYSIS
  SPECIFICATION
  COMPLETION
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  VISUALIZATION
}

enum AIModel {
  CLAUDE
  QWEN
  DEEPSEEK
}

enum ContextItemStatus {
  DRAFT
  REVIEWED
  APPROVED
  IMPLEMENTED
}

enum TeamRole {
  OWNER
  ADMIN
  DEVELOPER
  DESIGNER
  QA
  VIEWER
}

enum TeamMemberStatus {
  INVITED
  ACTIVE
  INACTIVE
  REMOVED
}

enum FeatureType {
  FEATURE
  BUG
  ENHANCEMENT
  REFACTOR
}

enum FeatureStatus {
  PLANNED
  IN_PROGRESS
  TESTING
  COMPLETED
  BLOCKED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ProgressEventCategory {
  DEVELOPMENT
  TESTING
  DEPLOYMENT
  BUSINESS
}

enum ProgressEventSource {
  GITHUB
  MANUAL
  AI_ANALYSIS
  WEBHOOK
}

enum DifficultyLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum NotificationChannel {
  IN_APP
  EMAIL
  SLACK
  WEBHOOK
}

enum NotificationPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum AIRequestType {
  CONVERSATION
  ANALYSIS
  GENERATION
  VALIDATION
}

enum TimeRange {
  LAST_24_HOURS
  LAST_7_DAYS
  LAST_30_DAYS
  LAST_90_DAYS
  LAST_YEAR
  ALL_TIME
}

enum ExportFormat {
  MCP
  CURSOR
  REPLIT
  CLAUDE_CLI
  PDF
  JSON
}

# Input Types
input CreateProjectInput {
  name: String!
  description: String
  industry: String
  targetUsers: [String!]
  projectType: ProjectType!
  estimatedTimeline: Int
  estimatedBudget: Float
  githubRepo: String
}

input UpdateProjectInput {
  name: String
  description: String
  status: ProjectStatus
  industry: String
  targetUsers: [String!]
  techStack: JSON
  githubRepo: String
  estimatedTimeline: Int
  estimatedBudget: Float
}

input SendMessageInput {
  conversationId: ID!
  content: String!
  aiModel: AIModel
  messageType: MessageType = TEXT
  files: [Upload!]
}

input CreateContextItemInput {
  projectId: ID!
  type: String!
  category: String
  title: String!
  description: String
  content: JSON!
  tags: [String!]
  priority: Int = 0
  parentId: ID
}

input InviteTeamMemberInput {
  projectId: ID!
  email: String!
  role: TeamRole!
  permissions: JSON
}

input UpdateFeatureProgressInput {
  id: ID!
  status: FeatureStatus
  completionPercentage: Int
  assignedTo: ID
  blockers: [String!]
  targetDate: DateTime
  actualEffort: Int
}

input ContextPackFilter {
  category: String
  tags: [String!]
  difficulty: DifficultyLevel
  premium: Boolean
  featured: Boolean
  search: String
  limit: Int = 20
  offset: Int = 0
}

input AnalyticsFilter {
  projectId: ID!
  timeRange: TimeRange!
  includeTeamMetrics: Boolean = false
  includeAIMetrics: Boolean = false
}
```

### Query Operations

```graphql
type Query {
  # User queries
  me: User
  user(id: ID!): User
  
  # Project queries
  projects(filter: ProjectFilter): [Project!]!
  project(id: ID!): Project
  projectAnalytics(filter: AnalyticsFilter!): ProjectAnalytics!
  
  # Conversation queries
  conversation(id: ID!): Conversation
  conversations(projectId: ID!, limit: Int = 20, offset: Int = 0): [Conversation!]!
  
  # Context queries
  contextItems(projectId: ID!, filter: ContextItemFilter): [ContextItem!]!
  contextItem(id: ID!): ContextItem
  
  # Context library queries
  contextPacks(filter: ContextPackFilter): [ContextPack!]!
  contextPack(id: ID!): ContextPack
  contextPackCategories: [String!]!
  featuredContextPacks(limit: Int = 10): [ContextPack!]!
  
  # Team queries
  teamProjects: [Project!]!
  teamMembers(projectId: ID!): [TeamMember!]!
  
  # Progress queries
  progressEvents(projectId: ID!, limit: Int = 50, offset: Int = 0): [ProgressEvent!]!
  featureProgress(projectId: ID!): [FeatureProgress!]!
  
  # Analytics queries
  userUsage(timeRange: TimeRange = LAST_30_DAYS): UserUsageStats!
  aiUsage(filter: AIUsageFilter): [AIUsage!]!
  platformAnalytics(timeRange: TimeRange!): PlatformAnalytics! # Admin only
  
  # Notification queries
  notifications(limit: Int = 20, offset: Int = 0, unreadOnly: Boolean = false): [Notification!]!
  unreadNotificationCount: Int!
  
  # Search queries
  search(query: String!, types: [SearchType!] = [PROJECT, CONTEXT_PACK], limit: Int = 10): SearchResults!
}
```

### Mutation Operations

```graphql
type Mutation {
  # User mutations
  updateProfile(input: UpdateProfileInput!): User!
  updatePreferences(preferences: JSON!): User!
  completeOnboarding: User!
  
  # Project mutations
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  archiveProject(id: ID!): Project!
  
  # Conversation mutations
  createConversation(projectId: ID!): Conversation!
  sendMessage(input: SendMessageInput!): Message!
  endConversation(id: ID!, satisfactionRating: Int, feedback: String): Conversation!
  
  # Context mutations
  createContextItem(input: CreateContextItemInput!): ContextItem!
  updateContextItem(id: ID!, input: UpdateContextItemInput!): ContextItem!
  deleteContextItem(id: ID!): Boolean!
  generateContext(projectId: ID!, types: [String!]): [ContextItem!]!
  exportContext(projectId: ID!, format: ExportFormat!): ExportResult!
  
  # Team mutations
  inviteTeamMember(input: InviteTeamMemberInput!): TeamMember!
  acceptTeamInvitation(invitationToken: String!): TeamMember!
  updateTeamMemberRole(id: ID!, role: TeamRole!, permissions: JSON): TeamMember!
  removeTeamMember(id: ID!): Boolean!
  leaveProject(projectId: ID!): Boolean!
  
  # Progress mutations
  createProgressEvent(input: CreateProgressEventInput!): ProgressEvent!
  updateFeatureProgress(input: UpdateFeatureProgressInput!): FeatureProgress!
  createFeature(input: CreateFeatureInput!): FeatureProgress!
  
  # Context pack mutations
  downloadContextPack(id: ID!, projectId: ID, format: String = "zip"): ContextPackDownload!
  rateContextPack(id: ID!, rating: Int!, reviewText: String): ContextPackReview!
  reportImplementation(downloadId: ID!, success: Boolean!, feedback: String, setupTime: Int): ContextPackDownload!
  
  # Integration mutations
  createIntegration(input: CreateIntegrationInput!): Integration!
  updateIntegration(id: ID!, configuration: JSON!): Integration!
  deleteIntegration(id: ID!): Boolean!
  testIntegration(id: ID!): IntegrationTestResult!
  
  # Notification mutations
  markNotificationRead(id: ID!): Notification!
  markAllNotificationsRead: Int! # Returns count of marked notifications
  deleteNotification(id: ID!): Boolean!
  
  # Admin mutations (restricted access)
  createContextPack(input: CreateContextPackInput!): ContextPack! # Admin only
  updateContextPack(id: ID!, input: UpdateContextPackInput!): ContextPack! # Admin only
  featureContextPack(id: ID!, featured: Boolean!): ContextPack! # Admin only
  verifyContextPack(id: ID!): ContextPack! # Admin only
}
```

### Subscription Operations

```graphql
type Subscription {
  # Project subscriptions
  projectUpdated(projectId: ID!): Project!
  conversationUpdated(conversationId: ID!): Conversation!
  messageAdded(conversationId: ID!): Message!
  
  # Progress subscriptions
  progressEventAdded(projectId: ID!): ProgressEvent!
  featureProgressUpdated(projectId: ID!): FeatureProgress!
  
  # Team subscriptions
  teamMemberJoined(projectId: ID!): TeamMember!
  teamMemberLeft(projectId: ID!): TeamMember!
  teamNotification(userId: ID!): TeamNotification!
  
  # System subscriptions
  notificationAdded(userId: ID!): Notification!
  contextPackAdded(categories: [String!]): ContextPack!
}
```

## REST API Endpoints

### Authentication & User Management

```http
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
```

### File Upload & Management

```http
POST   /api/files/upload
GET    /api/files/:id
DELETE /api/files/:id
POST   /api/files/presigned-url
```

### Context Export & Download

```http
GET    /api/context/export/:projectId/:format
POST   /api/context/import
GET    /api/context-packs/:id/download/:format
GET    /api/context-packs/:id/preview
```

### Webhooks & Integrations

```http
POST   /api/webhooks/github/:projectId
POST   /api/webhooks/stripe
POST   /api/webhooks/slack/:projectId
POST   /api/integrations/:id/test
GET    /api/integrations/:id/status
```

### Analytics & Reporting

```http
GET    /api/analytics/user/:userId
GET    /api/analytics/project/:projectId
GET    /api/analytics/platform (Admin only)
POST   /api/analytics/events
GET    /api/reports/usage/:userId
GET    /api/reports/project/:projectId/pdf
```

### Health & Monitoring

```http
GET    /api/health
GET    /api/health/database
GET    /api/health/redis
GET    /api/health/ai-services
GET    /api/metrics (Admin only)
GET    /api/version
```

### Admin Endpoints

```http
GET    /api/admin/users
GET    /api/admin/projects
GET    /api/admin/usage-stats
POST   /api/admin/context-packs
PUT    /api/admin/context-packs/:id
DELETE /api/admin/context-packs/:id
POST   /api/admin/feature-flags
GET    /api/admin/system-health
```

## API Error Handling

### GraphQL Error Format

```json
{
  "errors": [
    {
      "message": "Project not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["project"],
      "extensions": {
        "code": "PROJECT_NOT_FOUND",
        "exception": {
          "stacktrace": ["..."]
        }
      }
    }
  ],
  "data": {
    "project": null
  }
}
```

### REST Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "constraint": "Must be a valid email address"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/auth/login",
  "requestId": "req_abc123"
}
```

### Error Codes

```typescript
enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  REQUIRED_FIELD_MISSING = 'REQUIRED_FIELD_MISSING',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  CONVERSATION_NOT_FOUND = 'CONVERSATION_NOT_FOUND',
  CONTEXT_ITEM_NOT_FOUND = 'CONTEXT_ITEM_NOT_FOUND',
  
  // Business logic errors
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  
  // AI service errors
  AI_SERVICE_UNAVAILABLE = 'AI_SERVICE_UNAVAILABLE',
  AI_RESPONSE_ERROR = 'AI_RESPONSE_ERROR',
  CONTEXT_GENERATION_FAILED = 'CONTEXT_GENERATION_FAILED',
  
  // Integration errors
  GITHUB_CONNECTION_FAILED = 'GITHUB_CONNECTION_FAILED',
  WEBHOOK_VALIDATION_FAILED = 'WEBHOOK_VALIDATION_FAILED',
  
  // System errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}
```

## Authentication & Authorization

### JWT Token Structure

```json
{
  "sub": "user_uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "pro",
  "permissions": ["project:read", "project:write", "team:invite"],
  "iat": 1642262400,
  "exp": 1642348800,
  "iss": "devbrainai.com",
  "aud": "devbrainai-api"
}
```

### Permission System

```typescript
enum Permission {
  // Project permissions
  PROJECT_READ = 'project:read',
  PROJECT_WRITE = 'project:write',
  PROJECT_DELETE = 'project:delete',
  
  // Context permissions
  CONTEXT_READ = 'context:read',
  CONTEXT_WRITE = 'context:write',
  CONTEXT_EXPORT = 'context:export',
  
  // Team permissions
  TEAM_READ = 'team:read',
  TEAM_INVITE = 'team:invite',
  TEAM_MANAGE = 'team:manage',
  
  // Analytics permissions
  ANALYTICS_READ = 'analytics:read',
  ANALYTICS_ADMIN = 'analytics:admin',
  
  // Admin permissions
  ADMIN_USERS = 'admin:users',
  ADMIN_CONTENT = 'admin:content',
  ADMIN_SYSTEM = 'admin:system'
}
```

## Rate Limiting

### Rate Limit Configuration

```typescript
interface RateLimitConfig {
  endpoint: string;
  limits: {
    free: { requests: number; window: string };
    starter: { requests: number; window: string };
    pro: { requests: number; window: string };
    enterprise: { requests: number; window: string };
  };
}

const rateLimits: RateLimitConfig[] = [
  {
    endpoint: '/api/conversations/*/messages',
    limits: {
      free: { requests: 10, window: '1m' },
      starter: { requests: 60, window: '1m' },
      pro: { requests: 300, window: '1m' },
      enterprise: { requests: 1000, window: '1m' }
    }
  },
  {
    endpoint: '/api/context/export/*',
    limits: {
      free: { requests: 1, window: '1h' },
      starter: { requests: 10, window: '1h' },
      pro: { requests: 100, window: '1h' },
      enterprise: { requests: 1000, window: '1h' }
    }
  }
];
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642262460
X-RateLimit-Window: 60
X-RateLimit-Tier: starter
```

## WebSocket Events

### Connection Authentication

```typescript
// Client connection with JWT token
const socket = io('ws://api.devbrainai.com', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Event Types

```typescript
// Client to Server Events
interface ClientToServerEvents {
  'join-project': (projectId: string) => void;
  'leave-project': (projectId: string) => void;
  'send-message': (data: MessageData) => void;
  'typing-start': (conversationId: string) => void;
  'typing-stop': (conversationId: string) => void;
}

// Server to Client Events
interface ServerToClientEvents {
  'message-received': (message: Message) => void;
  'message-updated': (message: Message) => void;
  'visual-update': (data: VisualizationData) => void;
  'progress-updated': (event: ProgressEvent) => void;
  'team-member-joined': (member: TeamMember) => void;
  'team-member-left': (member: TeamMember) => void;
  'notification': (notification: Notification) => void;
  'typing': (data: { userId: string; conversationId: string; isTyping: boolean }) => void;
  'error': (error: { code: string; message: string }) => void;
}
```

## Integration Patterns

### GitHub Webhook Payload

```json
{
  "action": "opened",
  "pull_request": {
    "id": 123456,
    "title": "Add invoice creation feature",
    "body": "Implements the core invoice creation functionality",
    "state": "open",
    "commits": 3,
    "additions": 245,
    "deletions": 23,
    "changed_files": 8
  },
  "repository": {
    "full_name": "user/repo",
    "html_url": "https://github.com/user/repo"
  },
  "sender": {
    "login": "developer_username"
  }
}
```

### Stripe Webhook Integration

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_1234567890",
      "status": "active",
      "current_period_end": 1642348800,
      "items": {
        "data": [
          {
            "price": {
              "id": "price_pro_monthly",
              "nickname": "Pro Plan Monthly"
            }
          }
        ]
      }
    }
  }
}
```

This API specification provides comprehensive coverage of all DevbrainAI endpoints, data structures, and integration patterns. The hybrid GraphQL/REST approach ensures optimal performance for complex queries while maintaining simple interfaces for file operations and webhooks.