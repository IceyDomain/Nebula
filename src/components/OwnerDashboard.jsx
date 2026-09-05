export default function OwnerDashboard({ user, onSignOut }) {
  if (!user || user.role !== 'owner') {
    return (
      <main className="dashboard-page access-denied-page">
        <section className="access-denied-card"><h1>Access Restricted</h1><p>This area is reserved for the site owner.</p><button type="button" className="signout-btn" onClick={onSignOut}>Return to Sign In</button></section>
      </main>
    );
  }

  return (
    <div className="dashboard-page owner-theme">
      <nav className="dashboard-nav"><div className="dash-logo">NEBULA [OWNER CONTROL]</div><div className="dash-user"><span className="owner-badge">👑 System Owner</span><span>{user.username}</span><button type="button" className="signout-btn" onClick={onSignOut}>Sign Out</button></div></nav>
      <main className="dashboard-content"><h1>Owner Control Center</h1><p className="subtext">Full system authority, credit generation, and admin management.</p><div className="dashboard-grid"><div className="dash-card"><h3>Manage Admin Levels</h3><p>Promote users to Level 1-3 Admin roles.</p></div><div className="dash-card"><h3>Global Store &amp; Credits</h3><p>Adjust item pricing and issue unlimited credits.</p></div></div></main>
    </div>
  );
}
