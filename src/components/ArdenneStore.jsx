// Ardenne High School version of the Store (includes the Ardenne Blue background).
import { useState } from 'react';
import { getDiscountedStorePrice, TIER_PERKS } from '../utils/tierSystem';
import ChristmasStore from './ChristmasStore';

const BUYABLE_TIERS = Object.entries(TIER_PERKS).filter(([, perks]) => perks.buyable && perks.price > 0);
const STATIC_BACKGROUNDS = [
  { id: 'bg1', name: 'Deep Space Blue', value: '#03071e', cost: 100 },
  { id: 'bg2', name: 'Cyberpunk Neon Pink', value: '#2b092b', cost: 150 },
  { id: 'bg3', name: 'Emerald Nebula', value: '#062c22', cost: 200 },
];
const ANIMATED_BACKGROUNDS = [
  { id: 'abg1', name: 'Quantum Galaxy Flow', value: 'animated-quantum', cost: 400 },
  { id: 'abg2', name: 'Supernova Warp Motion', value: 'animated-supernova', cost: 500 },
];
const ARDENNE_BACKGROUNDS = [{ id: 'ard1', name: 'Ardenne Blue', value: '#08153A', cost: 100 }];
const FRAMES = [['Silver', 'Silver Frame', 'A brushed silver ring.'], ['Gold', 'Gold Frame', 'A polished gold ring.'], ['Platinum', 'Platinum Frame', 'A pale platinum ring.']];
const TEMPLATES = [['Formal Letter', 'A clean letter layout.'], ['Resume Pro', 'A polished resume layout.'], ['Project Proposal Pro', 'A structured proposal layout.']];
const ANIMATED_PREVIEW = 'linear-gradient(-45deg, #0d001a, #001233)';
const swatch = (value) => (value.startsWith('animated') ? ANIMATED_PREVIEW : value);

