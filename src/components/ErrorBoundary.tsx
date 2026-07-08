import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Something went wrong</h1>
          <p className="text-gray-500 max-w-md mx-auto">
            We encountered an unexpected error. Our team has been notified. 
            Please try refreshing the page or return to the homepage.
          </p>
          
          <div className="flex items-center gap-4 pt-4">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            <Button onClick={() => window.location.href = "/"}>
              Return Home
            </Button>
          </div>
          
          {import.meta.env.DEV && this.state.error && (
            <div className="mt-8 text-left bg-red-50 p-4 rounded-xl text-red-900 border border-red-200 overflow-auto max-w-3xl w-full">
              <p className="font-mono text-sm font-semibold mb-2">{this.state.error.toString()}</p>
              <pre className="font-mono text-xs whitespace-pre-wrap">{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
