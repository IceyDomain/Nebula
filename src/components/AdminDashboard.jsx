export default function AdminDashboard({ user, onSignOut }) {
  return (
    <div className="dashboard-page admin-theme">
      <nav className="dashboard-nav"><div className="dash-logo">NEBULA [ADMIN PORTAL]</div><div className="dash-user"><span className="admin-badge">🛡️ Level {user.adminLevel || 3} Admin</span><span>{user.username}</span><button type="button" className="signout-btn" onClick={onSignOut}>Sign Out</button></div></nav>
      <main className="dashboard-content"><h1>Grade &amp; Section Management</h1><div className="dashboard-grid"><div className="dash-card"><h3>Grade Level Controls</h3><p>Oversee assigned grade section dashboards.</p></div><div className="dash-card"><h3>Public Notes Moderation</h3><p>Review and moderate public board posts.</p></div></div></main>
    </div>
  );
}