export default function ArdenneStore({ credits, tier, purchasedBgs, unlockedBorders = ['none'], equippedBorder = 'none', onPurchaseBackground, onPurchaseTier, onPurchaseFrame, onEquipFrame, theme = 'ardenne', christmas, christmasPreview = false, onBuyChristmas, onToggleChristmas }) {
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [filter, setFilter] = useState('all');
  const nextTier = BUYABLE_TIERS.find(([name]) => TIER_PERKS[name].level > (TIER_PERKS[tier]?.level || 0));
  const discount = Math.round((TIER_PERKS[tier]?.discount || 0) * 100);
  const show = (category) => filter === 'all' || filter === category;
  const tabs = [['all', 'All items'], ['christmas', 'Christmas'], ['membership', 'Membership'], ['backgrounds', 'Backgrounds'], ['frames', 'Avatar Frames'], ['templates', 'Document Templates']];
  const backgroundItems = [...(theme === 'ardenne' ? ARDENNE_BACKGROUNDS : []), ...STATIC_BACKGROUNDS, ...ANIMATED_BACKGROUNDS];

  return (
    <section className="nd-store" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="nd-crumb">{theme === 'ardenne' ? 'Portal' : 'Nebula'} / <span>Store</span></div>
        <h1 className="nd-ttl">Store</h1>
        <p className="nd-sub">Spend your Credits on upgrades, backgrounds and extras for your workspace.</p>
      </div>

      <div className="nd-hero" style={{ gap: 40 }}>
        <div className="nd-stat"><b>{credits}</b><span>Credits available</span></div>
        <div className="nd-stat"><b>{tier}</b><span>Current tier</span></div>
        <div className="nd-stat"><b>{discount}%</b><span>Store discount</span></div>
      </div>

      <div className="nd-tabs" role="tablist" aria-label="Store categories">
        {tabs.map(([key, label]) => <button type="button" role="tab" aria-selected={filter === key} key={key} className={filter === key ? 'active' : ''} onClick={() => setFilter(key)}>{label}</button>)}
      </div>

      {show('christmas') && christmas && (
        <div>
          <h2 className="nd-sec">Christmas event</h2>
          <ChristmasStore state={christmas} credits={credits} onBuy={onBuyChristmas} onToggle={onToggleChristmas} preview={christmasPreview} />
        </div>
      )}

      {show('membership') && (
        <div>
          <h2 className="nd-sec">Membership</h2>
          <div className="nd-g3">
            {nextTier ? (
              <div className="nd-card">
                <div className="nd-sw" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', font: '800 26px var(--head)', color: 'var(--acc2)' }}>{nextTier[0]}</div>
                <b>{nextTier[0]} Tier</b>
                <p style={{ fontSize: 14, marginTop: 4 }}>{Math.round(TIER_PERKS[nextTier[0]].discount * 100)}% store discount and {TIER_PERKS[nextTier[0]].boost}x EXP boost.</p>
                <div className="nd-foot"><span>{nextTier[1].price} Credits</span><button type="button" className="nd-btn sm" onClick={() => onPurchaseTier(nextTier[0])}>Upgrade</button></div>
              </div>
            ) : (
              <div className="nd-card"><b>Highest buyable tier reached</b><p style={{ marginTop: 6 }}>Your level progression unlocks higher tiers automatically.</p></div>
            )}
          </div>
        </div>
      )}

      {show('backgrounds') && (
        <div>
          <h2 className="nd-sec">Backgrounds</h2>
          <div className="nd-g3">
            {backgroundItems.map((background) => {
              const owned = purchasedBgs.includes(background.value);
              const animated = background.value.startsWith('animated');
              return (
                <div className="nd-card" key={background.id}>
                  <div className="nd-sw" style={animated ? { background: ANIMATED_PREVIEW, backgroundSize: '400% 400%', animation: 'nebulaGradient 8s ease infinite' } : { background: background.value }} />
                  <b>{background.name}</b>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{animated ? 'Animated background.' : 'Solid color background.'}</p>
                  <div className="nd-foot">
                    <span>{background.cost} Credits</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="nd-btn sm ghost" onClick={() => setSelectedPreview(background)}>Preview</button>
                      <button type="button" className="nd-btn sm" disabled={owned} onClick={() => onPurchaseBackground(background.value, background.cost)}>{owned ? 'Unlocked' : 'Buy'}</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {show('frames') && (
        <div>
          <h2 className="nd-sec">Avatar Frames</h2>
          <div className="nd-g3">
            {FRAMES.map(([ring, name, desc]) => {
              const owned = unlockedBorders.includes(ring);
              const equipped = equippedBorder === ring;
              const price = getDiscountedStorePrice(300, tier);
              return (
                <div className="nd-card" key={name}>
                  <div className="nd-sw" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className={`nd-av nd-av-md nd-ring-${ring}`}><div className="nd-av-in">S</div></div>
                  </div>
                  <b>{name}</b>
                  <p style={{ fontSize: 14, marginTop: 4 }}>{desc}</p>
                  <div className="nd-foot">
                    <span>{price} Credits {price !== 300 && <small style={{ textDecoration: 'line-through', opacity: 0.7 }}>300</small>}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="nd-btn sm" disabled={owned} onClick={() => onPurchaseFrame?.(ring, 300)}>{owned ? 'Unlocked' : 'Unlock'}</button>
                      {owned && <button type="button" className="nd-btn sm ghost" disabled={equipped} onClick={() => onEquipFrame?.(ring)}>{equipped ? 'Equipped' : 'Equip'}</button>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {show('templates') && (
        <div>
          <h2 className="nd-sec">Document Templates</h2>
          <div className="nd-g3">
            {TEMPLATES.map(([name, desc]) => (
              <div className="nd-card" key={name}>
                <div className="nd-sw" style={{ backgroundColor: '#fff', backgroundImage: 'repeating-linear-gradient(#fff 0 10px,#e5e7eb 10px 12px)' }} />
                <b>{name}</b>
                <p style={{ fontSize: 14, marginTop: 4 }}>{desc}</p>
                <div className="nd-foot"><span>Coming soon</span><button type="button" className="nd-btn sm" disabled>Buy</button></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPreview && (
        <div className="nd-modal-back" onClick={() => setSelectedPreview(null)}>
          <div className="nd-modal" role="dialog" aria-modal="true" aria-label="Preview" onClick={(event) => event.stopPropagation()}>
            <h3>Preview: {selectedPreview.name}</h3>
            <div className="nd-sw" style={{ height: 160, background: swatch(selectedPreview.value) }} />
            <p style={{ color: '#a8a3bd', margin: 0 }}>Cost: <strong style={{ color: '#f2f0fa' }}>{selectedPreview.cost} Credits</strong></p>
            <div className="nd-modal-actions" style={{ marginTop: 16 }}>
              <button type="button" className="nd-btn ghost" onClick={() => setSelectedPreview(null)}>Close</button>
              {!purchasedBgs.includes(selectedPreview.value) && (
                <button type="button" className="nd-btn" onClick={() => { onPurchaseBackground(selectedPreview.value, selectedPreview.cost); setSelectedPreview(null); }}>Confirm Purchase</button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
