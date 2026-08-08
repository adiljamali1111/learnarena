import React from 'react';

interface State {
  hasError: boolean;
}

export class DenErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry?: () => void },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <p className="font-heading text-lg font-bold text-foreground mb-2">Couldn&apos;t load this tool</p>
            <p className="text-sm text-muted mb-4">Something went wrong. Please try again.</p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 rounded-xl bg-primary text-dark-base text-xs font-heading font-bold hover:bg-primary-light transition-colors cursor-pointer"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}