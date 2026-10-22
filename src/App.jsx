import { useEffect, useState } from 'react';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import ArdenneDashboard from './components/ArdenneDashboard';
import FindOrganization from './components/FindOrganization';
import LandingPage from './components/LandingPage';
import OwnerDashboard from './components/OwnerDashboard';
import SignInChoice from './components/SignInChoice';
import StandardDashboard from './components/StandardDashboard';
import { requestGoogleProfile } from './utils/googleAuth';
import './App.css';

const STORAGE_KEYS = {
  personalUsers: 'nebula_users_personal',
  organizationUsers: 'nebula_users_org',
  activeUser: 'nebula_active_user',
  activeOrganizationUser: 'nebula_active_org_user',
  legacyUsers: 'nebula_users',
};

const UNLIMITED_CREDITS = Number.MAX_SAFE_INTEGER;

const INITIAL_USERS = [
  { username: import.meta.env.VITE_OWNER_USERNAME || 'owner', email: 'owner@nebula.com', password: 'ownerpassword123', role: 'owner', credits: UNLIMITED_CREDITS, tier: 'Nebula', exp: 0, equippedBorder: 'nebula-pulse', equippedBanner: 'default-space', unlockedBorders: ['none', 'nebula-pulse'], unlockedEmotes: ['rocket', 'star'] },
  { username: 'admin1', email: 'admin@nebula.com', password: 'adminpassword123', role: 'admin', adminLevel: 3, credits: UNLIMITED_CREDITS, tier: 'Nebula', exp: 0, equippedBorder: 'none', equippedBanner: 'default-space', unlockedBorders: ['none'], unlockedEmotes: ['rocket', 'star'] },
  { username: 'demo', email: 'demo@nebula.com', password: 'demo1234', role: 'user', credits: UNLIMITED_CREDITS, tier: 'Nebula', exp: 999999, equippedBorder: 'nebula-pulse', equippedBanner: 'default-space', unlockedBorders: ['none', 'nebula-pulse'], unlockedEmotes: ['rocket', 'star'] },
  { username: 'ardenne-demo', email: 'ardenne-demo@nebula.com', password: 'ardenne123', role: 'user', organization: { name: 'Ardenne High School', id: 'ardenne-high-school' }, credits: UNLIMITED_CREDITS, tier: 'Nebula', exp: 999999, equippedBorder: 'nebula-pulse', equippedBanner: 'default-space', unlockedBorders: ['none', 'nebula-pulse'], unlockedEmotes: ['rocket', 'star'] },
];

const DEFAULT_PROFILE_PERKS = { tier: 'Basic', exp: 0, equippedBorder: 'none', equippedBanner: 'default-space', unlockedBorders: ['none'], unlockedTemplates: [], unlockedEmotes: ['rocket', 'star'] };

function normalizeUser(user) {
  return {
    ...DEFAULT_PROFILE_PERKS,
    ...user,
    unlockedBorders: Array.isArray(user.unlockedBorders) ? user.unlockedBorders : DEFAULT_PROFILE_PERKS.unlockedBorders,
    unlockedTemplates: Array.isArray(user.unlockedTemplates) ? user.unlockedTemplates : DEFAULT_PROFILE_PERKS.unlockedTemplates,
    unlockedEmotes: Array.isArray(user.unlockedEmotes) ? user.unlockedEmotes : DEFAULT_PROFILE_PERKS.unlockedEmotes,
  };
}

function getUserStorageKey(namespace = 'personal') {
  return namespace === 'organization' ? STORAGE_KEYS.organizationUsers : STORAGE_KEYS.personalUsers;
}

function readUsers(namespace = 'personal') {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(getUserStorageKey(namespace)) || '[]');
    const users = Array.isArray(storedUsers) ? storedUsers : [];
    const normalizedUsers = users
      .filter((user) => user && typeof user === 'object' && (user.username || user.email))
      .map((user) => normalizeUser({
        ...user,
        username: (user.username || (user.email || '').split('@')[0] || 'guest').trim().toLowerCase(),
        email: (user.email || `${user.username || 'guest'}@nebula.local`).trim().toLowerCase(),
        role: user.role || 'user',
        credits: user.credits ?? 1000,
      }));

    const seedUsers = namespace === 'organization'
      ? INITIAL_USERS.filter((user) => user.organization?.id === 'ardenne-high-school')
      : INITIAL_USERS;
    const existingEmails = new Set(normalizedUsers.map((user) => user.email));
    return [...seedUsers.filter((user) => !existingEmails.has(user.email)), ...normalizedUsers];
  } catch {
    return namespace === 'organization'
      ? INITIAL_USERS.filter((user) => user.organization?.id === 'ardenne-high-school')
      : [...INITIAL_USERS];
  }
}

