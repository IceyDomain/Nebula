const ALLOWED_TIERS = ['Gold', 'Diamond', 'Ruby', 'Platinum', 'Nebula'];

export default function GameRoomView({ user, onGoToStore }) {
  const hasAccess = ALLOWED_TIERS.includes(user?.tier);

  if (!hasAccess) {
    return (
      <section className="nd-card nd-lock">
        <div className="nd-lock-ring" aria-hidden="true">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 018 0v3" />
          </svg>
        </div>
        <h2>Game Room Locked</h2>
        <p>Reach <strong style={{ color: 'var(--text)' }}>Gold Tier</strong> (Level 100) or buy it in the Store to unlock mini-games.</p>
        <p style={{ marginTop: 12, fontSize: 13 }}>Current tier: {user?.tier || 'Basic'}</p>
        {onGoToStore && <div style={{ marginTop: 22 }}><button type="button" className="nd-btn" onClick={onGoToStore}>Go to the Store</button></div>}
      </section>
    );
  }

  return (
    <section>
      <h1 className="nd-ttl">Game Room</h1>
      <p className="nd-sub">Your tier unlocks Nebula mini-games.</p>
      <div className="nd-empty" style={{ marginTop: 24 }}><b>Mini-games are ready for your next session.</b>Games will appear here.</div>
    </section>
  );
}
