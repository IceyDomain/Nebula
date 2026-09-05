import { useState } from 'react';
import NebulaDocs from './NebulaDocs';
import NebulaStore from './NebulaStore';
import PersonalTimetable from './PersonalTimetable';
import SharedDashboard from './SharedDashboard';
import SettingsPage from './SettingsPage';
import LevelProgressBar from './LevelProgressBar';
import { TIER_PERKS, handleStorePurchase } from '../utils/tierSystem';
import { getDocsKey } from './NebulaDocs';
import UserAvatar from './UserAvatar';
import GameRoomView from './GameRoomView';

const NAV_ITEMS = [['dashboard', '📊 Personal Dashboard'], ['notes', '📝 Notes & Docs'], ['shared', '🌐 Shared Community'], ['timetable', '📅 Personal Timetable'], ['game-room', '🎮 Game Room']];

export default function StandardDashboard({ user, onSignOut }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTierDetailsOpen, setIsTierDetailsOpen] = useState(false);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [credits, setCredits] = useState(() => user.credits ?? 1000);
  const [tier, setTier] = useState(() => user.tier || 'Basic');
  const [exp, setExp] = useState(() => user.exp ?? 0);
  const [activeBg, setActiveBg] = useState(() => localStorage.getItem('nebula_active_bg') || '#120024');
  const [purchasedBgs, setPurchasedBgs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nebula_purchased_bgs') || '["#120024", "#000000", "#ffffff"]');
      return Array.isArray(saved) ? saved : ['#120024', '#000000', '#ffffff'];
    } catch {
      return ['#120024', '#000000', '#ffffff'];
    }
  });
  const [publishedNotes, setPublishedNotes] = useState(() => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem('nebula_published_notes') || '[]');
      return Array.isArray(savedNotes) ? savedNotes : [];
    } catch {
      return [];
    }
  });
  const username = user.username || user.email?.split('@')[0] || 'Explorer';

  const updateUserData = (newCredits, newTier = tier, newExp = exp) => {
    setCredits(newCredits);
    setTier(newTier);
    setExp(newExp);
    const updatedUser = { ...user, credits: newCredits, tier: newTier, exp: newExp };
    localStorage.setItem('nebula_active_user', JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem('nebula_users') || '[]');
    localStorage.setItem('nebula_users', JSON.stringify(users.map((storedUser) => storedUser.username === user.username ? updatedUser : storedUser)));
  };

  const handlePublish = (newNote) => {
    const updatedNotes = [...publishedNotes, newNote];
    setPublishedNotes(updatedNotes);
    localStorage.setItem('nebula_published_notes', JSON.stringify(updatedNotes));
  };

  const chargePublishing = (fee) => {
    if (credits < fee.finalCost) return false;
    updateUserData(credits - fee.finalCost, tier, exp + fee.earnedExp);
    return true;
  };

  const cloneCommunityNote = (post) => {
    let documents = [];
    try {
      const savedDocuments = JSON.parse(localStorage.getItem(getDocsKey(username)) || '[]');
      documents = Array.isArray(savedDocuments) ? savedDocuments : [];
    } catch {
      documents = [];
    }
    const clonedDocument = {
      id: Date.now(),
      title: post.title || 'Community Note',
      text: post.content || post.text || '',
      updatedAt: new Date().toLocaleDateString(),
    };
    localStorage.setItem(getDocsKey(username), JSON.stringify([clonedDocument, ...documents]));
    alert('Note saved to My Docs.');
  };

  const selectBackground = (background) => {
    setActiveBg(background);
    localStorage.setItem('nebula_active_bg', background);
  };

  const purchaseBackground = (background, cost) => {
    const updatedUser = handleStorePurchase({ user: { ...user, credits, tier, exp }, itemPrice: cost, activeTier: tier });
    if (!updatedUser) return false;
    const updatedBackgrounds = [...purchasedBgs, background];
    setPurchasedBgs(updatedBackgrounds);
    localStorage.setItem('nebula_purchased_bgs', JSON.stringify(updatedBackgrounds));
    updateUserData(updatedUser.credits, updatedUser.tier, updatedUser.exp);
    selectBackground(background);
    return true;
  };

  const purchaseTier = (nextTier) => {
    const tierPrice = TIER_PERKS[nextTier]?.price;
    const updatedUser = handleStorePurchase({ user: { ...user, credits, tier, exp }, itemPrice: tierPrice, activeTier: tier });
    if (!updatedUser) return false;
    updateUserData(updatedUser.credits, nextTier, updatedUser.exp);
    alert(`${nextTier} Tier unlocked.`);
    return true;
  };

  const appBackgroundStyle = activeBg.startsWith('animated-')
    ? { background: 'linear-gradient(-45deg, #0d001a, #1f0036, #001233, #120024)', backgroundSize: '400% 400%', animation: 'nebulaGradient 12s ease infinite' }
    : activeBg.startsWith('http') || activeBg.startsWith('url(')
      ? { backgroundImage: `url(${activeBg.replace(/^url\(['"]?|['"]?\)$/g, '')})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: activeBg };

  return (
    <div className={`classroom-layout ${isEditingDoc ? 'full-editor-mode' : ''}`} style={appBackgroundStyle}>
      {!isEditingDoc && <aside className="sidebar-nav">
        <div className="sidebar-brand">NEBULA</div>
        <nav className="sidebar-menu" aria-label="Main navigation">
          {NAV_ITEMS.map(([tab, label]) => <button type="button" key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{label}</button>)}
        </nav>
      </aside>}
      <div className="main-wrapper">
        <header className="top-header">
          <span className="welcome-tag">Welcome back, {username}</span>
          <div className="header-right"><LevelProgressBar exp={exp} tier={tier} /><span className="credit-badge">🪙 {credits} Credits</span><button type="button" className="store-icon-btn" onClick={() => setActiveTab('store')}>🛍️ Store</button><span className="tier-badge">{tier} Tier</span><div className="user-profile-wrapper"><button type="button" className="profile-trigger-btn" aria-label="Open profile menu" aria-expanded={isProfileOpen} onClick={() => { setIsProfileOpen(!isProfileOpen); setIsSettingsOpen(false); setIsTierDetailsOpen(false); }}><UserAvatar user={{ ...user, username, tier }} size="sm" /></button>{isProfileOpen && <div className="profile-dropdown-menu"><div className="profile-header"><strong>{username}</strong><span>{tier} Member</span></div><hr /><button type="button" onClick={() => { setActiveTab('settings'); setIsProfileOpen(false); setIsSettingsOpen(false); }}>⚙️ Settings Page</button></div>}</div></div>
        </header>
        <main className="content-area">
          {activeTab === 'dashboard' && <section className="dashboard-view"><div className="page-heading"><h2>Personal Dashboard</h2><p className="subtext">Your activity, schedules, and Nebula workspace at a glance.</p></div><div className="classroom-grid"><div className="card-item"><h3>Upcoming Events</h3><p>Next: Physics Homework due tomorrow at 5:00 PM</p></div><div className="card-item"><h3>Recent Activity</h3><p>Received monthly allowance (+100 Credits)</p></div><div className="card-item"><h3>Saved Notes</h3><p>{publishedNotes.length} notes saved in your Nebula Docs library.</p></div></div></section>}
          {activeTab === 'notes' && <NebulaDocs credits={credits} user={{ ...user, username, tier, exp }} onPublish={handlePublish} onUpdateCredits={(value, newExp = exp) => updateUserData(value, tier, newExp)} onEditorStateChange={setIsEditingDoc} />}
          {activeTab === 'shared' && <SharedDashboard publishedNotes={publishedNotes} currentUser={username} user={{ ...user, username, credits, tier, exp }} onPublishTransaction={chargePublishing} />}
          {activeTab === 'timetable' && <PersonalTimetable />}
          {activeTab === 'game-room' && <GameRoomView user={{ ...user, tier, exp }} />}
          {activeTab === 'store' && <NebulaStore credits={credits} tier={tier} purchasedBgs={purchasedBgs} onPurchaseBackground={purchaseBackground} onPurchaseTier={purchaseTier} onUpdateUserData={updateUserData} />}
          {activeTab === 'settings' && <SettingsPage user={user} activeBg={activeBg} purchasedBgs={purchasedBgs} onSelectBackground={selectBackground} onSignOut={onSignOut} />}
        </main>
      </div>
    </div>
  );
}
