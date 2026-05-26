import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: unknown) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#1a1a2e',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e0e0e0',
          gap: '16px',
          padding: '24px',
        }}>
          <p style={{ fontSize: '16px', color: '#aaa' }}>Une erreur inattendue est survenue.</p>
          {this.state.error && (
            <pre style={{
              background: '#0d1117',
              border: '1px solid #e53935',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#ef9a9a',
              maxWidth: '700px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}>
              {this.state.error.name}: {this.state.error.message}
              {'\n'}{this.state.error.stack?.split('\n').slice(1, 5).join('\n')}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: '#0f3460',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Recharger l'application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
