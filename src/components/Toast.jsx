export default function Toast({ message, actionLabel, onAction, onClose }) {
  return (
    <div className="toast" role="status">
      <span>{message}</span>
      {onAction && <button className="toast-action" onClick={onAction}>{actionLabel}</button>}
      <button className="icon-btn" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  )
}
