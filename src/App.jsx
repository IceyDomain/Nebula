import { useEffect, useState } from 'react';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import LandingPage from './components/LandingPage';
import OwnerDashboard from './components/OwnerDashboard';
import StandardDashboard from './components/StandardDashboard';
import './App.css';

const INITIAL_USERS = [
  { username: 'owner', email: 'owner@nebula.com', password: 'ownerpassword123', role: 'owner', credits: 9999 },
  { username: 'admin1', email: 'admin@nebula.com', password: 'adminpassword123', role: 'admin', adminLevel: 3, credits: 500 },
];

function readUsers() {
  try {
    const storedUsers = JSON.parse(localStorage.getItem('nebula_users') || '[]');
    const users = Array.isArray(storedUsers) ? storedUsers : [];
    const normalizedUsers = users
      .filter((user) => user && typeof user === 'object' && (user.username || user.email))
      .map((user) => ({
        ...user,
        username: (user.username || user.email.split('@')[0]).trim().toLowerCase(),
        email: (user.email || `${user.username}@nebula.local`).trim().toLowerCase(),
        role: user.role || 'user',
        credits: user.credits ?? 1000,
      }));
    const existingEmails = new Set(normalizedUsers.map((user) => user.email));
    return [...INITIAL_USERS.filter((user) => !existingEmails.has(user.email)), ...normalizedUsers];
  } catch {
    return [...INITIAL_USERS];
  }
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('nebula_users', JSON.stringify(readUsers()));
      const savedSession = localStorage.getItem('nebula_active_user');
      if (savedSession) setCurrentUser(JSON.parse(savedSession));
    } catch {
      localStorage.removeItem('nebula_active_user');
    }
  }, []);

  const handleAuthSubmit = ({ username, email, password }) => {
    const users = readUsers();
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    if (isSignUp) {
      if (!normalizedUsername || !normalizedEmail || password.length < 6) {
        alert('Enter a username, email, and a password of at least 6 characters.');
        return;
      }
      if (users.some((user) => user.username === normalizedUsername || user.email === normalizedEmail)) {
        alert('Username or email already taken. Please sign in.');
        setIsSignUp(false);
        return;
      }
      const newUser = { username: normalizedUsername, email: normalizedEmail, password, role: 'user', credits: 1000 };
      localStorage.setItem('nebula_users', JSON.stringify([...users, newUser]));
      localStorage.setItem('nebula_active_user', JSON.stringify(newUser));
      setCurrentUser(newUser);
    } else {
      const loginId = normalizedUsername || normalizedEmail;
      const foundUser = users.find((user) =>
        (user.username === loginId || user.email === loginId) && user.password === password
      );
      if (!foundUser) {
        alert('Invalid credentials.');
        return;
      }
      localStorage.setItem('nebula_active_user', JSON.stringify(foundUser));
      setCurrentUser(foundUser);
    }
    setIsModalOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('nebula_active_user');
    setCurrentUser(null);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  if (currentUser) {
    if (currentUser.role === 'owner') {
      return <OwnerDashboard user={currentUser} onSignOut={handleSignOut} />;
    }
    if (currentUser.role === 'admin') {
      return <AdminDashboard user={currentUser} onSignOut={handleSignOut} />;
    }
    return (
      <div className="app-root">
        <div className="animated-galaxy-bg" aria-hidden="true" />
        <StandardDashboard user={currentUser} onSignOut={handleSignOut} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <div className="animated-galaxy-bg" aria-hidden="true" />
      <LandingPage onOpenModal={handleOpenModal} />
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        onAuth={handleAuthSubmit}
      />
    </div>
  );
}

export default App;
