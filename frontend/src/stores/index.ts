import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  AuthState, 
  UIState, 
  ConversationState, 
  Project, 
  SocketState,
  Notification,
  Message,
  Conversation
} from '@/types';

// Main Application State Interface
interface AppState {
  // Authentication
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
  logout: () => void;
  
  // UI State
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  
  // Current Conversation
  conversation: ConversationState;
  setConversation: (conversation: Partial<ConversationState>) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  clearConversation: () => void;
  
  // Active Project
  project: Project | null;
  setProject: (project: Project | null) => void;
  updateProject: (updates: Partial<Project>) => void;
  
  // WebSocket Connection
  socket: SocketState;
  setSocket: (socket: Partial<SocketState>) => void;
  
  // Actions
  resetState: () => void;
}

// Initial state values
const initialAuth: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  subscriptionTier: 'free'
};

const initialUI: UIState = {
  theme: 'light',
  sidebarOpen: true,
  activePanel: 'conversation',
  loading: false,
  notifications: []
};

const initialConversation: ConversationState = {
  id: null,
  messages: [],
  isLoading: false,
  selectedAI: 'claude',
  context: {}
};

const initialSocket: SocketState = {
  isConnected: false,
  connectionId: null,
  lastPing: null
};

// Main store with persistence
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Authentication state
        auth: initialAuth,
        setAuth: (auth) => set((state) => {
          state.auth = auth;
        }),
        logout: () => set((state) => {
          state.auth = initialAuth;
          state.conversation = initialConversation;
          state.project = null;
        }),
        
        // UI state
        ui: initialUI,
        setUI: (ui) => set((state) => {
          Object.assign(state.ui, ui);
        }),
        addNotification: (notification) => set((state) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          state.ui.notifications.push({ ...notification, id });
        }),
        removeNotification: (id) => set((state) => {
          state.ui.notifications = state.ui.notifications.filter(n => n.id !== id);
        }),
        
        // Conversation state
        conversation: initialConversation,
        setConversation: (conversation) => set((state) => {
          Object.assign(state.conversation, conversation);
        }),
        addMessage: (message) => set((state) => {
          state.conversation.messages.push(message);
        }),
        updateMessage: (messageId, updates) => set((state) => {
          const messageIndex = state.conversation.messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            Object.assign(state.conversation.messages[messageIndex], updates);
          }
        }),
        removeMessage: (messageId) => set((state) => {
          state.conversation.messages = state.conversation.messages.filter(m => m.id !== messageId);
        }),
        clearConversation: () => set((state) => {
          state.conversation = initialConversation;
        }),
        
        // Project state
        project: null,
        setProject: (project) => set((state) => {
          state.project = project;
        }),
        updateProject: (updates) => set((state) => {
          if (state.project) {
            Object.assign(state.project, updates);
          }
        }),
        
        // Socket state
        socket: initialSocket,
        setSocket: (socket) => set((state) => {
          Object.assign(state.socket, socket);
        }),
        
        // Actions
        resetState: () => set((state) => {
          state.auth = initialAuth;
          state.ui = initialUI;
          state.conversation = initialConversation;
          state.project = null;
          state.socket = initialSocket;
        })
      })),
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
    ),
    {
      name: 'DevbrainAI Store'
    }
  )
);

// Conversation Store - for managing multiple conversations
interface ConversationStoreState {
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  
  // Actions
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  createConversation: (projectId: string) => string;
  setActiveConversation: (conversationId: string) => void;
  archiveConversation: (conversationId: string) => void;
  
  // Selectors
  getActiveConversation: () => Conversation | null;
  getConversationMessages: (conversationId: string) => Message[];
  getProjectConversations: (projectId: string) => Conversation[];
}

