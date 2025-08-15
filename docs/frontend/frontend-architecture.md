# DevbrainAI Frontend Architecture Document

## 1. Executive Summary

DevbrainAI requires a sophisticated frontend architecture that supports real-time conversational AI interfaces, dynamic data visualizations, team collaboration, and seamless integration with multiple development tools. The frontend serves as the primary user interface for founders, developers, and team members to interact with AI consultants, visualize business insights, and manage development workflows.

**Key Architectural Decisions:**
- **Framework**: React 18 with TypeScript for type safety and modern concurrent features
- **State Management**: Zustand for global state, React Query for server state
- **Styling**: TailwindCSS with custom design tokens for consistency
- **Visualization**: D3.js with React integration for interactive charts
- **Real-time**: Socket.IO client for WebSocket connections
- **Build System**: Vite for fast development and optimized production builds

## 2. Tech Stack

### Core Framework & Language
- **React**: 18.2+ (with concurrent features)
- **TypeScript**: 5.0+ (strict mode enabled)
- **Vite**: 4.3+ (build tool and dev server)
- **Node.js**: 18+ (for build tooling)

### State Management
- **Zustand**: 4.3+ (lightweight global state)
- **React Query (TanStack Query)**: 4.29+ (server state management)
- **Immer**: 10.0+ (immutable state updates)
- **Persist**: zustand/middleware/persist (state persistence)

### UI & Styling
- **TailwindCSS**: 3.3+ (utility-first CSS)
- **Headless UI**: 1.7+ (accessible components)
- **Radix UI**: 1.0+ (primitive components)
- **Framer Motion**: 10.12+ (animations and transitions)
- **Lucide React**: 0.263+ (icon library)

### Data Visualization
- **D3.js**: 7.8+ (data-driven visualizations)
- **@visx/visx**: 3.0+ (React + D3 integration)
- **Recharts**: 2.6+ (simple chart components)
- **React Flow**: 11.7+ (interactive node graphs)

### Real-time & Networking
- **Socket.IO Client**: 4.7+ (WebSocket connections)
- **GraphQL**: 16.6+ (query language)
- **Apollo Client**: 3.7+ (GraphQL client with caching)
- **Axios**: 1.4+ (HTTP client for REST endpoints)

### Form Handling & Validation
- **React Hook Form**: 7.45+ (performant forms)
- **Zod**: 3.21+ (schema validation)
- **@hookform/resolvers**: 3.1+ (form validation integration)

### Testing & Quality
- **Vitest**: 0.32+ (test runner)
- **React Testing Library**: 13.4+ (component testing)
- **MSW**: 1.2+ (API mocking)
- **Playwright**: 1.35+ (E2E testing)
- **ESLint**: 8.43+ (linting)
- **Prettier**: 2.8+ (code formatting)

### Development Tools
- **TypeScript ESLint**: 5.60+ (TypeScript linting)
- **Husky**: 8.0+ (Git hooks)
- **Lint-staged**: 13.2+ (pre-commit linting)
- **Storybook**: 7.0+ (component documentation)

## 3. Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── atoms/           # Basic building blocks
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Avatar/
│   │   └── Badge/
│   ├── molecules/       # Component combinations
│   │   ├── SearchBar/
│   │   ├── MessageBubble/
│   │   ├── UserCard/
│   │   └── StatusIndicator/
│   ├── organisms/       # Complex component groups
│   │   ├── ConversationPanel/
│   │   ├── VisualizationCanvas/
│   │   ├── ProjectDashboard/
│   │   └── TeamCollaboration/
│   └── templates/       # Page-level layouts
│       ├── AppLayout/
│       ├── ConversationLayout/
│       └── DashboardLayout/
├── features/            # Feature-based organization
│   ├── conversation/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── visualization/
│   ├── project-management/
│   ├── team-collaboration/
│   ├── context-export/
│   └── analytics/
├── pages/               # Route components
│   ├── HomePage/
│   ├── ConversationPage/
│   ├── ProjectPage/
│   ├── TeamPage/
│   └── SettingsPage/
├── hooks/               # Shared custom hooks
│   ├── useAuth.ts
│   ├── useWebSocket.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── stores/              # Global state stores
│   ├── authStore.ts
│   ├── conversationStore.ts
│   ├── projectStore.ts
│   └── uiStore.ts
├── services/            # API and external services
│   ├── api/
│   │   ├── graphql/
│   │   ├── rest/
│   │   └── websocket/
│   ├── auth/
│   └── storage/
├── utils/               # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── helpers.ts
├── types/               # TypeScript type definitions
│   ├── api.ts
│   ├── conversation.ts
│   ├── project.ts
│   └── user.ts
├── styles/              # Global styles and tokens
│   ├── globals.css
│   ├── components.css
│   └── utilities.css
├── assets/              # Static assets
│   ├── images/
│   ├── icons/
│   └── animations/
├── config/              # Configuration files
│   ├── env.ts
│   ├── constants.ts
│   └── theme.ts
└── lib/                 # Third-party library configurations
    ├── apollo.ts
    ├── socket.ts
    └── d3-utils.ts
```

## 4. Component Architecture

### Atomic Design System

#### Atoms (Basic Building Blocks)
```typescript
// Button Component Example
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  onClick
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors";
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
    ghost: "hover:bg-gray-100 text-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], {
        'opacity-50 cursor-not-allowed': disabled || loading
      })}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner className="mr-2" />}
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};
```

#### Molecules (Component Combinations)
```typescript
// MessageBubble Component
interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
    aiModel?: 'claude' | 'qwen' | 'deepseek';
    timestamp: Date;
    metadata?: Record<string, any>;
  };
  onRegenerate?: () => void;
  onEdit?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  onEdit
}) => {
  const isUser = message.role === 'user';
  const isAI = message.role === 'assistant';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-blue-50 ml-12" : "bg-white",
        isAI && "border border-gray-200"
      )}
    >
      <Avatar
        src={isUser ? undefined : getAIAvatar(message.aiModel)}
        fallback={isUser ? 'U' : 'AI'}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-900">
            {isUser ? 'You' : `${message.aiModel || 'AI'} Assistant`}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(message.timestamp)}
          </span>
        </div>
        <div className="prose prose-sm max-w-none">
          <MarkdownRenderer content={message.content} />
        </div>
        {isAI && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateIcon />}
              onClick={onRegenerate}
            >
              Regenerate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<EditIcon />}
              onClick={onEdit}
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

