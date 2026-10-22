import { useEffect, useRef, useState } from 'react';
import VisualPanel from './VisualPanel';
import LoginForm from './LoginForm';
import { requestGoogleProfile } from '../utils/googleAuth';

export default function AuthModal({
  isOpen,
  onClose,
  isSignUp,
  setIsSignUp,
  onAuth,
  onGoogleAuth,
}) {
  const dialogRef = useRef(null);
  const [googleError, setGoogleError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleSignIn = async () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setGoogleError('Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID and restart the app.');
      return;
    }

    setGoogleError('');
    setIsGoogleLoading(true);
    try {
      const profile = await requestGoogleProfile(clientId);
      onGoogleAuth(profile);
      setGoogleError('');
    } catch (error) {
      setGoogleError(error.message);
    } finally {
      setIsGoogleLoading(false);
    }
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
            googleError={googleError}
            isGoogleLoading={isGoogleLoading}
          />
        </div>
      </div>
    </dialog>
  );
}
