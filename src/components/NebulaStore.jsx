import { useState } from 'react';
import { TIER_PERKS } from '../utils/tierSystem';

const BUYABLE_TIERS = Object.entries(TIER_PERKS).filter(([, perks]) => perks.buyable && perks.price > 0);

export default function NebulaStore({ credits, tier, purchasedBgs, onPurchaseBackground, onPurchaseTier }) {
  const [selectedPreview, setSelectedPreview] = useState(null);
  const staticBackgrounds = [{ id: 'bg1', name: 'Deep Space Blue', value: '#03071e', cost: 100 }, { id: 'bg2', name: 'Cyberpunk Neon Pink', value: '#2b092b', cost: 150 }, { id: 'bg3', name: 'Emerald Nebula', value: '#062c22', cost: 200 }];
  const animatedBackgrounds = [{ id: 'abg1', name: 'Quantum Galaxy Flow', value: 'animated-quantum', cost: 400 }, { id: 'abg2', name: 'Supernova Warp Motion', value: 'animated-supernova', cost: 500 }];
  const nextTier = BUYABLE_TIERS.find(([name]) => TIER_PERKS[name].level > (TIER_PERKS[tier]?.level || 0));

  return (
    <section className="store-container">
      <div className="page-heading"><h2>Nebula Store</h2><p className="subtext">Customize your workspace and unlock membership benefits.</p></div>
      <section className="store-section"><h3>⭐ Subscriptions & Tiers</h3><div className="store-grid">{nextTier ? <div className="store-card"><h4>{nextTier[0]} Tier</h4><p>{Math.round(TIER_PERKS[nextTier[0]].discount * 100)}% store discount and {TIER_PERKS[nextTier[0]].boost}x EXP boost.</p><div className="card-footer"><span className="cost-tag">{nextTier[1].price} Credits</span><button type="button" className="buy-btn" onClick={() => onPurchaseTier(nextTier[0])}>Upgrade</button></div></div> : <div className="store-card"><h4>Highest Buyable Tier Reached</h4><p>Your level progression unlocks higher tiers automatically.</p></div>}</div></section>
      <BackgroundSection title="🖼️ Standard Backgrounds" items={staticBackgrounds} purchasedBgs={purchasedBgs} onPreview={setSelectedPreview} onPurchase={onPurchaseBackground} />
      <BackgroundSection title="✨ Premium Animated Backgrounds" items={animatedBackgrounds} purchasedBgs={purchasedBgs} onPreview={setSelectedPreview} onPurchase={onPurchaseBackground} animated />
      {selectedPreview && <div className="preview-modal-overlay"><div className="preview-modal-card"><h3>Preview: {selectedPreview.name}</h3><div className="modal-swatch-large" style={{ background: selectedPreview.value.startsWith('animated') ? 'linear-gradient(-45deg, #0d001a, #001233)' : selectedPreview.value }} /><p>Cost: <strong>{selectedPreview.cost} Credits</strong></p><div className="preview-modal-actions">{!purchasedBgs.includes(selectedPreview.value) && <button type="button" className="buy-btn" onClick={() => { onPurchaseBackground(selectedPreview.value, selectedPreview.cost); setSelectedPreview(null); }}>Confirm Purchase</button>}<button type="button" className="cancel-btn" onClick={() => setSelectedPreview(null)}>Close</button></div></div></div>}
    </section>
  );
}

function BackgroundSection({ title, items, purchasedBgs, onPreview, onPurchase, animated = false }) {
  return <section className="store-section"><h3>{title}</h3><div className="store-grid">{items.map((background) => { const owned = purchasedBgs.includes(background.value); return <div className={`store-card ${animated ? 'animated-card' : ''}`} key={background.id}><div className={`store-preview-swatch ${animated ? 'animated-swatch' : ''}`} style={animated ? undefined : { backgroundColor: background.value }} /><h4>{background.name}</h4><div className="card-footer"><span className="cost-tag">{background.cost} Credits</span><div className="btn-group"><button type="button" className="preview-btn" onClick={() => onPreview(background)}>Preview</button><button type="button" className="buy-btn" disabled={owned} onClick={() => onPurchase(background.value, background.cost)}>{owned ? 'Unlocked' : 'Buy'}</button></div></div></div>; })}</div></section>;
}
