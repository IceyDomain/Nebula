import { ITEMS, PACKAGE, SAVINGS, SEPARATE_TOTAL, allOwned, daysLeft, eventWindow, formatDay, isEventActive, owns } from './christmas';

const Hat = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M10 46c4-20 14-34 30-34 6 0 10 3 12 8 3 7-2 16-6 26z" fill="#c62828" />
    <rect x="6" y="42" width="48" height="12" rx="6" fill="#fff" />
    <circle cx="52" cy="14" r="7" fill="#fff" />
  </svg>
);
const Preview = ({ id }) => {
  if (id === 'logo') return <div className="nd-sw nd-xm-prev"><Hat size={52} /></div>;
  if (id === 'frame') return <div className="nd-sw nd-xm-prev"><div className="nd-av nd-av-md nd-ring-Christmas"><div className="nd-av-in">S</div></div></div>;
  if (id === 'doc') return <div className="nd-sw nd-xm-prev" style={{ padding: 0, alignItems: 'stretch', justifyContent: 'flex-start', flexDirection: 'column', background: '#fff' }}><div style={{ height: 22, background: 'repeating-linear-gradient(45deg,#c62828 0 10px,#fff 10px 20px)' }} /><div style={{ padding: 10 }}><div style={{ height: 8, width: '55%', background: '#c62828', borderRadius: 2, marginBottom: 6 }} /><div style={{ height: 4, background: '#d1d5db', marginBottom: 4 }} /><div style={{ height: 4, width: '70%', background: '#d1d5db' }} /></div></div>;
  return <div className="nd-sw nd-xm-prev" style={{ background: 'linear-gradient(135deg,#7f1d1d,#14532d)' }}><span style={{ color: '#fff', fontWeight: 800 }}>Christmas</span></div>;
};

// Props: state = { owned, active }, credits, onBuy(itemId), onToggle(itemId, boolean).
export default function ChristmasStore({ state, credits, onBuy, onToggle, preview = false }) {
  const live = preview || isEventActive();
  const { start, end } = eventWindow();
  const left = daysLeft();
  const complete = allOwned(state);
  const canBuy = (price) => live && credits >= price;

  const buyButton = (id, price) => (
    <button type="button" className="nd-btn sm" disabled={!canBuy(price)} onClick={() => onBuy(id)} title={!live ? 'Returns in December' : credits < price ? 'Not enough Credits' : ''}>
      {live ? (credits < price ? 'Not enough Credits' : 'Buy') : 'Returns in December'}
    </button>
  );

  return (
    <div className="nd-xm" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="nd-xm-banner">
        <div>
          <div className="nd-xm-kicker">{live ? 'Limited-time event' : 'Christmas event'}</div>
          <h2>Christmas</h2>
          <p>{preview ? 'Preview mode: Christmas items are temporarily enabled for this local preview.' : live ? `On now until ${formatDay(end)}. ${left} ${left === 1 ? 'day' : 'days'} left. Everything you buy is yours to keep all year.` : `Starts ${formatDay(start)} and ends ${formatDay(end)}. Items you already own can still be used any time.`}</p>
        </div>
        <Hat size={72} />
      </div>

      <div className="nd-card nd-xm-package">
        <div style={{ flex: 1, minWidth: 240 }}>
          <h3>{PACKAGE.name}</h3>
          <p>{PACKAGE.desc}</p>
          <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--muted)', lineHeight: 1.7 }}>{ITEMS.map((i) => <li key={i.id}>{i.name}</li>)}</ul>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'var(--muted)', textDecoration: 'line-through' }}>{SEPARATE_TOTAL} Credits</div>
          <div style={{ font: '800 30px var(--head)' }}>{PACKAGE.price} Credits</div>
          <div className="nd-tag" style={{ margin: '6px 0 12px' }}>Save {SAVINGS} Credits</div>
          <div>{complete ? <span className="nd-tag">Owned</span> : buyButton(PACKAGE.id, PACKAGE.price)}</div>
        </div>
      </div>

      <div className="nd-g4">
        {ITEMS.map((item) => {
          const own = owns(state, item.id);
          return (
            <div className="nd-card" key={item.id}>
              <Preview id={item.id} />
              <b>{item.name}</b>
              <p style={{ fontSize: 14, marginTop: 4 }}>{item.desc}</p>
              <div className="nd-foot">
                {own ? (
                  <>
                    <span className="nd-tag">Owned</span>
                    <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><input type="checkbox" checked={!!state.active[item.id]} onChange={(e) => onToggle(item.id, e.target.checked)} />Use</label>
                  </>
                ) : (<><span>{item.price} Credits</span>{buyButton(item.id, item.price)}</>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
