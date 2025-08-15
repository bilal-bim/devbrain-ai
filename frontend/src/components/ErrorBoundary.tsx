import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryState>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to error monitoring service in production
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
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="max-w-md w-full text-center">
      <div className="mb-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Something went wrong
      </h1>
      
      <p className="text-gray-600 mb-8 leading-relaxed">
        We've encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="primary"
          leftIcon={<RefreshCw className="w-4 h-4" />}
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
      
      {/* Error details for development */}
      {import.meta.env.DEV && error && (
        <details className="mt-8 text-left">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Error Details (Development)
          </summary>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg overflow-auto">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
              <strong>Error:</strong> {error.message}
              {'\n\n'}
              <strong>Stack:</strong>
              {error.stack}
              {errorInfo && (
                <>
                  {'\n\n'}
                  <strong>Component Stack:</strong>
                  {errorInfo.componentStack}
                </>
              )}
            </pre>
          </div>
        </details>
      )}
    </div>
  </div>
);

export default ErrorBoundary;