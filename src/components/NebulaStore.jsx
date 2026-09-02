import { useState } from 'react';

export default function NebulaStore({ credits, tier, purchasedBgs, onPurchaseBackground, onUpdateUserData }) {
  const [selectedPreview, setSelectedPreview] = useState(null);
  const staticBackgrounds = [{ id: 'bg1', name: 'Deep Space Blue', value: '#03071e', cost: 100 }, { id: 'bg2', name: 'Cyberpunk Neon Pink', value: '#2b092b', cost: 150 }, { id: 'bg3', name: 'Emerald Nebula', value: '#062c22', cost: 200 }];
  const animatedBackgrounds = [{ id: 'abg1', name: 'Quantum Galaxy Flow', value: 'animated-quantum', cost: 400 }, { id: 'abg2', name: 'Supernova Warp Motion', value: 'animated-supernova', cost: 500 }];
  const upgradeTier = () => {
    if (tier === 'Pro') return alert('You are already on the Pro Tier.');
    if (credits < 500) return alert('Not enough credits to upgrade.');
    onUpdateUserData(credits - 500, 'Pro');
  };

  return (
    <section className="store-container">
      <div className="page-heading"><h2>Nebula Store</h2><p className="subtext">Customize your workspace and unlock membership benefits.</p></div>
      <section className="store-section"><h3>⭐ Subscriptions & Tiers</h3><div className="store-grid"><div className="store-card"><h4>Pro Membership Upgrade</h4><p>Get publishing discounts, extra note storage, and custom themes.</p><div className="card-footer"><span className="cost-tag">500 Credits</span><button type="button" className="buy-btn" disabled={tier === 'Pro'} onClick={upgradeTier}>{tier === 'Pro' ? 'Active' : 'Upgrade'}</button></div></div></div></section>
      <BackgroundSection title="🖼️ Standard Backgrounds" items={staticBackgrounds} purchasedBgs={purchasedBgs} onPreview={setSelectedPreview} onPurchase={onPurchaseBackground} />
      <BackgroundSection title="✨ Premium Animated Backgrounds" items={animatedBackgrounds} purchasedBgs={purchasedBgs} onPreview={setSelectedPreview} onPurchase={onPurchaseBackground} animated />
      {selectedPreview && <div className="preview-modal-overlay"><div className="preview-modal-card"><h3>Preview: {selectedPreview.name}</h3><div className="modal-swatch-large" style={{ background: selectedPreview.value.startsWith('animated') ? 'linear-gradient(-45deg, #0d001a, #001233)' : selectedPreview.value }} /><p>Cost: <strong>{selectedPreview.cost} Credits</strong></p><div className="preview-modal-actions">{!purchasedBgs.includes(selectedPreview.value) && <button type="button" className="buy-btn" onClick={() => { onPurchaseBackground(selectedPreview.value, selectedPreview.cost); setSelectedPreview(null); }}>Confirm Purchase</button>}<button type="button" className="cancel-btn" onClick={() => setSelectedPreview(null)}>Close</button></div></div></div>}
    </section>
  );
}

function BackgroundSection({ title, items, purchasedBgs, onPreview, onPurchase, animated = false }) {
  return <section className="store-section"><h3>{title}</h3><div className="store-grid">{items.map((background) => { const owned = purchasedBgs.includes(background.value); return <div className={`store-card ${animated ? 'animated-card' : ''}`} key={background.id}><div className={`store-preview-swatch ${animated ? 'animated-swatch' : ''}`} style={animated ? undefined : { backgroundColor: background.value }} /><h4>{background.name}</h4><div className="card-footer"><span className="cost-tag">{background.cost} Credits</span><div className="btn-group"><button type="button" className="preview-btn" onClick={() => onPreview(background)}>Preview</button><button type="button" className="buy-btn" disabled={owned} onClick={() => onPurchase(background.value, background.cost)}>{owned ? 'Unlocked' : 'Buy'}</button></div></div></div>; })}</div></section>;
}
