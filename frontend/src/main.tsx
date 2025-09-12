import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/consolidated.css";  // ✅ OPTIMIZED: Single consolidated CSS import
import ErrorBoundary from "./components/common/ErrorBoundary";
import { toast } from 'sonner';
// Removed test imports - unnecessary in production

// Global error catcher component - simplified without context dependencies
function GlobalErrorHandler() {
  React.useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      console.error('Unhandled error:', event.error);
      if (process.env.NODE_ENV === 'development') {
        toast.error('Application Error', {
          description: event.message || 'An unexpected error occurred'
        });
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      if (process.env.NODE_ENV === 'development') {
        toast.error('Promise Rejection', {
          description: event.reason?.message || 'An unhandled promise rejection occurred'
        });
      }
    };

    const handleOffline = () => {
      toast.warning('Connection Lost', {
        description: 'You are now offline'
      });
    };

    const handleOnline = () => {
      toast.success('Connection Restored', {
        description: 'You are back online'
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  return null;
}

// Service worker registration disabled to avoid MIME type errors
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker.register('/service-worker.js')
//       .then((registration) => {
//       })
//       .catch((registrationError) => {
//       })
//   });
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GlobalErrorHandler />
      <Suspense fallback={<div style={{padding: 24}}>Loading application...</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
);
