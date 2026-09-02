import { useRef, useState } from 'react';

export default function LoginForm({
  isSignUp,
  onClose,
  onAuth,
}) {
  const firstInputRef = useRef(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username.trim() || (isSignUp && !email.trim())) {
      setErrorMessage(isSignUp ? 'Please enter a username and email address.' : 'Please enter your username or email.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setErrorMessage('');
    onAuth({ username, email, password });
  };

  return (
    <div className="right-form-side">
      <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Close modal">
        <span aria-hidden="true">✕</span>
      </button>
      <div>
        <div className="top-bar-right">
          <span className="brand-title-right">NEBULA</span>
          <label className="lang-selector">
            <span className="sr-only">Language</span>
            <select defaultValue="en" aria-label="Language">
              <option value="en">🇬🇧 EN</option>
              <option value="fr">🇫🇷 FR</option>
              <option value="es">🇪🇸 ES</option>
            </select>
          </label>
        </div>
        <div className="form-header-ref">
          <h2 id="form-title">Hi Designer</h2>
          <p>Welcome to NEBULA Portal</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-field-group">
            <div className="input-wrapper">
              <label className="sr-only" htmlFor="username-input">Email</label>
              <input id="username-input" ref={firstInputRef} type="text" placeholder={isSignUp ? 'Username' : 'Username or Email'} value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoFocus required />
            </div>
            {isSignUp && <div className="input-wrapper"><label className="sr-only" htmlFor="email-input">Email address</label><input id="email-input" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></div>}
            <div className="input-wrapper">
              <label className="sr-only" htmlFor="password-input">Password</label>
              <input id="password-input" type="password" placeholder="Password" value={password} className={errorMessage ? 'input-error' : ''} onChange={(event) => { setPassword(event.target.value); if (errorMessage) setErrorMessage(''); }} autoComplete={isSignUp ? 'new-password' : 'current-password'} required />
            </div>
            {errorMessage && <span className="form-error" role="alert">{errorMessage}</span>}
            {!isSignUp && <a href="#forgot" className="forgot-pass-link">Forgot password?</a>}
          </div>
          <div className="divider-or">or</div>
          <button type="button" className="google-btn" onClick={() => setErrorMessage('Google sign-in is not connected in this demo.')}>
            <span className="social-letter google-letter" aria-hidden="true">G</span>
            Sign in with Google
          </button>
          <button type="submit" className="submit-btn-ref">{isSignUp ? 'Create Account' : 'Login'}</button>
        </form>
        <div className="bottom-signup-text">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? 'Sign in' : 'Sign up'}</button>
        </div>
      </div>
      <div className="social-icons-footer" aria-label="Social networks">
        <span>🌐 Website</span>
        <span aria-hidden="true">|</span>
        <span>📚 Portal Support</span>
      </div>
    </div>
  );
}
