import { useState } from 'react';
import './nebula-dashboard.css';
import NebulaDocs from './NebulaDocs';
import NebulaStore from './NebulaStore';
import TimetableCalendar from './TimetableCalendar';
import SharedDashboard from './SharedDashboard';
import SettingsPage from './SettingsPage';
import LevelProgressBar from './LevelProgressBar';
import UserAvatar from './UserAvatar';
import GameRoomView from './GameRoomView';
import { NebulaBrand, ArdenneBrand } from './Brand';
import { TIER_PERKS, calculateProgress, handleStorePurchase } from '../utils/tierSystem';

const ARDENNE_ID = 'ardenne-high-school';

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  notes: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h5" /></>,
  shared: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.5c2 .7 3.5 2.6 3.5 5.5" /></>,
  timetable: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  'game-room': <><rect x="2" y="7" width="20" height="11" rx="4" /><path d="M7 10v5M4.5 12.5h5" /><circle cx="16" cy="11.5" r="1" /><circle cx="18.5" cy="14" r="1" /></>,
};

const NAV_NEBULA = [['dashboard', 'Personal Dashboard'], ['notes', 'Notes & Docs'], ['shared', 'Shared Community'], ['timetable', 'Timetable & Calendar'], ['game-room', 'Game Room']];
const NAV_ARDENNE = [['dashboard', 'Dashboard'], ['notes', 'Notes & Docs'], ['shared', 'Community'], ['timetable', 'Timetable & Calendar']];

const isLightColor = (value) => {
  const match = /^#([0-9a-f]{6})$/i.exec(value || '');
  if (!match) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
};

function readUpcoming(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const today = new Date().toISOString().slice(0, 10);
    const events = Array.isArray(saved?.events) ? saved.events : [];
    return events.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  } catch {
    return [];
  }
}

