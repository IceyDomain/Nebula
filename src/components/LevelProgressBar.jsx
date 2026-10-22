import { calculateProgress, TIER_PERKS } from '../utils/tierSystem';

export default function LevelProgressBar({ exp = 0, tier = 'Basic' }) {
  const progress = calculateProgress(exp);
  const perks = TIER_PERKS[tier] || TIER_PERKS.Basic;

  return (
    <div className="nd-lvl" title={`${progress.currentLevelExp} / ${progress.nextLevelExp} XP`}>
      <div className="nd-lvl-top">
        <b>Lvl {progress.level}</b>
        <span>{perks.boost}x EXP</span>
      </div>
      <div className="nd-bar" role="progressbar" aria-label="Level progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
        <i style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="nd-lvl-bot">{progress.currentLevelExp} / {progress.nextLevelExp} XP</div>
    </div>
  );
}
