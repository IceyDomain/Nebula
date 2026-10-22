const TIER_RINGS = ['Basic', 'Bronze', 'Copper', 'Iron', 'Silver', 'Gold', 'Diamond', 'Ruby', 'Platinum', 'Nebula'];
const TIER_BADGES = { Gold: 'C', Nebula: 'N' };

export default function UserAvatar({ user, size = 'md' }) {
  const tier = TIER_RINGS.includes(user?.tier) ? user.tier : 'Basic';
  const frame = user?.equippedBorder && user.equippedBorder !== 'none' ? user.equippedBorder : tier;
  const username = user?.username || 'User';

  return (
    <div className={`nd-av nd-av-${size} nd-ring-${frame}`}>
      <div className="nd-av-in">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt={username} /> : <span>{username.charAt(0).toUpperCase()}</span>}
      </div>
      <span className="nd-av-badge" aria-label={`${tier} tier`}>{TIER_BADGES[tier] || 'S'}</span>
    </div>
  );
}
