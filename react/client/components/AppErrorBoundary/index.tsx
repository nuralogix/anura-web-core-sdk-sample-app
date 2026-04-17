import React, { Component, ReactNode } from 'react';
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  heading: {
    color: '#dc3545',
    marginBottom: '16px',
  },
  errorMessage: {
    color: '#6c757d',
    marginBottom: '24px',
    maxWidth: '400px',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  errorDetails: {
    marginTop: '24px',
    textAlign: 'left',
    maxWidth: '600px',
  },
  summary: {
    cursor: 'pointer',
    marginBottom: '8px',
  },
  errorPre: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'auto',
    border: '1px solid #dee2e6',
  },
});

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('AppErrorBoundary caught an error:', error, errorInfo);

    // You can also log to an error reporting service here
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  override render() {
    if (this.state.hasError) {
      // Render custom fallback UI if provided, otherwise default message
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div {...stylex.props(styles.container)}>
          <h1 {...stylex.props(styles.heading)}>Something went wrong</h1>
          <p {...stylex.props(styles.errorMessage)}>
            An unexpected error occurred. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            aria-label="Refresh page to recover from error"
            {...stylex.props(styles.refreshButton)}
          >
            Refresh Page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details {...stylex.props(styles.errorDetails)} aria-labelledby="error-details-summary">
              <summary id="error-details-summary" {...stylex.props(styles.summary)}>Error Details (Development)</summary>
              <pre {...stylex.props(styles.errorPre)}>{this.state.error.toString()}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
