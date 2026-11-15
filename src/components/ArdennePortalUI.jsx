// Small shared pieces for the Ardenne portal pages.
import { useEffect } from 'react';

export function PageHead({ crumb, title, sub, actions }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div>
        <div className="nd-crumb">{crumb.map((c, i) => (i === crumb.length - 1 ? <span key={c}>{c}</span> : <span key={c} style={{ color: 'inherit' }}>{c} / </span>))}</div>
        <h1 className="nd-ttl">{title}</h1>
        {sub && <p className="nd-sub">{sub}</p>}
      </div>
      {actions && <div className="nd-b2">{actions}</div>}
    </div>
  );
}

export function Banner({ children, side }) {
  return <div className="nd-ban"><div>{children}</div>{side && <div className="nd-b2" style={{ alignItems: 'center' }}>{side}</div>}</div>;
}

export function Tabs({ items, value, onChange }) {
  return (
    <div className="nd-tabs" role="tablist">
      {items.map(([key, label]) => <button type="button" role="tab" aria-selected={value === key} key={key} className={value === key ? 'active' : ''} onClick={() => onChange(key)}>{label}</button>)}
    </div>
  );
}

export const Initial = ({ name }) => <span className="nd-av2" aria-hidden="true">{String(name || '?').charAt(0).toUpperCase()}</span>;

export function Stat({ label, value, note }) {
  return <div className="nd-card nd-stat nd-stat-accent"><span>{label}</span><b>{value}</b>{note && <span style={{ fontSize: 12 }}>{note}</span>}</div>;
}

export function Dialog({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="nd-modal-back" onMouseDown={onClose}>
      <div className="nd-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export const Empty = ({ title, text, action }) => (
  <div className="nd-empty"><b>{title}</b>{text}{action && <div style={{ marginTop: 14 }}>{action}</div>}</div>
);