#### Organisms (Complex Components)
```typescript
// ConversationPanel Component
export const ConversationPanel: React.FC<ConversationPanelProps> = ({
  conversationId,
  onVisualizationUpdate
}) => {
  const { messages, sendMessage, isLoading } = useConversation(conversationId);
  const { isConnected } = useWebSocket();
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">AI Business Consultant</h2>
          <div className="flex items-center gap-2">
            <ConnectionStatus isConnected={isConnected} />
            <AIModelSelector />
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessagesList
          messages={messages}
          onMessageRegenerate={handleMessageRegenerate}
          onVisualizationTrigger={onVisualizationUpdate}
        />
        {isLoading && <TypingIndicator />}
      </div>
      
      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200">
        <MessageInput
          onSendMessage={sendMessage}
          disabled={isLoading}
          placeholder="Tell me about your business idea..."
          supportedFormats={['text', 'voice', 'file']}
        />
      </div>
    </div>
  );
};
```

### Conversational UI Components

#### MessageInput Component
```typescript
interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  supportedFormats?: ('text' | 'voice' | 'file')[];
  maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  supportedFormats = ['text'],
  maxLength = 4000
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const { startRecording, stopRecording, transcript } = useVoiceInput();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || attachments.length > 0) {
      onSendMessage(content, attachments);
      setContent('');
      setAttachments([]);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          {/* File Attachments Preview */}
          {attachments.length > 0 && (
            <AttachmentsPreview
              files={attachments}
              onRemove={(index) => 
                setAttachments(files => files.filter((_, i) => i !== index))
              }
            />
          )}
          
          {/* Text Input */}
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={Math.min(Math.max(content.split('\n').length, 1), 4)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-400">
              {content.length}/{maxLength}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {supportedFormats.includes('file') && (
            <FileUploadButton
              onFilesSelected={setAttachments}
              accept=".pdf,.doc,.docx,.txt,.md"
              multiple
            />
          )}
          
          {supportedFormats.includes('voice') && (
            <VoiceRecordButton
              isRecording={isRecording}
              onStartRecording={() => {
                setIsRecording(true);
                startRecording();
              }}
              onStopRecording={() => {
                setIsRecording(false);
                const result = stopRecording();
                if (result) {
                  setContent(prev => prev + result);
                }
              }}
            />
          )}
          
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={disabled || (!content.trim() && attachments.length === 0)}
            leftIcon={<SendIcon />}
          >
            Send
          </Button>
        </div>
      </div>
    </form>
  );
};
```

### Real-time Visualization Components

#### VisualizationCanvas Component
```typescript
interface VisualizationCanvasProps {
  data: VisualizationData;
  type: 'market-analysis' | 'user-journey' | 'competitive-matrix' | 'progress-chart';
  interactive?: boolean;
  onDataPointClick?: (dataPoint: any) => void;
  className?: string;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  data,
  type,
  interactive = true,
  onDataPointClick,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Handle container resize
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // D3.js visualization rendering
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render
    
    switch (type) {
      case 'market-analysis':
        renderMarketBubbleChart(svg, data, dimensions, {
          interactive,
          onDataPointClick
        });
        break;
      case 'user-journey':
        renderUserJourneyFlow(svg, data, dimensions, {
          interactive,
          onDataPointClick
        });
        break;
      case 'competitive-matrix':
        renderCompetitiveMatrix(svg, data, dimensions, {
          interactive,
          onDataPointClick
        });
        break;
      case 'progress-chart':
        renderProgressChart(svg, data, dimensions, {
          interactive,
          onDataPointClick
        });
        break;
    }
  }, [data, type, dimensions, interactive, onDataPointClick]);
  
  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full min-h-[400px] bg-white rounded-lg border", className)}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      />
      
      {/* Loading state */}
      {!data && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Spinner />
            <span>Generating visualization...</span>
          </div>
        </div>
      )}
    </div>
  );
};
```

#### D3.js Visualization Utilities
```typescript
// Market Bubble Chart Implementation
export const renderMarketBubbleChart = (
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: MarketAnalysisData,
  dimensions: { width: number; height: number },
  options: VisualizationOptions
) => {
  const { width, height } = dimensions;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data.opportunities, d => d.competition) as [number, number])
    .range([0, innerWidth])
    .nice();
    
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data.opportunities, d => d.growthRate) as [number, number])
    .range([innerHeight, 0])
    .nice();
    
  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(data.opportunities, d => d.marketSize) as [number, number])
    .range([10, 50]);
    
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  // Container
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
    
  // Axes
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(xScale))
    .append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 35)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Competition Level");
    
  g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", -innerHeight / 2)
    .attr("fill", "black")
    .style("text-anchor", "middle")
    .text("Growth Rate (%)");
    
  // Bubbles
  const bubbles = g.selectAll(".bubble")
    .data(data.opportunities)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", d => xScale(d.competition))
    .attr("cy", d => yScale(d.growthRate))
    .attr("r", 0)
    .attr("fill", (d, i) => colorScale(i.toString()))
    .attr("opacity", 0.7)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", options.interactive ? "pointer" : "default");
    
  // Animate bubble appearance
  bubbles.transition()
    .duration(1000)
    .delay((d, i) => i * 100)
    .attr("r", d => sizeScale(d.marketSize));
    
  // Interactive features
  if (options.interactive) {
    bubbles
      .on("mouseover", function(event, d) {
        // Tooltip
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "visualization-tooltip")
          .style("opacity", 0);
          
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
          
        tooltip.html(`
          <strong>${d.name}</strong><br/>
          Market Size: $${d.marketSize}M<br/>
          Growth Rate: ${d.growthRate}%<br/>
          Competition: ${d.competition}/10
        `)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
          
        // Highlight effect
        d3.select(this)
          .transition()
          .duration(100)
          .attr("stroke-width", 4)
          .attr("opacity", 1);
      })
      .on("mouseout", function() {
        d3.selectAll(".visualization-tooltip").remove();
        d3.select(this)
          .transition()
          .duration(100)
          .attr("stroke-width", 2)
          .attr("opacity", 0.7);
      })
      .on("click", function(event, d) {
        if (options.onDataPointClick) {
          options.onDataPointClick(d);
        }
      });
  }
  
  // Labels
  g.selectAll(".bubble-label")
    .data(data.opportunities)
    .enter()
    .append("text")
    .attr("class", "bubble-label")
    .attr("x", d => xScale(d.competition))
    .attr("y", d => yScale(d.growthRate))
    .attr("dy", "0.35em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "500")
    .style("fill", "white")
    .style("pointer-events", "none")
    .text(d => d.name)
    .style("opacity", 0)
    .transition()
    .delay((d, i) => i * 100 + 1000)
    .duration(500)
    .style("opacity", 1);
};
```

## 5. State Management Strategy

### Zustand Store Architecture

