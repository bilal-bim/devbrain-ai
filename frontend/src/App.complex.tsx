import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Pages
import { HomePage } from '@/pages/HomePage';
import { ConversationPage } from '@/pages/ConversationPage';

// Components
import { Spinner } from '@/components/atoms/Spinner';
import ErrorBoundary from '@/components/ErrorBoundary';

// Hooks and stores
import { useAppStore } from '@/stores';

// Styles
import '@/styles/globals.css';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Spinner size="lg" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { auth } = useAppStore();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Auth pages (lazy loaded)
const AuthPage = React.lazy(() => 
  import('@/pages/AuthPage').then(module => ({ default: module.AuthPage }))
);

const DashboardPage = React.lazy(() =>
  import('@/pages/DashboardPage').then(module => ({ default: module.DashboardPage }))
);

const ProjectPage = React.lazy(() =>
  import('@/pages/ProjectPage').then(module => ({ default: module.ProjectPage }))
);

const ContextLibraryPage = React.lazy(() =>
  import('@/pages/ContextLibraryPage').then(module => ({ default: module.ContextLibraryPage }))
);

const SettingsPage = React.lazy(() =>
  import('@/pages/SettingsPage').then(module => ({ default: module.SettingsPage }))
);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              
              {/* Auth routes */}
              <Route path="/auth/*" element={
                <Suspense fallback={<LoadingFallback />}>
                  <AuthPage />
                </Suspense>
              } />

              {/* Protected app routes */}
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      <Route path="dashboard" element={<DashboardPage />} />
                      
                      {/* Project routes */}
                      <Route path="projects/:projectId" element={<ProjectPage />} />
                      <Route path="projects/:projectId/conversation/:conversationId?" element={<ConversationPage />} />
                      
                      {/* Context library */}
                      <Route path="library" element={<ContextLibraryPage />} />
                      <Route path="library/:packId" element={<ContextLibraryPage />} />
                      
                      {/* Settings */}
                      <Route path="settings" element={<SettingsPage />} />
                      
                      {/* Default redirect */}
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </ProtectedRoute>
              } />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Global components */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </ErrorBoundary>
      </Router>

      {/* React Query DevTools (only in development) */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export default App;