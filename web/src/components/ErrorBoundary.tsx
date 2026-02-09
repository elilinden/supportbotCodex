"use client";

import { Component, type ReactNode } from "react";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="mx-auto max-w-lg rounded-2xl border border-ui-danger/20 bg-ui-dangerSoft p-6 text-center"
        >
          <h2 className="text-lg font-semibold text-ui-danger">
            {this.props.fallbackTitle || "Something went wrong"}
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            An unexpected error occurred. Your data is safe in local storage.
          </p>
          {this.state.error && (
            <p className="mt-2 rounded-xl bg-white p-3 text-xs text-slate-500 font-mono">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:bg-slate-50"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-full bg-ui-primary px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:opacity-95"
            >
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
