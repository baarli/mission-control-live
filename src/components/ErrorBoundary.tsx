import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that catches rendering errors and displays a fallback UI
 * instead of a white screen.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '2rem',
          }}
        >
          <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
              Noe gikk galt
            </h1>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
              Applikasjonen støtte på en feil. Prøv å laste siden på nytt.
            </p>
            <pre
              style={{
                backgroundColor: '#1e293b',
                padding: '1rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#ef4444',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: '1.5rem',
              }}
            >
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              aria-label="Last inn siden på nytt"
              style={{
                backgroundColor: '#06b6d4',
                color: '#0f172a',
                padding: '0.5rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Last inn på nytt
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
