import React from "react";

type Importer<T> = () => Promise<{ default: T }>;

/**
 * Wraps React.lazy with a single automatic reload retry.
 *
 * This prevents the common blank-screen scenario when the app shell is cached
 * but a lazily-loaded chunk/module URL has changed (cache mismatch).
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: Importer<T>,
  key: string,
) {
  return React.lazy(async () => {
    const retryKey = `lazy-retry:${key}`;

    try {
      // If a previous load succeeded, clear retry flag.
      sessionStorage.removeItem(retryKey);
      return await importer();
    } catch (err) {
      const hasRetried = sessionStorage.getItem(retryKey) === "1";

      if (!hasRetried && typeof window !== "undefined") {
        sessionStorage.setItem(retryKey, "1");
        // Trigger a hard reload. We return a never-resolving promise to avoid
        // surfacing an error during the brief moment before reload happens.
        window.location.reload();
        return new Promise<{ default: T }>(() => {
          // intentionally empty
        });
      }

      // Second failure: let an ErrorBoundary handle it.
      sessionStorage.removeItem(retryKey);
      throw err;
    }
  });
}