function persistUsers(namespace, users) {
  localStorage.setItem(getUserStorageKey(namespace), JSON.stringify(users));
}

function clearLegacySharedState() {
  const legacyKeys = [STORAGE_KEYS.legacyUsers, 'nebula_active_user', 'nebula_active_org_user'];
  legacyKeys.forEach((key) => localStorage.removeItem(key));
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [isSignInChoiceOpen, setIsSignInChoiceOpen] = useState(false);
  const [isOrganizationSignInOpen, setIsOrganizationSignInOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    clearLegacySharedState();
    try {
      persistUsers('personal', readUsers('personal'));
      const savedPersonalSession = localStorage.getItem(STORAGE_KEYS.activeUser);
      const savedOrgSession = localStorage.getItem(STORAGE_KEYS.activeOrganizationUser);
      if (savedPersonalSession) {
        setCurrentUser(JSON.parse(savedPersonalSession));
      } else if (savedOrgSession) {
        setCurrentUser(JSON.parse(savedOrgSession));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEYS.activeUser);
      localStorage.removeItem(STORAGE_KEYS.activeOrganizationUser);
    }
  }, []);

  const handleAuthSubmit = ({ username, email, password }) => {
    const users = readUsers('personal');
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
      const newUser = normalizeUser({ username: normalizedUsername, email: normalizedEmail, password, role: 'user', credits: 1000 });
      const nextUsers = [...users, newUser];
      persistUsers('personal', nextUsers);
      localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(newUser));
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
      const normalizedUser = normalizeUser(foundUser);
      localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(normalizedUser));
      setCurrentUser(normalizedUser);
    }
    setIsModalOpen(false);
  };

  const handleGoogleAuth = ({ googleId, email, name }) => {
    const users = readUsers('personal');
    const normalizedEmail = email.trim().toLowerCase();
    let googleUser = users.find((user) => user.googleId === googleId);
    let updatedUsers = users;

    if (!googleUser) {
      const existingAccount = users.find((user) =>
        user.role === 'user' && user.email === normalizedEmail && !user.googleId
      );
      if (existingAccount) {
        googleUser = normalizeUser({ ...existingAccount, googleId });
        updatedUsers = users.map((user) => user === existingAccount ? googleUser : user);
      } else {
        const baseUsername = (name || normalizedEmail.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '') || `google-${googleId.slice(-8).toLowerCase()}`;
        let username = baseUsername;
        if (users.some((user) => user.username === username)) {
          const suffix = googleId.slice(-6).toLowerCase();
          username = `${baseUsername}-${suffix}`;
          let collision = 2;
          while (users.some((user) => user.username === username)) {
            username = `${baseUsername}-${suffix}-${collision}`;
            collision += 1;
          }
        }
        googleUser = normalizeUser({
          username,
          email: normalizedEmail,
          googleId,
          role: 'user',
          credits: 1000,
        });
        updatedUsers = [...users, googleUser];
      }
      persistUsers('personal', updatedUsers);
    }

    const normalizedUser = normalizeUser(googleUser);
    localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(normalizedUser));
    setCurrentUser(normalizedUser);
    setIsModalOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem(STORAGE_KEYS.activeUser);
    localStorage.removeItem(STORAGE_KEYS.activeOrganizationUser);
    setCurrentUser(null);
  };

  const handleOpenSignInChoice = () => {
    setIsSignInChoiceOpen(true);
  };

  const handleSelectSignInType = (type) => {
    if (type === 'organization') {
      setIsSignInChoiceOpen(false);
      setIsOrganizationSignInOpen(true);
      return;
    }
    setIsSignUp(type === 'personal');
    setIsSignInChoiceOpen(false);
    setIsModalOpen(true);
  };

  const handleOrganizationSignIn = ({ username, password }) => {
    const loginId = username.trim().toLowerCase();
    const foundUser = readUsers('organization').find((user) =>
      (user.username === loginId || user.email === loginId) && user.password === password
    );
    if (!foundUser) throw new Error('Invalid credentials.');

    const normalizedUser = normalizeUser(foundUser);
    localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(normalizedUser));
    localStorage.setItem(STORAGE_KEYS.activeOrganizationUser, JSON.stringify(normalizedUser));
    setCurrentUser(normalizedUser);
    setIsOrganizationSignInOpen(false);
  };

  const handleOrganizationSignUp = ({ username, email, password, org }) => {
    const users = readUsers('organization');
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((user) => user.username === normalizedUsername || user.email === normalizedEmail)) {
      throw new Error('Username or email already taken. Please sign in.');
    }

    const newUser = normalizeUser({
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      organization: org,
      role: 'user',
      credits: 1000,
    });
    const nextUsers = [...users, newUser];
    persistUsers('organization', nextUsers);
    localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.activeOrganizationUser, JSON.stringify(newUser));
    setCurrentUser(newUser);
    setIsOrganizationSignInOpen(false);
  };

  const handleOrganizationGoogleSignIn = async () => {
    const profile = await requestGoogleProfile(import.meta.env.VITE_GOOGLE_CLIENT_ID);
    const users = readUsers('organization');
    const normalizedEmail = (profile.email || '').trim().toLowerCase();
    let orgUser = users.find((user) => user.googleId === profile.googleId);
    let updatedUsers = users;

    if (!orgUser) {
      const existingAccount = users.find((user) => user.email === normalizedEmail && !user.googleId);
      if (existingAccount) {
        orgUser = normalizeUser({ ...existingAccount, googleId: profile.googleId });
        updatedUsers = users.map((user) => user === existingAccount ? orgUser : user);
      } else {
        const baseUsername = (profile.name || normalizedEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9_-]/g, '') || `google-${profile.googleId.slice(-8).toLowerCase()}`;
        let username = baseUsername;
        if (users.some((user) => user.username === username)) {
          const suffix = profile.googleId.slice(-6).toLowerCase();
          username = `${baseUsername}-${suffix}`;
          let collision = 2;
          while (users.some((user) => user.username === username)) {
            username = `${baseUsername}-${suffix}-${collision}`;
            collision += 1;
          }
        }
        orgUser = normalizeUser({ username, email: normalizedEmail, googleId: profile.googleId, role: 'user', credits: 1000, organization: { name: 'Ardenne High School', id: 'ardenne-high-school' } });
        updatedUsers = [...users, orgUser];
      }
      persistUsers('organization', updatedUsers);
    }

    const normalizedUser = normalizeUser(orgUser);
    localStorage.setItem(STORAGE_KEYS.activeUser, JSON.stringify(normalizedUser));
    localStorage.setItem(STORAGE_KEYS.activeOrganizationUser, JSON.stringify(normalizedUser));
    setCurrentUser(normalizedUser);
    setIsOrganizationSignInOpen(false);
  };

  if (currentUser) {
    if (currentUser.role === 'owner') {
      return <OwnerDashboard user={currentUser} onSignOut={handleSignOut} />;
    }
    if (currentUser.role === 'admin') {
      return <AdminDashboard user={currentUser} onSignOut={handleSignOut} />;
    }
    const isArdenneUser = currentUser.organization?.name === 'Ardenne High School'
      || currentUser.organization?.id === 'ardenne-high-school'
      || currentUser.orgId === 'ardenne-high-school';
    return (
      <div className="app-root">
        {isArdenneUser ? (
          <ArdenneDashboard user={currentUser} onSignOut={handleSignOut} />
        ) : (
          <StandardDashboard user={currentUser} onSignOut={handleSignOut} />
        )}
      </div>
    );
  }

  return (
    <div className="app-root">
      {isSignInChoiceOpen ? (
        <SignInChoice onSelect={handleSelectSignInType} onBack={() => setIsSignInChoiceOpen(false)} />
      ) : isOrganizationSignInOpen ? (
        <FindOrganization
          onBack={() => {
            setIsOrganizationSignInOpen(false);
            setIsSignInChoiceOpen(true);
          }}
          onSignIn={handleOrganizationSignIn}
          onSignUp={handleOrganizationSignUp}
          onGoogleSignIn={handleOrganizationGoogleSignIn}
        />
      ) : (
        <LandingPage onOpenModal={handleOpenSignInChoice} />
      )}
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isSignUp={isSignUp}
        setIsSignUp={setIsSignUp}
        onAuth={handleAuthSubmit}
        onGoogleAuth={handleGoogleAuth}
      />
    </div>
  );
}

export default App;