#### Global State Structure
```typescript
// Main Application Store
interface AppState {
  // Authentication
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  
  // UI State
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
  
  // Current Conversation
  conversation: ConversationState;
  setConversation: (conversation: ConversationState) => void;
  
  // Active Project
  project: ProjectState;
  setProject: (project: ProjectState) => void;
  
  // WebSocket Connection
  socket: SocketState;
  setSocket: (socket: SocketState) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Authentication state
        auth: {
          user: null,
          token: null,
          isAuthenticated: false,
          subscriptionTier: 'free'
        },
        setAuth: (auth) => set({ auth }),
        
        // UI state
        ui: {
          theme: 'light',
          sidebarOpen: true,
          activePanel: 'conversation',
          loading: false,
          notifications: []
        },
        setUI: (ui) => set((state) => ({ 
          ui: { ...state.ui, ...ui } 
        })),
        
        // Conversation state
        conversation: {
          id: null,
          messages: [],
          isLoading: false,
          selectedAI: 'claude',
          context: {}
        },
        setConversation: (conversation) => set({ conversation }),
        
        // Project state
        project: {
          id: null,
          name: '',
          status: 'active',
          teamMembers: [],
          contextItems: [],
          progressEvents: []
        },
        setProject: (project) => set({ project }),
        
        // Socket state
        socket: {
          isConnected: false,
          connectionId: null,
          lastPing: null
        },
        setSocket: (socket) => set({ socket })
      }),
      {
        name: 'devbrain-app-state',
        partialize: (state) => ({
          auth: state.auth,
          ui: {
            theme: state.ui.theme,
            sidebarOpen: state.ui.sidebarOpen
          }
        })
      }
    )
  )
);
```

#### Feature-Specific Stores
```typescript
// Conversation Store
interface ConversationStoreState {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  
  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  createConversation: (projectId: string) => string;
  setActiveConversation: (conversationId: string) => void;
  
  // Selectors
  getActiveConversation: () => Conversation | null;
  getConversationMessages: (conversationId: string) => Message[];
}

export const useConversationStore = create<ConversationStoreState>()(
  devtools((set, get) => ({
    conversations: new Map(),
    activeConversationId: null,
    
    addMessage: (conversationId, message) => set((state) => {
      const conversations = new Map(state.conversations);
      const conversation = conversations.get(conversationId);
      if (conversation) {
        conversations.set(conversationId, {
          ...conversation,
          messages: [...conversation.messages, message],
          updatedAt: new Date()
        });
      }
      return { conversations };
    }),
    
    updateMessage: (conversationId, messageId, updates) => set((state) => {
      const conversations = new Map(state.conversations);
      const conversation = conversations.get(conversationId);
      if (conversation) {
        const messages = conversation.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        );
        conversations.set(conversationId, {
          ...conversation,
          messages,
          updatedAt: new Date()
        });
      }
      return { conversations };
    }),
    
    createConversation: (projectId) => {
      const conversationId = generateId();
      const conversation: Conversation = {
        id: conversationId,
        projectId,
        sessionId: generateSessionId(),
        status: 'active',
        messages: [],
        totalMessages: 0,
        contextGenerated: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      set((state) => ({
        conversations: new Map(state.conversations).set(conversationId, conversation),
        activeConversationId: conversationId
      }));
      
      return conversationId;
    },
    
    setActiveConversation: (conversationId) => set({
      activeConversationId: conversationId
    }),
    
    getActiveConversation: () => {
      const { conversations, activeConversationId } = get();
      return activeConversationId ? conversations.get(activeConversationId) || null : null;
    },
    
    getConversationMessages: (conversationId) => {
      const { conversations } = get();
      const conversation = conversations.get(conversationId);
      return conversation ? conversation.messages : [];
    }
  }))
);
```

### React Query for Server State

#### API Client Configuration
```typescript
// Apollo Client Setup for GraphQL
export const apolloClient = new ApolloClient({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  cache: new InMemoryCache({
    typePolicies: {
      Project: {
        fields: {
          messages: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            }
          }
        }
      }
    }
  }),
  link: from([
    // Error handling
    onError(({ graphQLErrors, networkError, operation, forward }) => {
      if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      }
      if (networkError) {
        console.error(`Network error: ${networkError}`);
      }
    }),
    
    // Authentication
    setContext((_, { headers }) => {
      const token = useAppStore.getState().auth.token;
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        }
      };
    }),
    
    // WebSocket link for subscriptions
    split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    )
  ])
});

// React Query Client Setup
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
});
```

#### Custom Hooks for API Operations
```typescript
// Conversation Hooks
export const useConversation = (conversationId: string) => {
  const { data: conversation, isLoading, error } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => fetchConversation(conversationId),
    enabled: !!conversationId
  });
  
  const sendMessageMutation = useMutation({
    mutationFn: (message: CreateMessageInput) => sendMessage(conversationId, message),
    onMutate: async (newMessage) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['conversation', conversationId] });
      
      const previousConversation = queryClient.getQueryData(['conversation', conversationId]);
      
      queryClient.setQueryData(['conversation', conversationId], (old: any) => ({
        ...old,
        messages: [...(old?.messages || []), {
          id: `temp-${Date.now()}`,
          content: newMessage.content,
          role: 'user',
          createdAt: new Date(),
          isTemporary: true
        }]
      }));
      
      return { previousConversation };
    },
    onError: (err, newMessage, context) => {
      // Rollback on error
      if (context?.previousConversation) {
        queryClient.setQueryData(['conversation', conversationId], context.previousConversation);
      }
    },
    onSettled: () => {
      // Refetch to get the latest data
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    }
  });
  
  const sendMessage = useCallback((content: string, attachments?: File[]) => {
    sendMessageMutation.mutate({ content, attachments });
  }, [sendMessageMutation]);
  
  return {
    conversation,
    messages: conversation?.messages || [],
    isLoading: isLoading || sendMessageMutation.isPending,
    error,
    sendMessage
  };
};

// Project Management Hooks
export const useProject = (projectId: string) => {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId
  });
  
  const updateProjectMutation = useMutation({
    mutationFn: (updates: UpdateProjectInput) => updateProject(projectId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    }
  });
  
  return {
    project,
    isLoading,
    updateProject: updateProjectMutation.mutate,
    isUpdating: updateProjectMutation.isPending
  };
};

// Context Export Hooks
export const useContextExport = () => {
  const exportContextMutation = useMutation({
    mutationFn: ({ projectId, format }: { projectId: string; format: ExportFormat }) =>
      exportContext(projectId, format),
    onSuccess: (data) => {
      // Trigger download
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  });
  
  return {
    exportContext: exportContextMutation.mutate,
    isExporting: exportContextMutation.isPending,
    error: exportContextMutation.error
  };
};
```

## 6. Routing & Navigation Strategy

