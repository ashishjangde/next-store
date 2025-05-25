/**
 * React 19 Error Handler Utility
 * Provides compatibility fixes for React 19 error boundary callback issues
 */

// Global error handler for React 19 compatibility
export const handleReact19Errors = () => {
  // Store original error handlers
  const originalConsoleError = console.error;
  const originalWindowError = window.onerror;
  const originalUnhandledRejection = window.onunhandledrejection;

  // Enhanced error filter for React 19 specific issues
  const isReact19InternalError = (error: any): boolean => {
    if (!error) return false;
    
    const errorString = error.toString();
    const errorStack = error.stack || '';
    
    // Filter out React 19 error boundary callback errors
    const react19Patterns = [
      'error-boundary-callbacks',
      'queueMicroTask',
      'handleClientError',
      'handleConsoleError',
      'AppDevOverlayErrorBoundary',
      'ErrorBoundaryHandler'
    ];
    
    return react19Patterns.some(pattern => 
      errorString.includes(pattern) || errorStack.includes(pattern)
    );
  };

  // Override console.error to filter React 19 internal errors
  console.error = (...args: any[]) => {
    const firstArg = args[0];
    
    // Skip React 19 internal errors in development
    if (process.env.NODE_ENV === 'development' && isReact19InternalError(firstArg)) {
      return;
    }
    
    // Call original console.error for other errors
    originalConsoleError.apply(console, args);
  };

  // Override window.onerror to handle React 19 errors gracefully
  window.onerror = (message, source, lineno, colno, error) => {
    if (isReact19InternalError(error)) {
      // Silently handle React 19 internal errors
      return true;
    }
    
    // Call original handler for other errors
    if (originalWindowError) {
      return originalWindowError.call(window, message, source, lineno, colno, error);
    }
    
    return false;
  };

  // Override unhandled rejection handler
  window.onunhandledrejection = (event) => {
    if (isReact19InternalError(event.reason)) {
      event.preventDefault();
      return;
    }
    
    // Call original handler for other rejections
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
  };

  // Return cleanup function
  return () => {
    console.error = originalConsoleError;
    window.onerror = originalWindowError;
    window.onunhandledrejection = originalUnhandledRejection;
  };
};

// Initialize error handling when this module is imported
if (typeof window !== 'undefined') {
  handleReact19Errors();
}
