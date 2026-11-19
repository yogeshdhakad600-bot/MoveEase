export default function Toast({ message, type = 'success', onDismiss }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`toast toast-${type}`} role={isError ? 'alert' : 'status'} aria-live={isError ? 'assertive' : 'polite'}>
      <span className="toast-icon" aria-hidden="true">{isError ? '!' : '✓'}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-dismiss" type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button>
      <span className="toast-progress" aria-hidden="true" />
    </div>
  );
}