### Router Configuration
```typescript
// Route definitions
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: "auth",
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "signup", element: <SignupPage /> },
          { path: "callback", element: <AuthCallbackPage /> }
        ]
      },
      {
        path: "app",
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />
          },
          {
            path: "projects",
            children: [
              { index: true, element: <ProjectsPage /> },
              { path: "new", element: <NewProjectPage /> },
              {
                path: ":projectId",
                element: <ProjectLayout />,
                children: [
                  { index: true, element: <ProjectOverviewPage /> },
                  { path: "conversation", element: <ConversationPage /> },
                  { path: "analytics", element: <AnalyticsPage /> },
                  { path: "team", element: <TeamPage /> },
                  { path: "export", element: <ExportPage /> }
                ]
              }
            ]
          },
          {
            path: "library",
            children: [
              { index: true, element: <ContextLibraryPage /> },
              { path: ":packId", element: <ContextPackPage /> }
            ]
          },
          {
            path: "settings",
            element: <SettingsPage />
          }
        ]
      }
    ]
  }
]);

// Protected Route Component
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAppStore(state => state.auth);
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

// App Layout with Navigation
const AppLayout: React.FC = () => {
  const { user, isAuthenticated } = useAppStore(state => state.auth);
  const { sidebarOpen } = useAppStore(state => state.ui);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {isAuthenticated && (
        <Sidebar 
          isOpen={sidebarOpen} 
          user={user}
          onToggle={() => useAppStore.getState().setUI({ 
            sidebarOpen: !sidebarOpen 
          })}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {isAuthenticated && <TopNavigation />}
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Global UI Elements */}
      <NotificationToast />
      <CommandPalette />
    </div>
  );
};
```

### Deep Linking Strategy
```typescript
// URL structure for sharing and bookmarking
interface AppRoutes {
  // Public routes
  home: "/";
  login: "/auth/login";
  signup: "/auth/signup";
  
  // Protected routes
  dashboard: "/app/dashboard";
  projects: "/app/projects";
  newProject: "/app/projects/new";
  
  // Project-specific routes with deep linking
  project: "/app/projects/:projectId";
  conversation: "/app/projects/:projectId/conversation";
  conversationDeep: "/app/projects/:projectId/conversation/:sessionId";
  analytics: "/app/projects/:projectId/analytics";
  team: "/app/projects/:projectId/team";
  export: "/app/projects/:projectId/export/:format";
  
  // Context library
  library: "/app/library";
  contextPack: "/app/library/:packId";
  
  // Settings
  settings: "/app/settings";
}

// URL parameter helpers
export const generateProjectUrl = (projectId: string, path?: string) => {
  const base = `/app/projects/${projectId}`;
  return path ? `${base}/${path}` : base;
};

export const generateConversationUrl = (projectId: string, sessionId?: string) => {
  const base = `/app/projects/${projectId}/conversation`;
  return sessionId ? `${base}/${sessionId}` : base;
};

// URL state synchronization
export const useUrlSync = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setProject, setConversation } = useAppStore();
  
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    
    // Extract project ID from URL
    const projectIndex = pathSegments.indexOf('projects');
    if (projectIndex !== -1 && pathSegments[projectIndex + 1]) {
      const projectId = pathSegments[projectIndex + 1];
      setProject({ id: projectId });
      
      // Extract conversation session ID
      const conversationIndex = pathSegments.indexOf('conversation');
      if (conversationIndex !== -1 && pathSegments[conversationIndex + 1]) {
        const sessionId = pathSegments[conversationIndex + 1];
        setConversation({ sessionId });
      }
    }
  }, [location.pathname, setProject, setConversation]);
  
  return { navigate, location };
};
```

## 7. Real-time Features Implementation

### WebSocket Integration
```typescript
// WebSocket Hook
export const useWebSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { auth, setSocket: setSocketState } = useAppStore();
  
  useEffect(() => {
    if (!auth.token) return;
    
    const newSocket = io(import.meta.env.VITE_WS_ENDPOINT, {
      auth: {
        token: auth.token
      },
      transports: ['websocket', 'polling']
    });
    
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setSocketState({
        isConnected: true,
        connectionId: newSocket.id,
        lastPing: new Date()
      });
    });
    
    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
      setSocketState({
        isConnected: false,
        connectionId: null,
        lastPing: null
      });
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [auth.token, setSocketState]);
  
  const emit = useCallback((event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);
  
  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socket) {
      socket.on(event, handler);
      return () => socket.off(event, handler);
    }
  }, [socket]);
  
  return { socket, isConnected, emit, on };
};

// Real-time conversation updates
export const useRealtimeConversation = (conversationId: string) => {
  const { on } = useWebSocket();
  const queryClient = useQueryClient();
  const { addMessage } = useConversationStore();
  
  useEffect(() => {
    if (!conversationId) return;
    
    const unsubscribeMessage = on('message-received', (message: Message) => {
      if (message.conversationId === conversationId) {
        // Update local store
        addMessage(conversationId, message);
        
        // Update React Query cache
        queryClient.setQueryData(['conversation', conversationId], (old: any) => ({
          ...old,
          messages: [...(old?.messages || []), message]
        }));
      }
    });
    
    const unsubscribeVisualization = on('visualization-update', (data: VisualizationData) => {
      if (data.conversationId === conversationId) {
        // Trigger visualization re-render
        queryClient.setQueryData(['visualization', conversationId], data);
      }
    });
    
    return () => {
      unsubscribeMessage?.();
      unsubscribeVisualization?.();
    };
  }, [conversationId, on, addMessage, queryClient]);
};

// Progress tracking updates
export const useRealtimeProgress = (projectId: string) => {
  const { on } = useWebSocket();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!projectId) return;
    
    const unsubscribe = on('progress-update', (progressEvent: ProgressEvent) => {
      if (progressEvent.projectId === projectId) {
        // Update project cache
        queryClient.setQueryData(['project', projectId], (old: any) => ({
          ...old,
          progressEvents: [...(old?.progressEvents || []), progressEvent],
          updatedAt: new Date()
        }));
        
        // Show notification
        toast.info(`Progress update: ${progressEvent.event_type}`);
      }
    });
    
    return unsubscribe;
  }, [projectId, on, queryClient]);
};
```

