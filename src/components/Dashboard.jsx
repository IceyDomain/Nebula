import { useState } from 'react';

const TABS = [
  ['overview', 'Overview'],
  ['docs', 'Nebula Docs'],
  ['grades', 'Grade Portals'],
  ['notes', 'Notes'],
  ['store', 'Store'],
  ['events', 'Events'],
];

export default function Dashboard({ user, onSignOut }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [credits, setCredits] = useState(user.credits || 100);
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');

  const buyTheme = () => {
    if (credits < 20) {
      setNotice('You need 20 credits to buy this theme.');
      return;
    }
    setCredits((currentCredits) => currentCredits - 20);
    setNotice('Theme added to your workspace.');
  };

  const postNote = () => {
    if (!note.trim()) {
      setNotice('Write a note before posting.');
      return;
    }
    if (credits < 10) {
      setNotice('You need 10 credits to post a note.');
      return;
    }
    setCredits((currentCredits) => currentCredits - 10);
    setNote('');
    setNotice('Your note was posted.');
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <div className="dash-logo">NEBULA</div>
        <div className="nav-links">
          {TABS.map(([tab, label]) => (
            <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {label}
            </button>
          ))}
        </div>
        <div className="dash-user">
          <span className="credit-pill">🪙 {credits} Credits</span>
          <span className="user-email">{user.email}</span>
          <button type="button" className="signout-btn" onClick={onSignOut}>Sign Out</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && <section className="tab-section">
          <div className="welcome-banner"><h1>Welcome to NEBULA Dashboard</h1><p>Your central platform for docs, grade portals, and store addons.</p></div>
          <div className="dashboard-grid">
            <div className="dash-card"><h3>Overall Performance</h3><p>Track your cumulative progress and metrics across portals.</p></div>
            <div className="dash-card"><h3>Google Classroom</h3><p>Sync your assignments and schedules seamlessly.</p></div>
            <div className="dash-card"><h3>Timetables</h3><p>View upcoming schedules and custom calendar alerts.</p></div>
          </div>
        </section>}

        {activeTab === 'docs' && <section className="tab-section"><h2>Nebula Docs</h2><p className="subtext">Create, collaborate, and store system documentation.</p><div className="dash-card full-width"><p>No documents open. Create a new document to get started.</p></div></section>}

        {activeTab === 'grades' && <section className="tab-section"><h2>Grade Sections</h2><div className="dashboard-grid"><div className="dash-card"><h3>Grade Level Dashboards</h3><p>Split interfaces tailored to specific grade tiers.</p></div><div className="dash-card"><h3>Admin Supervision</h3><p>Level 3 Admin authorization required for management access.</p></div></div></section>}

        {activeTab === 'notes' && <section className="tab-section"><h2>Public Notes Dashboard</h2><p className="subtext">Post notes using credits. Unlimited postage enabled for Premium users.</p><div className="dash-card"><textarea aria-label="Public note" placeholder="Write a public note..." rows="4" value={note} onChange={(event) => setNote(event.target.value)} /><button type="button" className="submit-btn-ref compact-action" onClick={postNote}>Post Note (10 Credits)</button></div></section>}

        {activeTab === 'store' && <section className="tab-section"><h2>Nebula Store</h2><div className="dashboard-grid"><div className="dash-card"><h3>Dashboard Customizations</h3><p>Unlock custom themes and miscellaneous widgets.</p><button type="button" className="submit-btn-ref" onClick={buyTheme}>Buy Theme (20 Credits)</button></div><div className="dash-card"><h3>User Ranks &amp; Benefits</h3><p>Upgrade to Premium for additional perks and chat access.</p></div></div></section>}

        {activeTab === 'events' && <section className="tab-section"><h2>Events Dashboard</h2><div className="dash-card full-width"><h3>Active &amp; Upcoming Events</h3><p>No active events scheduled for today.</p></div></section>}
        {notice && <p className="dashboard-notice" role="status">{notice}</p>}
      </main>
    </div>
  );
}
