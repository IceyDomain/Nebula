const ALLOWED_TIERS = ['Gold', 'Diamond', 'Ruby', 'Platinum', 'Nebula'];

export default function GameRoomView({ user }) {
  const hasAccess = ALLOWED_TIERS.includes(user?.tier);

  if (!hasAccess) {
    return (
      <section className="locked-feature-card">
        <span className="locked-feature-icon" aria-hidden="true">Lock</span>
        <h2>Game Room Locked</h2>
        <p>Reach <strong>Gold Tier</strong> (Level 100) or purchase it in the Store to unlock mini-games.</p>
        <small>Current tier: {user?.tier || 'Basic'}</small>
      </section>
    );
  }

  return (
    <section className="game-room-card">
      <div className="page-heading"><h2>Game Room</h2><p className="subtext">Your tier unlocks Nebula mini-games.</p></div>
      <div className="game-room-placeholder"><span aria-hidden="true">Play</span><strong>Mini-games are ready for your next session.</strong></div>
    </section>
  );
}
