import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CivicFlow ErrorBoundary caught a rendering error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-12 p-8 lavender-card text-center space-y-6">
          <div className="w-16 h-16 bg-purple-100 text-purple-800 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold border border-purple-200">
            ⚠️
          </div>
          <h2 className="text-2xl font-extrabold text-purple-950 font-editorial">
            Something went wrong while displaying this case.
          </h2>
          <p className="text-slate-700 text-sm max-w-md mx-auto leading-relaxed font-medium">
            Your case data has not been deleted.
            <br />
            Please return to My Cases and try opening it again.
          </p>
          <div className="pt-2">
            <a
              href="/cases"
              className="inline-flex items-center px-6 py-3 btn-royal-primary text-xs font-extrabold rounded-xl shadow-md transition-all"
            >
              Back to My Cases
            </a>
          </div>
          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="mt-6 p-4 bg-slate-900 text-slate-200 rounded-xl text-left text-xs font-mono overflow-x-auto">
              <p className="font-bold text-rose-400">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
