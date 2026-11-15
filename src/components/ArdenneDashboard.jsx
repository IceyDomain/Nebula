// Ardenne High School version of the dashboard (no Game Room, blue and gold theme).
// Use this instead of StandardDashboard for Ardenne students:  <ArdenneDashboard user={user} onSignOut={...} />
import { useEffect, useState } from 'react';
import './nebula-dashboard.css';
import ArdenneDocs from './ArdenneDocs';
import ArdenneStore from './ArdenneStore';
import ArdenneTimetable from './ArdenneTimetable';
import ArdenneCommunity from './ArdenneCommunity';
import ArdenneSettings from './ArdenneSettings';
import ArdenneClubs from './ArdenneClubs';
import ArdenneFormPage from './ArdenneFormPage';
import ArdenneFormsGrades from './ArdenneFormsGrades';
import ArdenneGradePortal from './ArdenneGradePortal';
import ArdenneHouses from './ArdenneHouses';
import { StudentHome, TeacherHome } from './ArdenneHome';
import DashboardNotification from './DashboardNotification';
import LevelProgressBar from './LevelProgressBar';
import UserAvatar from './UserAvatar';
import { ArdenneBrand } from './ArdenneBrand';
import { saveProfile, viewerOf } from './ardennePortalData';
import { owns as ownsChristmas } from './christmas';
import ChristmasEventBanner from './ChristmasEventBanner';
import useChristmasEvent from './useChristmasEvent';
import { handleStorePurchase, handleTierPurchase } from '../utils/tierSystem';

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  grade: <><path d="M4 5h16M4 10h16M4 15h10" /><path d="M17 15l2 2 3-4" /></>,
  forms: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
  clubs: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6M16 14c3 0 5.5 2 5.5 5" /></>,
  houses: <><path d="M3 11l9-8 9 8v9H3z" /><path d="M9 20v-6h6v6" /></>,
  notes: <><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h7M9 16h5" /></>,
  shared: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M18 14.5c2 .7 3.5 2.6 3.5 5.5" /></>,
  timetable: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
};

const isLightColor = (value) => {
  const match = /^#([0-9a-f]{6})$/i.exec(value || '');
  if (!match) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
};

