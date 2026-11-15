export default function DashboardNotification({ notification, onDismiss }) {
  if (!notification) return null;

  return (
    <div className={`nd-notification ${notification.type}`} role={notification.type === 'error' ? 'alert' : 'status'}>
      <span>{notification.message}</span>
      <button type="button" aria-label="Dismiss notification" onClick={onDismiss}>×</button>
    </div>
  );
}
