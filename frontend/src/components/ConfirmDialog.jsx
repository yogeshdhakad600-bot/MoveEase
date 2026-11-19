import { useEffect, useId, useRef } from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const titleId = useId();
  const messageId = useId();
  const cancelButton = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    cancelButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={messageId}>
        <span className="confirm-icon" aria-hidden="true">!</span>
        <span className="confirm-eyebrow">PLEASE CONFIRM</span>
        <h2 id={titleId}>{title}</h2>
        <p id={messageId}>{message}</p>
        <div className="confirm-actions">
          <button ref={cancelButton} className="btn btn-ghost-dark btn-sm" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn-confirm-danger btn-sm" disabled={busy} onClick={onConfirm}>
            {busy ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}