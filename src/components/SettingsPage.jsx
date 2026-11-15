import { useEffect, useState } from 'react';
import { calculateProgress } from '../utils/tierSystem';
import { ITEMS as XMAS_ITEMS, owns as ownsXmas } from './christmas';

const BASE_DEFAULTS = [{ name: 'Solid Black', value: '#000000' }, { name: 'Classic White', value: '#ffffff' }];
const ANIMATED_PREVIEW = 'linear-gradient(-45deg, #0d001a, #001233)';
const swatch = (value) => (value.startsWith('animated-') ? ANIMATED_PREVIEW : value);

export default function SettingsPage({ user, activeBg, purchasedBgs, unlockedBorders = [], equippedBorder = 'none', onEquipFrame, initialSection = 'appearance', onNavigateToStore, onSelectBackground, onSignOut, theme = 'nebula', orgName = '', christmas, onToggleChristmas }) {
  const [section, setSection] = useState(initialSection);
  const [previewBg, setPreviewBg] = useState(null);
  useEffect(() => setSection(initialSection), [initialSection]);
  const firstDefault = theme === 'ardenne' ? { name: 'Ardenne Light', value: '#eef2f9' } : { name: 'Default Purple', value: '#120024' };
  const defaults = [firstDefault, ...(theme === 'ardenne' ? [{ name: 'Ardenne Navy', value: '#08153A' }] : []), ...BASE_DEFAULTS];
  const extras = purchasedBgs.filter((value) => !defaults.some((background) => background.value === value));
  const backgrounds = [...defaults, ...extras.map((value, index) => ({ name: `Custom Background ${index + 1}`, value }))];
  const apply = (value) => { onSelectBackground(value); setPreviewBg(null); };
  const level = calculateProgress(user.exp || 0).level;

  return (
    <section className="nd-settings">
      <div>
        <div className="nd-crumb">{theme === 'ardenne' ? 'Portal' : 'Nebula'} / <span>Settings</span></div>
        <h1 className="nd-ttl">Settings</h1>
        <p className="nd-sub">Manage your profile, appearance and account.</p>
      </div>

      <div className="nd-setwrap" style={{ marginTop: 24 }}>
        <nav className="nd-card nd-setnav" aria-label="Settings sections">
          {[['profile', 'Profile'], ['appearance', 'Appearance'], ...(christmas && christmas.owned.length > 0 ? [['event', 'Christmas']] : []), ['account', 'Account']].map(([key, label]) => (
            <button type="button" key={key} className={section === key ? 'active' : ''} onClick={() => setSection(key)}>{label}</button>
          ))}
        </nav>

        <div className="nd-card" style={{ padding: 0 }}>
          {section === 'profile' && (
            <>
              <div className="nd-sethd"><h3>Profile</h3></div>
              <Row k="Username" v={user.username} />
              <Row k="Organization" v={orgName || 'Personal account'} />
              <Row k="Tier" v={user.tier || 'Basic'} />
              <Row k="Level" v={level} />
              {unlockedBorders.filter((frame) => frame !== 'none').map((frame) => (
                <div className="nd-setrow" key={frame}>
                  <span className="v">{frame} Frame</span>
                  <button type="button" className="nd-btn sm" disabled={equippedBorder === frame} onClick={() => onEquipFrame?.(frame)}>{equippedBorder === frame ? 'Equipped' : 'Equip'}</button>
                </div>
              ))}
              <div className="nd-setrow">
                <span className="v">Unlock frames, backgrounds and more.</span>
                <button type="button" className="nd-btn sm" onClick={onNavigateToStore}>Visit Store</button>
              </div>
            </>
          )}

          {section === 'appearance' && (
            <>
              <div className="nd-sethd"><h3>Appearance</h3><p>Choose the background used across your workspace.</p></div>
              {backgrounds.map((background) => {
                const active = activeBg === background.value;
                return (
                  <div className="nd-setrow" key={background.value}>
                    <span style={{ width: 56, height: 36, borderRadius: 6, border: '1px solid var(--line)', background: swatch(background.value) }} />
                    <span className="v">{background.name}</span>
                    <span className={`nd-status ${active ? 'on' : ''}`}>{active ? 'In use' : 'Available'}</span>
                    <button type="button" className="nd-btn sm ghost" onClick={() => setPreviewBg(background.value)}>Preview</button>
                    <button type="button" className="nd-btn sm" disabled={active} onClick={() => apply(background.value)}>{active ? 'Applied' : 'Apply'}</button>
                  </div>
                );
              })}
            </>
          )}

          {section === 'event' && christmas && (
            <>
              <div className="nd-sethd"><h3>Christmas</h3><p>Switch your Christmas items on or off.</p></div>
              {XMAS_ITEMS.filter((item) => ownsXmas(christmas, item.id)).map((item) => (
                <div className="nd-setrow" key={item.id}>
                  <span className="v">{item.name}</span>
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={!!christmas.active[item.id]} onChange={(e) => onToggleChristmas(item.id, e.target.checked)} />Use</label>
                </div>
              ))}
            </>
          )}

          {section === 'account' && (
            <>
              <div className="nd-sethd"><h3>Account</h3></div>
              <Row k="Signed in as" v={user.username} />
              <div className="nd-setrow">
                <span className="k">Session</span>
                <span className="v" />
                <button type="button" className="nd-btn danger" onClick={onSignOut}>Sign out</button>
              </div>
            </>
          )}
        </div>
      </div>

      {previewBg && (
        <div className="nd-modal-back" onClick={() => setPreviewBg(null)}>
          <div className="nd-modal" role="dialog" aria-modal="true" aria-label="Background preview" onClick={(event) => event.stopPropagation()}>
            <h3>Background Preview</h3>
            <div className="nd-sw" style={{ height: 160, background: swatch(previewBg) }} />
            <p style={{ color: '#a8a3bd', marginTop: 0 }}>This is how your workspace background will look.</p>
            <div className="nd-modal-actions">
              <button type="button" className="nd-btn ghost" onClick={() => setPreviewBg(null)}>Close Preview</button>
              <button type="button" className="nd-btn" onClick={() => apply(previewBg)}>Apply This Background</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Row({ k, v }) {
  return (
    <div className="nd-setrow">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
