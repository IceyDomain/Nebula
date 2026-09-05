const TIER_BORDER_CLASSES = {
  Basic: 'border-basic',
  Bronze: 'border-bronze-glow',
  Copper: 'border-copper-spark',
  Iron: 'border-iron-shield',
  Silver: 'border-silver-shine',
  Gold: 'border-gold-crown',
  Diamond: 'border-diamond-shimmer',
  Ruby: 'border-ruby-flare',
  Platinum: 'border-platinum-halo',
  Nebula: 'border-nebula-pulse',
};

const TIER_BADGES = { Gold: 'crown', Nebula: 'nebula', default: 'shield' };

export default function UserAvatar({ user, size = 'md' }) {
  const tier = user?.tier || 'Basic';
  const username = user?.username || 'User';
  const borderClass = TIER_BORDER_CLASSES[tier] || TIER_BORDER_CLASSES.Basic;
  const badge = TIER_BADGES[tier] || TIER_BADGES.default;

  return (
    <div className={`avatar-wrapper ${size} ${borderClass}`}>
      <div className="avatar-inner">
        {user?.avatarUrl ? <img src={user.avatarUrl} alt={username} /> : <span>{username.charAt(0).toUpperCase()}</span>}
      </div>
      <span className={`tier-icon-badge badge-${badge}`} aria-label={`${tier} tier`}>{badge === 'crown' ? 'C' : badge === 'nebula' ? 'N' : 'S'}</span>
    </div>
  );
}
