import React from "react";

/**
 * ErrorBoundary
 *
 * Wrap your app (or any subtree) with this component to catch runtime errors
 * and show a branded fallback UI instead of the default React crash screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Or around a specific subtree:
 *   <ErrorBoundary fallbackTitle="This section failed to load">
 *     <SomeDangerousComponent />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError:  false,
      error:     null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Hook in your error reporting service here (Sentry, Datadog, etc.)
    // e.g. Sentry.captureException(error, { extra: errorInfo });
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => window.location.reload();

  handleGoHome = () => {
    window.location.href = "/";
  };

  handleReset = () => {
    this.setState({
      hasError:    false,
      error:       null,
      errorInfo:   null,
      showDetails: false,
    });
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallbackTitle } = this.props;

    if (!hasError) return children;

    const message = error?.message || "An unexpected error occurred.";
    const stack   = errorInfo?.componentStack || error?.stack || "";

    return (
      <div style={styles.overlay}>
        <div style={styles.card}>

          {/* Icon */}
          <div style={styles.iconWrap}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="#FFF3E8" />
              <path d="M16 9v8" stroke="#F57600" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="16" cy="21.5" r="1.5" fill="#F57600" />
            </svg>
          </div>

          {/* Heading */}
          <h1 style={styles.heading}>
            {fallbackTitle || "Something went wrong"}
          </h1>

          {/* Message */}
          <p style={styles.message}>{message}</p>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.btnPrimary} onClick={this.handleReload}>
              Reload page
            </button>
            <button style={styles.btnSecondary} onClick={this.handleReset}>
              Try again
            </button>
            <button style={styles.btnGhost} onClick={this.handleGoHome}>
              Go home
            </button>
          </div>

          {/* Collapsible details */}
          <button
            style={styles.detailsToggle}
            onClick={() => this.setState((s) => ({ showDetails: !s.showDetails }))}
          >
            {showDetails ? "Hide" : "Show"} error details
            <span style={{ marginLeft: 4 }}>{showDetails ? "▲" : "▼"}</span>
          </button>

          {showDetails && (
            <div style={styles.detailsBox}>
              <p style={styles.detailsLabel}>Error</p>
              <pre style={styles.pre}>{message}</pre>
              {stack && (
                <>
                  <p style={{ ...styles.detailsLabel, marginTop: 12 }}>Stack trace</p>
                  <pre style={styles.pre}>{stack.trim()}</pre>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <p style={styles.footer}>
            If this keeps happening, try clearing your browser cache or contact support.
          </p>
        </div>
      </div>
    );
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  overlay: {
    minHeight:       "100dvh",
    display:         "flex",
    alignItems:      "center",
    justifyContent:  "center",
    backgroundColor: "#FFF8F2",
    padding:         "24px 16px",
    fontFamily:      "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius:    24,
    border:          "1px solid #FFE0C2",
    padding:         "40px 32px 32px",
    maxWidth:        480,
    width:           "100%",
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    textAlign:       "center",
    boxShadow:       "0 4px 24px 0 rgba(245,118,0,0.10), 0 1.5px 6px 0 rgba(245,118,0,0.07)",
  },
  iconWrap: {
    marginBottom: 20,
  },
  heading: {
    fontSize:     22,
    fontWeight:   700,
    color:        "#1A1A1A",
    margin:       "0 0 10px",
    lineHeight:   1.3,
  },
  message: {
    fontSize:     14,
    color:        "#6B6B6B",
    margin:       "0 0 28px",
    lineHeight:   1.6,
    maxWidth:     340,
  },
  actions: {
    display:        "flex",
    flexWrap:       "wrap",
    gap:            10,
    justifyContent: "center",
    marginBottom:   24,
    width:          "100%",
  },
  btnPrimary: {
    background:    "linear-gradient(90deg, #F57600, #F0AE35)",
    color:         "#FFFFFF",
    border:        "none",
    borderRadius:  999,
    padding:       "10px 24px",
    fontSize:      14,
    fontWeight:    700,
    cursor:        "pointer",
    flex:          "1 1 120px",
    maxWidth:      180,
    transition:    "opacity 0.15s",
  },
  btnSecondary: {
    background:    "#FFFFFF",
    color:         "#F57600",
    border:        "1.5px solid #F57600",
    borderRadius:  999,
    padding:       "10px 24px",
    fontSize:      14,
    fontWeight:    700,
    cursor:        "pointer",
    flex:          "1 1 100px",
    maxWidth:      160,
    transition:    "background 0.15s",
  },
  btnGhost: {
    background:    "transparent",
    color:         "#9E9E9E",
    border:        "1.5px solid #E0E0E0",
    borderRadius:  999,
    padding:       "10px 20px",
    fontSize:      14,
    fontWeight:    600,
    cursor:        "pointer",
    flex:          "1 1 80px",
    maxWidth:      120,
    transition:    "background 0.15s",
  },
  detailsToggle: {
    background:   "transparent",
    border:       "none",
    color:        "#F57600",
    fontSize:     12,
    fontWeight:   600,
    cursor:       "pointer",
    marginBottom: 12,
    padding:      0,
  },
  detailsBox: {
    width:           "100%",
    background:      "#FFF8F2",
    border:          "1px solid #FFE0C2",
    borderRadius:    12,
    padding:         "14px 16px",
    textAlign:       "left",
    marginBottom:    20,
  },
  detailsLabel: {
    fontSize:    11,
    fontWeight:  700,
    color:       "#F57600",
    margin:      "0 0 6px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  pre: {
    fontSize:    11,
    color:       "#444",
    margin:      0,
    whiteSpace:  "pre-wrap",
    wordBreak:   "break-all",
    lineHeight:  1.6,
    fontFamily:  "monospace",
    maxHeight:   200,
    overflowY:   "auto",
  },
  footer: {
    fontSize:   12,
    color:      "#BDBDBD",
    margin:     0,
    lineHeight: 1.5,
  },
};

export default ErrorBoundary;