export default function ArdenneDashboard({ user, onSignOut }) {
  const theme = 'ardenne';
  const orgName = 'Ardenne High School';
  const defaultBg = '#08153A';
  const defaultBgs = [defaultBg, '#000000', '#ffffff'];

  const [activeTab, setActiveTab] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(Number(user.grade) || null);
  const [selectedForm, setSelectedForm] = useState(Number(user.form) || null);
  const [formReturnTab, setFormReturnTab] = useState(user.role === 'teacher' ? 'forms' : 'grade');
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
  const viewer = viewerOf({ ...user, username });
  const navItems = viewer.role === 'teacher'
    ? [['dashboard', 'Dashboard'], ['forms', 'Forms & Grades'], ['clubs', 'Clubs'], ['houses', 'Houses'], ['notes', 'Notes & Docs'], ['shared', 'Community'], ['timetable', 'Timetable & Calendar']]
    : [['dashboard', 'Dashboard'], ['grade', 'My Grade'], ['clubs', 'Clubs'], ['houses', 'Houses'], ['notes', 'Notes & Docs'], ['shared', 'Community'], ['timetable', 'Timetable & Calendar']];
  const { christmas, buyChristmas, toggleChristmas, preview: christmasPreview } = useChristmasEvent(username);
  const profileBgKey = `nebula_active_bg_${username}`;
  const purchasedBgsKey = `nebula_purchased_bgs_${username}`;
  const publishedNotesKey = `nebula_published_notes_${username}`;
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
  const prefix = 'ardenne';
  const notify = (message, type = 'error') => setNotification({ message, type });

  useEffect(() => {
    saveProfile(username, { role: viewer.role, grade: viewer.grade, form: viewer.form });
  }, [username, viewer.role, viewer.grade, viewer.form]);

  useEffect(() => {
    setCredits(user.credits ?? 1000);
    setTier(user.tier || 'Basic');
    setExp(user.exp ?? 0);
  }, [user.credits, user.tier, user.exp]);

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
    const userStoreKey = 'nebula_users_org';
    const activeUserKey = 'nebula_active_org_user';
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
    const updatedUser = handleStorePurchase({ user: { ...user, credits, tier, exp }, itemPrice: cost, activeTier: tier, onNotify: notify });
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
    const updatedUser = handleStorePurchase({ user: { ...user, credits, tier, exp }, itemPrice: cost, activeTier: tier, onNotify: notify });
    if (!updatedUser) return false;
    const updatedBackgrounds = [...purchasedBgs, background];
    localStorage.setItem(purchasedBgsKey, JSON.stringify(updatedBackgrounds));
    updateUserData(updatedUser.credits, updatedUser.tier, updatedUser.exp, { purchasedBgs: updatedBackgrounds });
    selectBackground(background);
    return true;
  };

  const purchaseTier = (nextTier) => {
    const updatedUser = handleTierPurchase({ user: { ...user, credits, tier, exp }, nextTier, onNotify: notify });
    if (!updatedUser) return false;
    updateUserData(updatedUser.credits, updatedUser.tier, updatedUser.exp);
    notify(`${nextTier} Tier unlocked.`, 'success');
    return true;
  };

  const buyChristmasItem = (itemId) => buyChristmas(itemId, credits, (nextCredits) => {
    updateUserData(nextCredits, tier, exp);
  });

  const openForm = (grade, form, returnTab) => {
    setSelectedGrade(Number(grade));
    setSelectedForm(Number(form));
    setFormReturnTab(returnTab);
    setActiveTab('form');
  };
  const navigateFromHome = (destination) => {
    if (destination === 'form') {
      if (viewer.grade && viewer.form) openForm(viewer.grade, viewer.form, viewer.role === 'teacher' ? 'forms' : 'grade');
      return;
    }
    if (destination === 'grade') setSelectedGrade(viewer.grade);
    setActiveTab(({ house: 'houses', club: 'clubs' })[destination] || destination);
  };

  const appBackgroundStyle = activeBg.startsWith('animated-')
    ? { background: 'linear-gradient(-45deg, #0d001a, #1f0036, #001233, #120024)', backgroundSize: '400% 400%', animation: 'nebulaGradient 12s ease infinite' }
    : activeBg.startsWith('http') || activeBg.startsWith('url(')
      ? { backgroundImage: `url(${activeBg.replace(/^url\(['"]?|['"]?\)$/g, '')})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundColor: activeBg };
  const christmasBackgroundStyle = theme === 'ardenne'
    ? { background: '#f1f6f2' }
    : { background: 'linear-gradient(135deg, #10271b, #0b1f16 70%, #08150f)' };

  const fullUser = { ...user, username, credits, tier, exp, purchasedBgs, unlockedBorders, unlockedTemplates, equippedBorder };
  const useLightColors = isLightColor(activeBg) && (!christmas.active.app || theme === 'ardenne');
  const useDarkColors = theme === 'ardenne' && !useLightColors && !christmas.active.app;
  const classes = ['nd', useLightColors ? 'nd-light' : '', useDarkColors ? 'nd-dark' : '', isEditingDoc ? 'nd-editing' : ''].filter(Boolean).join(' ');

  return (
    <div className={classes} data-theme={theme} data-event={christmas.active.app ? 'christmas' : undefined} style={christmas.active.app ? christmasBackgroundStyle : appBackgroundStyle}>
      <DashboardNotification notification={notification} onDismiss={() => setNotification(null)} />
      {!isEditingDoc && (
        <aside className="nd-side">
          <ArdenneBrand />
          <nav className="nd-nav" aria-label="Main navigation">
            {navItems.map(([tab, label]) => (
              <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} aria-current={activeTab === tab ? 'page' : undefined} onClick={() => setActiveTab(tab)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[tab]}</svg>
                {label}
              </button>
            ))}
          </nav>
          <div className="nd-powered">Powered by Nebula</div>
          <div className="nd-me">
            <UserAvatar user={fullUser} size="sm" frame={christmas.active.frame ? 'christmas' : equippedBorder} />
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
                  <UserAvatar user={fullUser} size="sm" frame={christmas.active.frame ? 'christmas' : equippedBorder} />
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
          {christmas.active.app && !isEditingDoc && <ChristmasEventBanner />}
          {activeTab === 'dashboard' && (viewer.role === 'teacher'
            ? <TeacherHome viewer={viewer} onNavigate={navigateFromHome} />
            : <StudentHome viewer={viewer} credits={credits} tier={tier} exp={exp} notesCount={publishedNotes.length} timetableKey={`${prefix}_timetable_${username}`} onNavigate={navigateFromHome} />)}
          {activeTab === 'forms' && viewer.role === 'teacher' && <ArdenneFormsGrades onOpenGrade={(grade) => { setSelectedGrade(grade); setActiveTab('grade'); }} onOpenForm={(grade, form) => openForm(grade, form, 'forms')} />}
          {activeTab === 'grade' && selectedGrade && <ArdenneGradePortal grade={selectedGrade} viewer={viewer} onOpenForm={(grade, form) => openForm(grade, form, 'grade')} />}
          {activeTab === 'form' && selectedGrade && selectedForm && <ArdenneFormPage grade={selectedGrade} form={selectedForm} viewer={viewer} onBack={() => setActiveTab(formReturnTab)} />}
          {activeTab === 'clubs' && <ArdenneClubs viewer={viewer} />}
          {activeTab === 'houses' && <ArdenneHouses viewer={viewer} />}
          {activeTab === 'notes' && <ArdenneDocs theme={theme} credits={credits} user={fullUser} onPublish={handlePublish} onUpdateCredits={(value, newExp = exp) => updateUserData(value, tier, newExp)} onEditorStateChange={setIsEditingDoc} christmasDoc={christmas.active.doc} christmasDocOwned={ownsChristmas(christmas, 'doc')} />}
          {activeTab === 'shared' && <ArdenneCommunity theme={theme} currentUser={username} user={fullUser} onPublishTransaction={chargePublishing} />}
          {activeTab === 'timetable' && <ArdenneTimetable key={`${prefix}-${username}`} theme={theme} storageKey={`${prefix}_timetable_${username}`} />}
          {activeTab === 'store' && <ArdenneStore theme={theme} credits={credits} tier={tier} purchasedBgs={purchasedBgs} unlockedBorders={unlockedBorders} unlockedTemplates={unlockedTemplates} equippedBorder={equippedBorder} onPurchaseBackground={purchaseBackground} onPurchaseTier={purchaseTier} onPurchaseFrame={(frame, cost) => purchaseProfileItem('unlockedBorders', frame, cost)} onEquipFrame={equipFrame} onPurchaseTemplate={(template, cost) => purchaseProfileItem('unlockedTemplates', template, cost)} christmas={christmas} christmasPreview={christmasPreview} onBuyChristmas={buyChristmasItem} onToggleChristmas={toggleChristmas} />}
          {activeTab === 'settings' && <ArdenneSettings theme={theme} orgName={orgName} user={fullUser} activeBg={activeBg} purchasedBgs={purchasedBgs} unlockedBorders={unlockedBorders} equippedBorder={equippedBorder} initialSection={settingsSection} onSelectBackground={selectBackground} onEquipFrame={equipFrame} onNavigateToStore={() => setActiveTab('store')} onSignOut={onSignOut} christmas={christmas} onToggleChristmas={toggleChristmas} />}
        </main>
      </div>
    </div>
  );
}
