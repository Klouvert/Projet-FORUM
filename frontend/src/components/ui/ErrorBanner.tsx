interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

const ErrorBanner = ({ message, onDismiss }: ErrorBannerProps) => (
  <div style={{
    background: 'rgba(229,57,53,0.12)',
    border: '1px solid #e53935',
    borderRadius: '6px',
    padding: '10px 14px',
    fontSize: '13px',
    color: '#e57373',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  }}>
    <span>{message}</span>
    {onDismiss && (
      <button
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
          padding: '0 2px',
        }}
        aria-label="Fermer"
      >
        ✕
      </button>
    )}
  </div>
);

export default ErrorBanner;
