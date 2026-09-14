"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-surface">
          <h1 className="text-2xl font-bold mb-3 text-ink">Something went wrong</h1>
          <p className="text-ink-muted mb-6 max-w-md">
            An unexpected error occurred. You can try refreshing the page to load the latest version.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-5 py-2.5 bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition font-medium text-sm shadow-sm"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                window.location.href = window.location.pathname + '?v=' + Date.now();
              }}
              className="px-5 py-2.5 border border-surface-subtle text-ink rounded-lg hover:bg-surface-muted transition font-medium text-sm"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