### Optimistic UI Updates
```typescript
// Optimistic message sending
export const useOptimisticMessages = (conversationId: string) => {
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const { messages } = useConversation(conversationId);
  
  const addOptimisticMessage = useCallback((content: string) => {
    const optimisticMessage: Message = {
      id: `optimistic-${Date.now()}`,
      conversationId,
      role: 'user',
      content,
      createdAt: new Date(),
      isOptimistic: true
    };
    
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    
    // Remove after successful send or timeout
    setTimeout(() => {
      setOptimisticMessages(prev => 
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
    }, 30000); // 30 second timeout
    
    return optimisticMessage.id;
  }, [conversationId]);
  
  const removeOptimisticMessage = useCallback((messageId: string) => {
    setOptimisticMessages(prev => 
      prev.filter(msg => msg.id !== messageId)
    );
  }, []);
  
  // Combine real and optimistic messages
  const allMessages = useMemo(() => {
    return [...messages, ...optimisticMessages].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, optimisticMessages]);
  
  return {
    messages: allMessages,
    addOptimisticMessage,
    removeOptimisticMessage
  };
};

// Progress tracking with optimistic updates
export const useOptimisticProgress = (projectId: string) => {
  const [optimisticEvents, setOptimisticEvents] = useState<ProgressEvent[]>([]);
  const { project } = useProject(projectId);
  
  const addOptimisticProgress = useCallback((eventType: string, eventData: any) => {
    const optimisticEvent: ProgressEvent = {
      id: `optimistic-${Date.now()}`,
      projectId,
      eventType,
      eventData,
      source: 'manual',
      createdAt: new Date(),
      isOptimistic: true
    };
    
    setOptimisticEvents(prev => [...prev, optimisticEvent]);
    
    return optimisticEvent.id;
  }, [projectId]);
  
  const removeOptimisticEvent = useCallback((eventId: string) => {
    setOptimisticEvents(prev => 
      prev.filter(event => event.id !== eventId)
    );
  }, []);
  
  const allProgressEvents = useMemo(() => {
    const realEvents = project?.progressEvents || [];
    return [...realEvents, ...optimisticEvents].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [project?.progressEvents, optimisticEvents]);
  
  return {
    progressEvents: allProgressEvents,
    addOptimisticProgress,
    removeOptimisticEvent
  };
};
```

## 8. UI/UX Patterns

### Form Validation & Error Handling
```typescript
// Form validation with Zod schemas
const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  industry: z.string().min(1, 'Industry is required'),
  targetUsers: z.array(z.string()).min(1, 'At least one target user required'),
  techStack: z.object({
    frontend: z.string().optional(),
    backend: z.string().optional(),
    database: z.string().optional(),
    hosting: z.string().optional()
  }).optional()
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

// Project form component with validation
export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    control
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: initialData,
    mode: 'onChange'
  });
  
  const [targetUsers, setTargetUsers] = useState<string[]>(initialData?.targetUsers || []);
  
  const onFormSubmit = (data: ProjectFormData) => {
    onSubmit({ ...data, targetUsers });
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Name
        </label>
        <input
          {...register('name')}
          type="text"
          className={cn(
            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.name ? "border-red-500" : "border-gray-300"
          )}
          placeholder="Enter your project name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className={cn(
            "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            errors.description ? "border-red-500" : "border-gray-300"
          )}
          placeholder="Describe your project (optional)"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>
      
      {/* Industry Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <Controller
          name="industry"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select your industry"
            >
              <SelectContent>
                <SelectItem value="saas">SaaS</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="fintech">Fintech</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.industry && (
          <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
        )}
      </div>
      
      {/* Target Users */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Users
        </label>
        <TagInput
          value={targetUsers}
          onChange={setTargetUsers}
          placeholder="Add target user types (e.g., freelancers, small businesses)"
          suggestions={[
            'Freelancers',
            'Small businesses',
            'Startups',
            'Enterprise',
            'Students',
            'Developers',
            'Designers'
          ]}
        />
        {targetUsers.length === 0 && (
          <p className="mt-1 text-sm text-red-600">At least one target user is required</p>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end space-x-3">
        <Button variant="ghost" type="button">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!isValid || isLoading}
          loading={isLoading}
        >
          {initialData ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
};
```

### Loading States & Skeletons
```typescript
// Skeleton components for different content types
export const MessageSkeleton: React.FC = () => (
  <div className="flex gap-3 p-4">
    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
      <div className="space-y-1">
        <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
      </div>
    </div>
  </div>
);

export const VisualizationSkeleton: React.FC = () => (
  <div className="w-full h-96 bg-gray-50 rounded-lg p-6 animate-pulse">
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2" />
        <div className="h-3 bg-gray-200 rounded w-24 mx-auto" />
      </div>
    </div>
  </div>
);

export const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-3 bg-gray-200 rounded w-20" />
      </div>
      <div className="w-6 h-6 bg-gray-200 rounded" />
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
    </div>
    <div className="flex items-center justify-between mt-6">
      <div className="flex -space-x-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-6 h-6 bg-gray-200 rounded-full" />
        ))}
      </div>
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  </div>
);

// Loading states hook
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);
  
  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);
  
  return { setLoading, isLoading };
};
```

### Error Boundaries & Error Handling
```typescript
// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<
  PropsWithChildren<{ fallback?: ComponentType<ErrorBoundaryState> }>,
  ErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{ fallback?: ComponentType<ErrorBoundaryState> }>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to error monitoring service
    if (import.meta.env.PROD) {
      // Sentry.captureException(error, { contexts: { errorInfo } });
    }
    
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent {...this.state} />;
    }
    
    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorBoundaryState> = ({ error, errorInfo }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md mx-auto text-center">
      <div className="mb-4">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
        </div>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>
      <p className="text-gray-600 mb-6">
        We've encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
      </p>
      <div className="space-x-3">
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
        >
          Go Back
        </Button>
      </div>
      
      {import.meta.env.DEV && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error Details (Development)
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
            {error?.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// Error handling hook
export const useErrorHandler = () => {
  const navigate = useNavigate();
  
  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    // Show user-friendly error message
    toast.error(
      errorMessage.includes('Network Error') 
        ? 'Connection error. Please check your internet connection.'
        : 'An unexpected error occurred. Please try again.'
    );
    
    // Handle specific error types
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      // Redirect to login
      navigate('/auth/login');
    }
  }, [navigate]);
  
  return { handleError };
};
```

## 9. Performance Optimization

### Code Splitting Strategy
```typescript
// Route-based code splitting
const HomePage = lazy(() => import('../pages/HomePage'));
const ConversationPage = lazy(() => import('../pages/ConversationPage'));
const ProjectPage = lazy(() => import('../pages/ProjectPage'));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage'));

// Component-based code splitting
const VisualizationCanvas = lazy(() => 
  import('../components/organisms/VisualizationCanvas').then(module => ({
    default: module.VisualizationCanvas
  }))
);

const ContextLibrary = lazy(() => import('../features/context-export/ContextLibrary'));

// Feature-based code splitting with loading boundaries
export const LazyVisualizationCanvas: React.FC<VisualizationCanvasProps> = (props) => (
  <ErrorBoundary fallback={VisualizationErrorFallback}>
    <Suspense fallback={<VisualizationSkeleton />}>
      <VisualizationCanvas {...props} />
    </Suspense>
  </ErrorBoundary>
);

// Dynamic imports for heavy libraries
export const useDynamicD3 = () => {
  const [d3, setD3] = useState<typeof import('d3') | null>(null);
  const [loading, setLoading] = useState(false);
  
  const loadD3 = useCallback(async () => {
    if (d3) return d3;
    
    setLoading(true);
    try {
      const d3Module = await import('d3');
      setD3(d3Module);
      return d3Module;
    } finally {
      setLoading(false);
    }
  }, [d3]);
  
  return { d3, loading, loadD3 };
};
```