export default function StandardDashboard({ user, onSignOut, theme: themeProp }) {
  const theme = themeProp || (user.orgId === ARDENNE_ID ? 'ardenne' : 'nebula');
  const isSchool = theme === 'ardenne';
  const orgName = isSchool ? 'Ardenne High School' : '';
  const defaultBg = isSchool ? '#08153A' : '#120024';
  const defaultBgs = [defaultBg, '#000000', '#ffffff'];
  const navItems = isSchool ? NAV_ARDENNE : NAV_NEBULA;

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState('appearance');
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [credits, setCredits] = useState(() => user.credits ?? 1000);
  const [tier, setTier] = useState(() => user.tier || 'Basic');
  const [exp, setExp] = useState(() => user.exp ?? 0);
  const [unlockedBorders, setUnlockedBorders] = useState(() => user.unlockedBorders || ['none']);
  const [unlockedTemplates, setUnlockedTemplates] = useState(() => user.unlockedTemplates || []);
  const [equippedBorder, setEquippedBorder] = useState(() => user.equippedBorder || 'none');
  const username = user.username || user.email?.split('@')[0] || 'Explorer';
  const profileBgKey = `nebula_active_bg_${username}`;
  const purchasedBgsKey = `nebula_purchased_bgs_${username}`;
  const publishedNotesKey = `nebula_published_notes_${username}`;
  const forumStorageKey = isSchool ? `nebula_forum_topics_ardenne_${username}` : `nebula_forum_topics_${username}`;
  const [activeBg, setActiveBg] = useState(() => localStorage.getItem(profileBgKey) || defaultBg);
  const [purchasedBgs, setPurchasedBgs] = useState(() => {
    if (Array.isArray(user.purchasedBgs)) return user.purchasedBgs;
    try {
      const saved = JSON.parse(localStorage.getItem(purchasedBgsKey) || 'null');
      return Array.isArray(saved) ? saved : defaultBgs;
    } catch {
      return defaultBgs;
    }
  });
  const [publishedNotes, setPublishedNotes] = useState(() => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem(publishedNotesKey) || '[]');
      return Array.isArray(savedNotes) ? savedNotes : [];
    } catch {
      return [];
    }
  });
  const prefix = isSchool ? 'ardenne' : 'nebula';

  const updateUserData = (newCredits, newTier = tier, newExp = exp, profileUpdates = {}) => {
    setCredits(newCredits);
    setTier(newTier);
    setExp(newExp);
    if (profileUpdates.unlockedBorders) setUnlockedBorders(profileUpdates.unlockedBorders);
    if (profileUpdates.unlockedTemplates) setUnlockedTemplates(profileUpdates.unlockedTemplates);
    if (profileUpdates.purchasedBgs) setPurchasedBgs(profileUpdates.purchasedBgs);
    if (profileUpdates.equippedBorder !== undefined) setEquippedBorder(profileUpdates.equippedBorder);
    const updatedUser = {
      ...user,
      unlockedBorders,
      unlockedTemplates,
      purchasedBgs,
      equippedBorder,
      ...profileUpdates,
      credits: newCredits,
      tier: newTier,
      exp: newExp,
    };
    const userStoreKey = isSchool ? 'nebula_users_org' : 'nebula_users_personal';
    const activeUserKey = isSchool ? 'nebula_active_org_user' : 'nebula_active_user';
    localStorage.setItem(activeUserKey, JSON.stringify(updatedUser));
    const users = JSON.parse(localStorage.getItem(userStoreKey) || '[]');
    const matchingUser = (storedUser) => storedUser.username === user.username;
    const storedUsers = users.some(matchingUser)
      ? users.map((storedUser) => matchingUser(storedUser) ? updatedUser : storedUser)
      : [...users, updatedUser];
    localStorage.setItem(userStoreKey, JSON.stringify(storedUsers));
  };

  const handlePublish = (newNote) => {
    const updatedNotes = [...publishedNotes, newNote];
    setPublishedNotes(updatedNotes);
    localStorage.setItem(publishedNotesKey, JSON.stringify(updatedNotes));
  };

  const chargePublishing = (fee) => {
    if (credits < fee.finalCost) return false;
    updateUserData(credits - fee.finalCost, tier, exp + fee.earnedExp);
    return true;
  };

  const purchaseProfileItem = (field, item, cost) => {
    const ownedItems = field === 'unlockedBorders' ? unlockedBorders : unlockedTemplates;
    if (ownedItems.includes(item)) return false;
    const updatedUser = handleStorePurchase({ user: { ...user, credits, tier, exp }, itemPrice: cost, activeTier: tier });
    if (!updatedUser) return false;
    updateUserData(updatedUser.credits, updatedUser.tier, updatedUser.exp, { [field]: [...ownedItems, item] });
    return true;
  };

  const equipFrame = (frame) => {
    if (frame !== 'none' && !unlockedBorders.includes(frame)) return;
    updateUserData(credits, tier, exp, { equippedBorder: frame });
  };

  const selectBackground = (background) => {
    setActiveBg(background);
    localStorage.setItem(profileBgKey, background);
  };

  const purchaseBackground = (background, cost) => {
    if (purchasedBgs.includes(background)) return false;
    const updatedUser = handleStorePurchase({ user: { ...user, credits, tier, exp }, itemPrice: cost, activeTier: tier });
    if (!updatedUser) return false;
    const updatedBackgrounds = [...purchasedBgs, background];
    localStorage.setItem(purchasedBgsKey, JSON.stringify(updatedBackgrounds));
    updateUserData(updatedUser.credits, updatedUser.tier, updatedUser.exp, { purchasedBgs: updatedBackgrounds });
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

  const fullUser = { ...user, username, credits, tier, exp, purchasedBgs, unlockedBorders, unlockedTemplates, equippedBorder };
  const classes = ['nd', isLightColor(activeBg) ? 'nd-light' : '', isEditingDoc ? 'nd-editing' : ''].filter(Boolean).join(' ');

  return (
    <div className={classes} data-theme={theme} style={appBackgroundStyle}>
      {!isEditingDoc && (
        <aside className="nd-side">
          {isSchool ? <ArdenneBrand /> : <NebulaBrand />}
          <nav className="nd-nav" aria-label="Main navigation">
            {navItems.map(([tab, label]) => (
              <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} aria-current={activeTab === tab ? 'page' : undefined} onClick={() => setActiveTab(tab)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[tab]}</svg>
                {label}
              </button>
            ))}
          </nav>
          {isSchool && <div className="nd-powered">Powered by Nebula</div>}
          <div className="nd-me">
            <UserAvatar user={fullUser} size="sm" />
            <span><b>{username}</b><small>{tier} Member</small></span>
          </div>
        </aside>
      )}

      <div className="nd-main">
        {!isEditingDoc && (
          <header className="nd-top">
            <span className="nd-hi">Welcome back, <b>{username}</b></span>
            <div className="nd-right">
              <LevelProgressBar exp={exp} tier={tier} />
              <span className="nd-pill">{credits} Credits</span>
              <button type="button" className="nd-btn sm" onClick={() => setActiveTab('store')}>Store</button>
              <span className="nd-pill">{tier} Tier</span>
              <div className="nd-profile">
                <button type="button" aria-label="Open profile menu" aria-expanded={isProfileOpen} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                  <UserAvatar user={fullUser} size="sm" />
                </button>
                {isProfileOpen && (
                  <div className="nd-menu">
                    <div><b>{username}</b><small>{tier} Member</small></div>
                    <button type="button" onClick={() => { setSettingsSection('profile'); setActiveTab('settings'); setIsProfileOpen(false); }}>Profile</button>
                    <button type="button" onClick={() => { setSettingsSection('appearance'); setActiveTab('settings'); setIsProfileOpen(false); }}>Settings</button>
                    <button type="button" onClick={onSignOut}>Sign out</button>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        <main className="nd-content">
          {activeTab === 'dashboard' && <DashboardHome theme={theme} credits={credits} tier={tier} exp={exp} notesCount={publishedNotes.length} timetableKey={`${prefix}_timetable_${username}`} onNavigate={setActiveTab} />}
          {activeTab === 'notes' && <NebulaDocs theme={theme} credits={credits} user={fullUser} onPublish={handlePublish} onUpdateCredits={(value, newExp = exp) => updateUserData(value, tier, newExp)} onEditorStateChange={setIsEditingDoc} />}
          {activeTab === 'shared' && <SharedDashboard theme={theme} storageKey={forumStorageKey} publishedNotes={publishedNotes} currentUser={username} user={fullUser} onPublishTransaction={chargePublishing} />}
          {activeTab === 'timetable' && <TimetableCalendar key={`${prefix}-${username}`} theme={theme} storageKey={`${prefix}_timetable_${username}`} />}
          {activeTab === 'game-room' && !isSchool && <GameRoomView user={{ ...user, tier, exp }} onGoToStore={() => setActiveTab('store')} />}
          {activeTab === 'store' && <NebulaStore theme={theme} credits={credits} tier={tier} purchasedBgs={purchasedBgs} unlockedBorders={unlockedBorders} unlockedTemplates={unlockedTemplates} equippedBorder={equippedBorder} onPurchaseBackground={purchaseBackground} onPurchaseTier={purchaseTier} onPurchaseFrame={(frame, cost) => purchaseProfileItem('unlockedBorders', frame, cost)} onEquipFrame={equipFrame} onPurchaseTemplate={(template, cost) => purchaseProfileItem('unlockedTemplates', template, cost)} />}
          {activeTab === 'settings' && <SettingsPage theme={theme} orgName={orgName} user={fullUser} activeBg={activeBg} purchasedBgs={purchasedBgs} initialSection={settingsSection} onSelectBackground={selectBackground} onEquipFrame={equipFrame} onNavigateToStore={() => setActiveTab('store')} onSignOut={onSignOut} />}
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ theme, credits, tier, exp, notesCount, timetableKey, onNavigate }) {
  const isSchool = theme === 'ardenne';
  const progress = calculateProgress(exp);
  const upcoming = readUpcoming(timetableKey);
  const nextTier = Object.entries(TIER_PERKS).find(([, perks]) => perks.level > (TIER_PERKS[tier]?.level || 0));

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="nd-crumb">{isSchool ? 'Portal' : 'Nebula'} / <span>Dashboard</span></div>
        <h1 className="nd-ttl">{isSchool ? 'Student Dashboard' : 'Personal Dashboard'}</h1>
        <p className="nd-sub">{isSchool ? new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Your activity, schedules and workspace at a glance.'}</p>
      </div>

      <div className="nd-g4">
        <div className="nd-card nd-stat"><span>Level</span><b>{progress.level}</b><div className="nd-bar" style={{ margin: '10px 0 6px' }}><i style={{ width: `${progress.percent}%` }} /></div><span style={{ fontSize: 12 }}>{progress.currentLevelExp} / {progress.nextLevelExp} XP</span></div>
        <div className="nd-card nd-stat"><span>Credits</span><b>{credits}</b><span style={{ fontSize: 12 }}>Spend them in the Store</span></div>
        <div className="nd-card nd-stat"><span>Tier</span><b>{tier}</b><span style={{ fontSize: 12 }}>{nextTier ? `Next: ${nextTier[0]} at Level ${nextTier[1].level}` : 'Highest tier'}</span></div>
        <div className="nd-card nd-stat"><span>Saved notes</span><b>{notesCount}</b><span style={{ fontSize: 12 }}>In your Docs library</span></div>
      </div>

      <div className="nd-g3">
        {isSchool && <div className="nd-card"><h3>Announcements</h3><p>No new announcements from the school office.</p></div>}
        <div className="nd-card">
          <h3>Upcoming Events</h3>
          {upcoming.length === 0 ? <p>No upcoming events. Add one in Timetable &amp; Calendar.</p> : upcoming.map((event) => <p key={event.id} style={{ marginTop: 8 }}><b style={{ color: 'var(--text)' }}>{event.title}</b><br />{event.date}</p>)}
        </div>
        <div className="nd-card"><h3>Recent Activity</h3><p>No recent activity yet.</p></div>
      </div>

      <div>
        <h2 className="nd-sec">{isSchool ? 'Quick links' : 'Quick actions'}</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="nd-btn" onClick={() => onNavigate('notes')}>New document</button>
          <a className="nd-btn ghost" style={{ display: 'inline-flex', alignItems: 'center' }} href="https://classroom.google.com" target="_blank" rel="noreferrer">Open Google Classroom</a>
          <button type="button" className="nd-btn ghost" onClick={() => onNavigate('timetable')}>Timetable &amp; Calendar</button>
          <button type="button" className="nd-btn ghost" onClick={() => onNavigate('store')}>Visit the Store</button>
        </div>
      </div>
    </section>
  );
}
