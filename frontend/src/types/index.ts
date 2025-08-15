// Core application types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  subscriptionTier: 'free' | 'starter' | 'pro' | 'enterprise';
}

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activePanel: 'conversation' | 'visualization' | 'analytics';
  loading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Conversation types
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  aiModel?: 'claude' | 'qwen' | 'deepseek';
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, any>;
  isOptimistic?: boolean;
  isTemporary?: boolean;
}

export interface Conversation {
  id: string;
  projectId: string;
  sessionId: string;
  status: 'active' | 'completed' | 'archived';
  messages: Message[];
  totalMessages: number;
  contextGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationState {
  id: string | null;
  messages: Message[];
  isLoading: boolean;
  selectedAI: 'claude' | 'qwen' | 'deepseek';
  context: Record<string, any>;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  ownerId: string;
  teamMembers: TeamMember[];
  contextItems: ContextItem[];
  progressEvents: ProgressEvent[];
  healthScore: number;
  completionPercentage: number;
  estimatedCompletion?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  projectId: string;
  role: 'owner' | 'developer' | 'designer' | 'qa' | 'viewer';
  permissions: string[];
  joinedAt: Date;
  user: User;
}

export interface ContextItem {
  id: string;
  projectId: string;
  type: 'feature_spec' | 'tech_spec' | 'user_story' | 'test_scenario' | 'market_analysis';
  title: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'reviewed' | 'approved';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressEvent {
  id: string;
  projectId: string;
  eventType: string;
  eventData: Record<string, any>;
  source: 'manual' | 'webhook' | 'api';
  userId?: string;
  createdAt: Date;
  isOptimistic?: boolean;
}

// Visualization types
export interface VisualizationData {
  id: string;
  type: 'market-analysis' | 'user-journey' | 'competitive-matrix' | 'progress-chart' | 'feature-impact';
  title: string;
  data: any;
  conversationId?: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketOpportunity {
  id: string;
  name: string;
  marketSize: number; // in millions
  growthRate: number; // percentage
  competition: number; // scale 1-10
  difficulty: number; // scale 1-10
  category: string;
  description: string;
}

export interface MarketAnalysisData {
  totalMarketSize: number;
  opportunities: MarketOpportunity[];
  competitors: Competitor[];
  trends: MarketTrend[];
}

export interface Competitor {
  id: string;
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
  targetUsers: string;
  url?: string;
}

export interface MarketTrend {
  id: string;
  name: string;
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  description: string;
}

// Context Library types
export interface ContextPack {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  setupTime: number; // in hours
  rating: number;
  downloadCount: number;
  successRate: number;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  preview: {
    images: string[];
    codeSnippets: Array<{
      filename: string;
      language: string;
      code: string;
    }>;
  };
  requirements: {
    tools: string[];
    dependencies: string[];
    platforms: string[];
  };
  contents: {
    files: Array<{
      path: string;
      type: 'file' | 'directory';
      content?: string;
    }>;
    documentation: string;
    setupGuide: string;
  };
  reviews: ContextPackReview[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContextPackReview {
  id: string;
  packId: string;
  userId: string;
  rating: number;
  title: string;
  content: string;
  implementationStatus: 'successful' | 'partial' | 'failed';
  helpfulCount: number;
  createdAt: Date;
  user: User;
}

// WebSocket types
export interface SocketState {
  isConnected: boolean;
  connectionId: string | null;
  lastPing: Date | null;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

// API types
export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface APIError {
  message: string;
  code?: string;
  field?: string;
}

// Form types
export interface CreateProjectInput {
  name: string;
  description?: string;
  industry: string;
  targetUsers: string[];
  techStack?: {
    frontend?: string;
    backend?: string;
    database?: string;
    hosting?: string;
  };
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: Project['status'];
}

export interface CreateMessageInput {
  content: string;
  attachments?: File[];
  metadata?: Record<string, any>;
}

export interface ExportFormat {
  format: 'cursor' | 'replit' | 'claude-cli' | 'pdf' | 'zip';
  includeFiles: string[];
  customizations?: Record<string, any>;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export interface ErrorProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// Hook types
export interface UseConversationResult {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: Error | null;
  sendMessage: (content: string, attachments?: File[]) => Promise<void>;
  regenerateMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
}

export interface UseProjectResult {
  project: Project | null;
  isLoading: boolean;
  error: Error | null;
  updateProject: (updates: UpdateProjectInput) => Promise<void>;
  isUpdating: boolean;
}

export interface UseWebSocketResult {
  socket: any | null;
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => (() => void) | undefined;
}