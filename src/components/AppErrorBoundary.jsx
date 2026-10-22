import { Component } from 'react';
import { getErrorInfo } from '../utils/errorCodes';

export default class AppErrorBoundary extends Component {
  state = { errorType: null };

  componentDidMount() {
    window.addEventListener('error', this.handleGlobalError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unexpected UI rendering failure:', error, errorInfo);
    this.showError('UI_RENDER_FAILURE');
  }

  handleGlobalError = (event) => {
    console.error('Unexpected application error:', event.error || event.message);
    this.showError('GLOBAL_SCRIPT_ERROR');
  };

  handleUnhandledRejection = (event) => {
    console.error('Unhandled application rejection:', event.reason);
    this.showError('UNHANDLED_REJECTION');
  };

  showError(errorType) {
    this.setState((state) => state.errorType ? null : { errorType });
  }

  render() {
    if (!this.state.errorType) return this.props.children;

    const error = getErrorInfo(this.state.errorType);
    return (
      <main style={styles.page} role="alert">
        <section style={styles.card} aria-labelledby="app-error-title">
          <p style={styles.brand}>NEBULA · ERROR</p>
          <h1 id="app-error-title" style={styles.title}>{error.title}</h1>
          <p style={styles.message}>{error.message}</p>
          <p style={styles.codeLabel}>Error code</p>
          <code style={styles.code}>{error.code}</code>
          <div style={styles.actions}>
            <button type="button" style={styles.button} onClick={() => window.location.reload()}>
              Reload page
            </button>
            <a href="/" style={styles.link}>Return home</a>
          </div>
          <p style={styles.help}>If the problem continues, share the error code with support.</p>
        </section>
      </main>
    );
  }
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: 24,
    background: 'radial-gradient(ellipse at top, #14234a 0, #080f27 62%)',
    color: '#f5f7ff',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  card: {
    width: 'min(100%, 560px)',
    padding: '40px 32px',
    border: '1px solid #29395f',
    borderRadius: 18,
    background: 'rgba(20, 33, 68, 0.92)',
    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.28)',
    textAlign: 'center',
  },
  brand: { margin: '0 0 24px', color: '#f7bd32', fontSize: 13, fontWeight: 800, letterSpacing: '0.18em' },
  title: { margin: 0, fontSize: 'clamp(26px, 6vw, 36px)' },
  message: { margin: '14px 0 26px', color: '#bac8e5', lineHeight: 1.6 },
  codeLabel: { margin: '0 0 8px', color: '#bac8e5', fontSize: 13 },
  code: { display: 'inline-block', padding: '9px 13px', borderRadius: 7, background: '#080f27', color: '#f7bd32', fontSize: 16, fontWeight: 700 },
  actions: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 28 },
  button: { padding: '11px 16px', border: 0, borderRadius: 8, background: '#2363e8', color: 'white', font: 'inherit', fontWeight: 700, cursor: 'pointer' },
  link: { color: '#dbe7ff', fontWeight: 600 },
  help: { margin: '26px 0 0', color: '#93a6cd', fontSize: 13 },
};