export const useConversationStore = create<ConversationStoreState>()(
  devtools(
    immer((set, get) => ({
      conversations: new Map(),
      activeConversationId: null,
      
      addMessage: (conversationId, message) => set((state) => {
        const conversation = state.conversations.get(conversationId);
        if (conversation) {
          conversation.messages.push(message);
          conversation.totalMessages = conversation.messages.length;
          conversation.updatedAt = new Date();
        }
      }),
      
      updateMessage: (conversationId, messageId, updates) => set((state) => {
        const conversation = state.conversations.get(conversationId);
        if (conversation) {
          const messageIndex = conversation.messages.findIndex(msg => msg.id === messageId);
          if (messageIndex !== -1) {
            Object.assign(conversation.messages[messageIndex], updates);
            conversation.updatedAt = new Date();
          }
        }
      }),
      
      createConversation: (projectId) => {
        const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const conversation: Conversation = {
          id: conversationId,
          projectId,
          sessionId,
          status: 'active',
          messages: [],
          totalMessages: 0,
          contextGenerated: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        set((state) => {
          state.conversations.set(conversationId, conversation);
          state.activeConversationId = conversationId;
        });
        
        return conversationId;
      },
      
      setActiveConversation: (conversationId) => set((state) => {
        state.activeConversationId = conversationId;
      }),
      
      archiveConversation: (conversationId) => set((state) => {
        const conversation = state.conversations.get(conversationId);
        if (conversation) {
          conversation.status = 'archived';
          conversation.updatedAt = new Date();
        }
      }),
      
      getActiveConversation: () => {
        const { conversations, activeConversationId } = get();
        return activeConversationId ? conversations.get(activeConversationId) || null : null;
      },
      
      getConversationMessages: (conversationId) => {
        const { conversations } = get();
        const conversation = conversations.get(conversationId);
        return conversation ? conversation.messages : [];
      },
      
      getProjectConversations: (projectId) => {
        const { conversations } = get();
        return Array.from(conversations.values()).filter(conv => conv.projectId === projectId);
      }
    })),
    {
      name: 'DevbrainAI Conversation Store'
    }
  )
);

// Visualization Store - for managing charts and visualizations
interface VisualizationStoreState {
  visualizations: Map<string, any>;
  activeVisualization: string | null;
  
  // Actions
  addVisualization: (id: string, data: any) => void;
  updateVisualization: (id: string, data: any) => void;
  removeVisualization: (id: string) => void;
  setActiveVisualization: (id: string | null) => void;
  
  // Selectors
  getVisualization: (id: string) => any | null;
  getConversationVisualizations: (conversationId: string) => any[];
}

export const useVisualizationStore = create<VisualizationStoreState>()(
  devtools(
    immer((set, get) => ({
      visualizations: new Map(),
      activeVisualization: null,
      
      addVisualization: (id, data) => set((state) => {
        state.visualizations.set(id, data);
      }),
      
      updateVisualization: (id, data) => set((state) => {
        const existing = state.visualizations.get(id);
        if (existing) {
          state.visualizations.set(id, { ...existing, ...data });
        }
      }),
      
      removeVisualization: (id) => set((state) => {
        state.visualizations.delete(id);
        if (state.activeVisualization === id) {
          state.activeVisualization = null;
        }
      }),
      
      setActiveVisualization: (id) => set((state) => {
        state.activeVisualization = id;
      }),
      
      getVisualization: (id) => {
        const { visualizations } = get();
        return visualizations.get(id) || null;
      },
      
      getConversationVisualizations: (conversationId) => {
        const { visualizations } = get();
        return Array.from(visualizations.values()).filter(viz => viz.conversationId === conversationId);
      }
    })),
    {
      name: 'DevbrainAI Visualization Store'
    }
  )
);

// Store hooks for easier usage
export const useAuth = () => useAppStore(state => state.auth);
export const useUI = () => useAppStore(state => state.ui);
export const useCurrentProject = () => useAppStore(state => state.project);
export const useSocket = () => useAppStore(state => state.socket);

// Selectors
export const selectIsAuthenticated = (state: AppState) => state.auth.isAuthenticated;
export const selectCurrentUser = (state: AppState) => state.auth.user;
export const selectIsLoading = (state: AppState) => state.ui.loading;
export const selectNotifications = (state: AppState) => state.ui.notifications;