### Memoization & React Optimizations
```typescript
// Expensive computation memoization
export const useExpensiveComputation = (data: any[], dependencies: any[]) => {
  return useMemo(() => {
    // Expensive operation
    return data.reduce((acc, item) => {
      // Complex calculation
      return acc + someExpensiveFunction(item);
    }, 0);
  }, [data, ...dependencies]);
};

// Callback memoization
export const useStableCallbacks = (handlers: Record<string, Function>) => {
  return useMemo(() => {
    return Object.keys(handlers).reduce((acc, key) => {
      acc[key] = useCallback(handlers[key], []);
      return acc;
    }, {} as Record<string, Function>);
  }, [handlers]);
};

// Component memoization
export const OptimizedMessageBubble = memo<MessageBubbleProps>(({
  message,
  onRegenerate,
  onEdit
}) => {
  // Component implementation
  return <MessageBubble {...props} />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.updatedAt === nextProps.message.updatedAt
  );
});

// Virtual scrolling for large message lists
export const VirtualizedMessageList: React.FC<{
  messages: Message[];
  onMessageAction: (messageId: string, action: string) => void;
}> = ({ messages, onMessageAction }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  const estimateItemHeight = useCallback((index: number) => {
    // Estimate based on message content length
    const message = messages[index];
    const baseHeight = 80;
    const contentLines = Math.ceil(message.content.length / 80);
    return baseHeight + (contentLines * 20);
  }, [messages]);
  
  const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div
      ref={listRef}
      className="h-full overflow-y-auto"
      onScroll={handleScroll}
    >
      <div style={{ height: `${getTotalHeight()}px` }}>
        <div style={{ transform: `translateY(${getOffsetTop()}px)` }}>
          {visibleMessages.map((message) => (
            <OptimizedMessageBubble
              key={message.id}
              message={message}
              onRegenerate={() => onMessageAction(message.id, 'regenerate')}
              onEdit={() => onMessageAction(message.id, 'edit')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### Bundle Size Management
```typescript
// Bundle analyzer configuration (vite.config.ts)
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['framer-motion', '@headlessui/react'],
          'chart-vendor': ['d3', '@visx/visx'],
          'form-vendor': ['react-hook-form', 'zod'],
          
          // Feature chunks
          'conversation': ['./src/features/conversation'],
          'visualization': ['./src/features/visualization'],
          'project-management': ['./src/features/project-management']
        }
      }
    },
    chunkSizeWarningLimit: 1000 // 1MB warning limit
  }
});

// Tree shaking for large libraries
import { select, selectAll, scaleLinear, scaleOrdinal } from 'd3';
// Instead of: import * as d3 from 'd3';

// Dynamic imports for rarely used features
export const useAdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  
  const loadAnalytics = useCallback(async () => {
    if (analytics) return analytics;
    
    const { AdvancedAnalytics } = await import('./AdvancedAnalytics');
    setAnalytics(AdvancedAnalytics);
    return AdvancedAnalytics;
  }, [analytics]);
  
  return { analytics, loadAnalytics };
};
```

## 10. Testing Strategies

### Unit Testing Setup
```typescript
// Test utilities setup
export const createMockStore = (initialState: Partial<AppState> = {}) => {
  return {
    auth: {
      user: null,
      token: null,
      isAuthenticated: false,
      subscriptionTier: 'free' as const
    },
    ui: {
      theme: 'light' as const,
      sidebarOpen: true,
      activePanel: 'conversation' as const,
      loading: false,
      notifications: []
    },
    conversation: {
      id: null,
      messages: [],
      isLoading: false,
      selectedAI: 'claude' as const,
      context: {}
    },
    project: {
      id: null,
      name: '',
      status: 'active' as const,
      teamMembers: [],
      contextItems: [],
      progressEvents: []
    },
    socket: {
      isConnected: false,
      connectionId: null,
      lastPing: null
    },
    ...initialState
  };
};

export const renderWithProviders = (
  component: React.ReactElement,
  {
    store = createMockStore(),
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    }),
    ...renderOptions
  } = {}
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </StoreProvider>
    </QueryClientProvider>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
};

