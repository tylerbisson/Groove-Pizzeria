import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Groove Pizzeria error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'Lekton, monospace',
            color: 'var(--gp-grey)',
            gap: 16,
          }}
        >
          <p style={{ margin: 0 }}>Something went wrong.</p>
          <button
            style={{
              fontFamily: 'Lekton, monospace',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--gp-grey)',
              textDecoration: 'underline',
              fontSize: 'inherit',
            }}
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
