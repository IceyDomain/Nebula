const TIER_RINGS = ['Basic', 'Bronze', 'Copper', 'Iron', 'Silver', 'Gold', 'Diamond', 'Ruby', 'Platinum', 'Nebula'];
const TIER_BADGES = { Gold: 'C', Nebula: 'N' };

// Explicit frames override the tier ring; Christmas also adds the event hat.
export default function UserAvatar({ user, size = 'md', frame }) {
  const tier = TIER_RINGS.includes(user?.tier) ? user.tier : 'Basic';
  const username = user?.username || 'User';
  const xmas = frame === 'christmas';
  const ring = xmas ? 'Christmas' : TIER_RINGS.includes(frame) ? frame : tier;

  return (
    <div className={`nd-av nd-av-${size} nd-ring-${ring}`}>
      <div className="nd-av-in">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt={username} /> : <span>{username.charAt(0).toUpperCase()}</span>}
      </div>
      <span className="nd-av-badge" aria-label={`${tier} tier`}>{TIER_BADGES[tier] || 'S'}</span>
      {xmas && (
        <svg className="nd-av-hat" viewBox="0 0 64 64" aria-hidden="true">
          <path d="M10 46c4-20 14-34 30-34 6 0 10 3 12 8 3 7-2 16-6 26z" fill="#c62828" />
          <rect x="6" y="42" width="48" height="12" rx="6" fill="#fff" />
          <circle cx="52" cy="14" r="7" fill="#fff" />
        </svg>
      )}
    </div>
  );
}