// Component testing examples
describe('MessageBubble', () => {
  const mockMessage: Message = {
    id: '1',
    conversationId: 'conv-1',
    role: 'user',
    content: 'Test message content',
    createdAt: new Date('2023-01-01'),
    metadata: {}
  };

  it('renders user message correctly', () => {
    renderWithProviders(
      <MessageBubble
        message={mockMessage}
        onRegenerate={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText('Test message content')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('shows AI controls for assistant messages', () => {
    const aiMessage = { ...mockMessage, role: 'assistant' as const, aiModel: 'claude' as const };
    const onRegenerate = vi.fn();
    const onEdit = vi.fn();

    renderWithProviders(
      <MessageBubble
        message={aiMessage}
        onRegenerate={onRegenerate}
        onEdit={onEdit}
      />
    );

    const regenerateButton = screen.getByText('Regenerate');
    const editButton = screen.getByText('Edit');

    expect(regenerateButton).toBeInTheDocument();
    expect(editButton).toBeInTheDocument();

    fireEvent.click(regenerateButton);
    expect(onRegenerate).toHaveBeenCalledTimes(1);

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('formats timestamp correctly', () => {
    renderWithProviders(
      <MessageBubble
        message={mockMessage}
        onRegenerate={vi.fn()}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText(/Jan 1, 2023/)).toBeInTheDocument();
  });
});

describe('ConversationPanel', () => {
  it('renders conversation messages', async () => {
    const mockMessages = [
      { ...mockMessage, id: '1', content: 'First message' },
      { ...mockMessage, id: '2', content: 'Second message', role: 'assistant' as const }
    ];

    // Mock the useConversation hook
    vi.mocked(useConversation).mockReturnValue({
      conversation: { id: 'conv-1', messages: mockMessages },
      messages: mockMessages,
      isLoading: false,
      error: null,
      sendMessage: vi.fn()
    });

    renderWithProviders(<ConversationPanel conversationId="conv-1" />);

    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });
  });
});
```

### Integration Testing
```typescript
// MSW (Mock Service Worker) setup for API mocking
export const handlers = [
  graphql.query('GetConversation', (req, res, ctx) => {
    return res(
      ctx.data({
        conversation: {
          id: 'conv-1',
          projectId: 'proj-1',
          messages: [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Test message',
              createdAt: '2023-01-01T00:00:00Z'
            }
          ],
          status: 'active'
        }
      })
    );
  }),

  graphql.mutation('SendMessage', (req, res, ctx) => {
    const { content } = req.variables;
    return res(
      ctx.data({
        sendMessage: {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: `AI response to: ${content}`,
          createdAt: new Date().toISOString()
        }
      })
    );
  }),

  rest.post('/api/export/:projectId/:format', (req, res, ctx) => {
    return res(
      ctx.json({
        filename: 'project-context.zip',
        content: 'mock-file-content',
        mimeType: 'application/zip'
      })
    );
  })
];

export const server = setupServer(...handlers);

// Integration test examples
describe('Conversation Flow Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('completes full conversation flow', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <MemoryRouter initialEntries={['/app/projects/proj-1/conversation']}>
        <Routes>
          <Route
            path="/app/projects/:projectId/conversation"
            element={<ConversationPage />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    // Send a new message
    const messageInput = screen.getByPlaceholderText('Tell me about your business idea...');
    await user.type(messageInput, 'New test message');
    await user.click(screen.getByText('Send'));

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText('AI response to: New test message')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('handles WebSocket real-time updates', async () => {
    const mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      id: 'test-socket-id',
      connected: true
    };

    // Mock Socket.IO
    vi.mocked(io).mockReturnValue(mockSocket as any);

    renderWithProviders(<ConversationPage />);

    // Simulate incoming message via WebSocket
    const messageHandler = mockSocket.on.mock.calls.find(
      call => call[0] === 'message-received'
    )?.[1];

    act(() => {
      messageHandler?.({
        id: 'ws-msg-1',
        conversationId: 'conv-1',
        role: 'assistant',
        content: 'Real-time message',
        createdAt: new Date().toISOString()
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Real-time message')).toBeInTheDocument();
    });
  });
});
```

### End-to-End Testing
```typescript
// Playwright E2E test setup
import { test, expect } from '@playwright/test';

test.describe('DevbrainAI Conversation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('auth-token', 'mock-token');
    });

    await page.goto('/app/projects/new');
  });

  test('creates project and starts conversation', async ({ page }) => {
    // Fill project form
    await page.fill('[data-testid="project-name"]', 'Test Project');
    await page.fill('[data-testid="project-description"]', 'A test project for E2E testing');
    await page.selectOption('[data-testid="industry-select"]', 'saas');
    
    // Add target users
    await page.fill('[data-testid="target-users-input"]', 'developers');
    await page.press('[data-testid="target-users-input"]', 'Enter');
    
    // Submit form
    await page.click('[data-testid="create-project-button"]');
    
    // Should navigate to conversation
    await expect(page).toHaveURL(/\/app\/projects\/[^/]+\/conversation/);
    
    // Start conversation
    await page.fill('[data-testid="message-input"]', 'I want to build an app for freelancers');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]').first()).toBeVisible({ timeout: 10000 });
    
    // Check for visualization updates
    await expect(page.locator('[data-testid="visualization-canvas"]')).toBeVisible();
  });

  test('exports context successfully', async ({ page }) => {
    // Navigate to existing project
    await page.goto('/app/projects/test-project-id/export');
    
    // Select export format
    await page.selectOption('[data-testid="export-format"]', 'cursor');
    
    // Start download
    const downloadPromise = page.waitForDownload();
    await page.click('[data-testid="export-button"]');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/.*\.zip$/);
    
    // Check success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('team collaboration workflow', async ({ page, context }) => {
    // Owner invites team member
    await page.goto('/app/projects/test-project-id/team');
    await page.fill('[data-testid="invite-email"]', 'developer@example.com');
    await page.selectOption('[data-testid="member-role"]', 'developer');
    await page.click('[data-testid="send-invite-button"]');
    
    // Verify invitation sent
    await expect(page.locator('[data-testid="pending-invitation"]')).toContainText('developer@example.com');
    
    // Simulate team member joining (new browser context)
    const memberPage = await context.newPage();
    await memberPage.goto('/app/projects/test-project-id/join?token=mock-invite-token');
    
    // Accept invitation
    await memberPage.click('[data-testid="accept-invitation-button"]');
    
    // Verify access to project
    await expect(memberPage).toHaveURL(/\/app\/projects\/test-project-id/);
    await expect(memberPage.locator('[data-testid="project-name"]')).toBeVisible();
    
    // Check role-based permissions
    await expect(memberPage.locator('[data-testid="technical-specs"]')).toBeVisible();
    await expect(memberPage.locator('[data-testid="business-strategy"]')).not.toBeVisible();
  });
});
```

## 11. Development Guidelines

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/features/*": ["src/features/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.d.ts"
  ],
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

### Code Style Guidelines
```typescript
// Naming Conventions
// ✅ Good
export const UserProfileCard: React.FC<UserProfileCardProps> = () => {};
export const useUserAuthentication = () => {};
export const API_ENDPOINTS = {};
export type ConversationState = {};

// ❌ Bad
export const userprofilecard: React.FC = () => {};
export const UseUserAuth = () => {};
export const apiEndpoints = {};
export type conversationState = {};

// Component Props Interface
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Event Handler Naming
// ✅ Good
const handleSubmit = (event: React.FormEvent) => {};
const handleUserSelect = (userId: string) => {};
const handleMessageSend = (content: string) => {};

// ❌ Bad
const submit = () => {};
const userSelect = () => {};
const onMessageSend = () => {}; // Reserve 'on' prefix for props

// Async/Await Usage
// ✅ Good
const fetchUserData = async (userId: string): Promise<User> => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Unable to load user data');
  }
};

// Custom Hook Pattern
// ✅ Good
export const useConversationState = (conversationId: string) => {
  const [state, setState] = useState<ConversationState>();
  const [loading, setLoading] = useState(false);
  
  const actions = useMemo(() => ({
    sendMessage: async (content: string) => {
      setLoading(true);
      try {
        // Implementation
      } finally {
        setLoading(false);
      }
    }
  }), [conversationId]);
  
  return { state, loading, ...actions };
};
```

### Component Testing Standards
```typescript
// Test file naming: ComponentName.test.tsx
// Test structure: Arrange, Act, Assert

