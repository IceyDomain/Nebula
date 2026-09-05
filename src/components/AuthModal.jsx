import { useEffect, useRef } from 'react';
import VisualPanel from './VisualPanel';
import LoginForm from './LoginForm';

export default function AuthModal({
  isOpen,
  onClose,
  isSignUp,
  setIsSignUp,
  onAuth,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleCancel = (event) => {
    event.preventDefault();
  };

  const handleGoogleSignIn = () => {
    alert(import.meta.env.VITE_GOOGLE_CLIENT_ID
      ? 'Google OAuth needs a configured identity provider callback before sign-in can be enabled.'
      : 'Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID and connect an OAuth provider.');
  };

  return (
    <dialog ref={dialogRef} className="auth-dialog" onCancel={handleCancel} aria-labelledby="form-title">
      <div className="login-overlay">
        <div className="reference-card">
          <VisualPanel isSignUp={isSignUp} setIsSignUp={setIsSignUp} />
          <LoginForm
            isSignUp={isSignUp}
            onClose={onClose}
            onAuth={onAuth}
            onGoogleSignIn={handleGoogleSignIn}
          />
        </div>
      </div>
    </dialog>
  );
}
