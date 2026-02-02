import React from "react";
import { Button } from "@/components/ui/button";

function isChunkLoadError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = (error as any)?.message;
  if (typeof message !== "string") return false;

  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Importing a module script failed") ||
    message.includes("ChunkLoadError")
  );
}

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  isChunkError: boolean;
  message?: string;
};

export class ChunkLoadErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, isChunkError: false };

  static getDerivedStateFromError(error: unknown): State {
    const chunkError = isChunkLoadError(error);
    return {
      hasError: true,
      isChunkError: chunkError,
      message: (error as any)?.message,
    };
  }

  componentDidCatch(error: unknown) {
    // Keep a breadcrumb in the console for debugging.
    // eslint-disable-next-line no-console
    console.error("Route chunk load error:", error);
  }

  private handleReload = () => {
    try {
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // If it's not a chunk-related error, don't hide it behind a generic screen.
    if (!this.state.isChunkError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground">
          <h1 className="text-lg font-semibold">Problème de chargement</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Un module de l’application n’a pas pu être chargé (souvent à cause du cache du navigateur après une mise à jour).
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={this.handleReload}>Recharger</Button>
            <p className="text-xs text-muted-foreground">
              Astuce: essayez aussi un rafraîchissement forcé (Ctrl+Shift+R / Cmd+Shift+R).
            </p>
          </div>
          {this.state.message ? (
            <pre className="mt-4 max-h-40 overflow-auto rounded bg-muted p-3 text-xs text-foreground">
              {this.state.message}
            </pre>
          ) : null}
        </div>
      </div>
    );
  }
}
