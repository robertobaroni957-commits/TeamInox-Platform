import { lazy, ComponentType } from 'react';

/**
 * A wrapper for React.lazy that retries the import if it fails.
 * Useful for handling "Failed to fetch dynamically imported module" errors
 * which can happen during network instability or after a new deployment.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retriesLeft = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await componentImport();
    } catch (error) {
      if (retriesLeft > 0) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        return (lazyWithRetry(componentImport, retriesLeft - 1, interval * 2) as any)._payload._result();
      }
      
      // If we are out of retries, we might want to force a page reload 
      // if it's a chunk load error (which usually means a new version was deployed)
      console.error('Failed to load module after multiple retries:', error);
      
      // Check if it's likely a chunk load error
      const isChunkLoadError = error instanceof Error && 
        (error.message.includes('dynamically imported module') || 
         error.message.includes('Loading chunk'));
      
      if (isChunkLoadError) {
        // Optional: you could force a reload here, but it might be better 
        // to let an ErrorBoundary handle it with a user-visible button.
        // window.location.reload();
      }

      throw error;
    }
  });
}
