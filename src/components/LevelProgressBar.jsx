import { calculateProgress, TIER_PERKS } from '../utils/tierSystem';

export default function LevelProgressBar({ exp = 0, tier = 'Basic' }) {
  const progress = calculateProgress(exp);
  const perks = TIER_PERKS[tier] || TIER_PERKS.Basic;

  return (
    <div className="level-badge-container" title={`${progress.currentLevelExp} / ${progress.nextLevelExp} XP`}>
      <div className="level-badge-info">
        <span className="lvl-title">Lvl {progress.level}</span>
        <span className="boost-tag">{perks.boost}x EXP</span>
      </div>
      <div className="xp-track" aria-label={`${progress.percent}% to next level`}>
        <div className="xp-fill" style={{ width: `${progress.percent}%` }} />
      </div>
      <span className="xp-text">{progress.currentLevelExp} / {progress.nextLevelExp} XP</span>
    </div>
  );
}