describe('Button Component', () => {
  describe('Rendering', () => {
    it('renders with correct text content', () => {
      render(<Button variant="primary">Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies correct CSS classes for variants', () => {
      const { rerender } = render(<Button variant="primary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

      rerender(<Button variant="secondary">Test</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-gray-200');
    });
  });

  describe('Interactions', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Button variant="primary" onClick={handleClick}>
          Click me
        </Button>
      );

      await user.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      
      render(
        <Button variant="primary" onClick={handleClick} disabled>
          Click me
        </Button>
      );

      await user.click(screen.getByText('Click me'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner and disables button', () => {
      render(
        <Button variant="primary" loading>
          Submit
        </Button>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Button variant="primary" disabled>
          Submit
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
```

## 12. Handoff Instructions for Frontend Development Team

### Development Environment Setup

1. **Prerequisites**
   ```bash
   # Node.js 18+ and npm 8+
   node --version  # Should be 18.0.0 or higher
   npm --version   # Should be 8.0.0 or higher
   
   # Git configuration
   git config --global user.name "Your Name"
   git config --global user.email "your.email@company.com"
   ```

2. **Project Setup**
   ```bash
   # Clone repository
   git clone https://github.com/devbrain/devbrain-frontend.git
   cd devbrain-frontend
   
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env.local
   # Edit .env.local with your specific values
   
   # Start development server
   npm run dev
   ```

3. **Required Environment Variables**
   ```env
   VITE_API_URL=http://localhost:4000/api
   VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   VITE_WS_ENDPOINT=http://localhost:4000
   VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   VITE_SENTRY_DSN=your_sentry_dsn (optional)
   ```

### Development Workflow

1. **Branch Naming Convention**
   - `feature/conversation-ui-improvements`
   - `fix/message-bubble-rendering-issue`
   - `chore/update-dependencies`

2. **Commit Message Format**
   ```
   type(scope): description
   
   Examples:
   feat(conversation): add voice input support
   fix(visualization): resolve D3 chart rendering issue
   chore(deps): update React to 18.2.0
   docs(readme): update setup instructions
   ```

3. **Pull Request Process**
   - Create feature branch from `main`
   - Implement changes with tests
   - Run linting and type checking: `npm run lint && npm run type-check`
   - Run tests: `npm run test`
   - Create PR with descriptive title and details
   - Request review from at least one team member
   - Merge after approval and CI passes

### Component Development Standards

1. **File Structure for New Components**
   ```
   src/components/atoms/NewComponent/
   ├── index.ts                 # Export barrel
   ├── NewComponent.tsx         # Main component
   ├── NewComponent.test.tsx    # Tests
   ├── NewComponent.stories.tsx # Storybook stories (optional)
   └── NewComponent.module.css  # Styles (if needed)
   ```

2. **Component Template**
   ```typescript
   // src/components/atoms/NewComponent/NewComponent.tsx
   import React from 'react';
   import { cn } from '@/utils/cn';
   
   export interface NewComponentProps {
     // Define props with JSDoc comments
     /** The variant of the component */
     variant: 'primary' | 'secondary';
     /** Whether the component is disabled */
     disabled?: boolean;
     /** Component children */
     children: React.ReactNode;
     /** CSS class name */
     className?: string;
   }
   
   export const NewComponent: React.FC<NewComponentProps> = ({
     variant,
     disabled = false,
     children,
     className
   }) => {
     return (
       <div
         className={cn(
           'base-styles',
           variant === 'primary' && 'primary-styles',
           variant === 'secondary' && 'secondary-styles',
           disabled && 'disabled-styles',
           className
         )}
       >
         {children}
       </div>
     );
   };
   ```

3. **Testing Requirements**
   - Every component must have unit tests
   - Test all props and their variations
   - Test user interactions (clicks, form inputs, etc.)
   - Test accessibility features
   - Maintain >90% test coverage

### Key Implementation Priorities

1. **Phase 1: Core Infrastructure (Week 1-2)**
   - Set up project structure and build system
   - Implement authentication flow with Auth0
   - Create basic layout components (AppLayout, Sidebar, Navigation)
   - Set up state management with Zustand
   - Implement basic routing structure

2. **Phase 2: Conversation Interface (Week 3-4)**
   - Build MessageBubble and MessageInput components
   - Implement ConversationPanel with real-time updates
   - Add WebSocket integration for live messaging
   - Create typing indicators and message states
   - Add file upload and voice input support

3. **Phase 3: Visualization System (Week 5-6)**
   - Implement VisualizationCanvas with D3.js
   - Create market analysis bubble charts
   - Build user journey flow diagrams
   - Add competitive analysis matrix visualization
   - Implement progress tracking charts

4. **Phase 4: Project Management (Week 7-8)**
   - Build project creation and management UI
   - Implement team collaboration features
   - Create context export interface
   - Add analytics dashboard
   - Implement settings and user profile

### Integration Points

1. **Backend API Integration**
   - GraphQL endpoint: `/graphql`
   - REST endpoints for file uploads and exports
   - WebSocket connection for real-time features
   - Authentication headers with JWT tokens

2. **Third-party Services**
   - Auth0 for authentication
   - Socket.IO for real-time communication
   - Sentry for error monitoring (production)

3. **Mobile Considerations**
   - Responsive design with Tailwind breakpoints
   - Touch-friendly interactions
   - PWA capabilities for offline conversation drafts

### Quality Standards

1. **Code Quality Metrics**
   - TypeScript strict mode compliance
   - ESLint and Prettier formatting
   - >90% test coverage for components
   - Performance budget: <100KB initial bundle

2. **Accessibility Requirements**
   - WCAG 2.1 AA compliance
   - Semantic HTML structure
   - Keyboard navigation support
   - Screen reader compatibility
   - Color contrast ratios >4.5:1

3. **Performance Targets**
   - First Contentful Paint: <1.5s
   - Largest Contentful Paint: <2.5s
   - Time to Interactive: <3.5s
   - Bundle size: <500KB total

### Tools and Resources

1. **Development Tools**
   - VS Code with recommended extensions
   - React Developer Tools browser extension
   - Redux DevTools for state debugging
   - Storybook for component development

2. **Design Resources**
   - Figma design files (link to be provided)
   - Design token specifications
   - Component library documentation
   - Icon library (Lucide React)

3. **Documentation**
   - Component documentation in Storybook
   - API documentation for backend integration
   - Testing guidelines and examples
   - Performance optimization guide

### Communication Channels

1. **Daily Standups**: 9:00 AM EST via Zoom
2. **Sprint Planning**: Every 2 weeks on Fridays
3. **Code Reviews**: GitHub PR reviews within 24 hours
4. **Technical Questions**: Slack #frontend-dev channel
5. **Design Discussions**: Weekly design sync meetings

### Success Criteria

The frontend implementation will be considered successful when:

1. **Functional Requirements Met**
   - All conversation flows work smoothly
   - Real-time visualizations render correctly
   - Context export generates proper packages
   - Team collaboration features function as designed

2. **Performance Targets Achieved**
   - Page load times meet specified targets
   - Visualizations render within 3 seconds
   - No memory leaks during extended usage
   - Mobile performance acceptable on mid-range devices

3. **Quality Standards Met**
   - Test coverage >90% for all components
   - Accessibility audit passes with no major issues
   - Code review approval from senior developers
   - Production deployment successful without critical bugs

This frontend architecture provides a solid foundation for building DevbrainAI's complex conversational AI interface with real-time visualizations and collaborative features. The modular structure and comprehensive testing strategy ensure maintainability and scalability as the product grows.

The next step is for the frontend development team to begin implementation starting with Phase 1 priorities, while coordinating closely with the backend team on API specifications and real-time event handling.