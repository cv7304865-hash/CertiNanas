import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="bg-[rgba(33,6,53,0.65)] backdrop-blur-[20px] border border-[rgba(255,255,255,0.2)] rounded-2xl p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Algo salió mal</h3>
          <p className="text-sm text-[#6667AB] mb-4">
            No se pudo cargar el buscador. Intenta de nuevo.
          </p>
          <button onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F6A5C0] text-[#210635] text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
