import { useState } from 'react';
import { Banner, Dialog, Empty, PageHead, Stat } from './ArdennePortalUI';
import { HOUSES, HOUSE_RULES_TEXT, awardPoints, getHouseOf, getHousePoints, getPointLog, timeAgo } from './ardennePortalData';

export default function ArdenneHouses({ viewer }) {
  const isTeacher = viewer.role === 'teacher';
  const [tick, setTick] = useState(0);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ house: HOUSES[0].id, points: 10, reason: '' });
  const [error, setError] = useState('');
  const points = getHousePoints(); const houseOf = getHouseOf(); const log = getPointLog().slice(0, 8);
  const standings = HOUSES.map((h) => ({ ...h, points: points[h.id] || 0, members: Object.values(houseOf).filter((x) => x === h.id).length })).sort((a, b) => b.points - a.points);
  const max = Math.max(1, ...standings.map((s) => s.points));
  const mine = houseOf[viewer.username];
  const mineRow = standings.find((s) => s.id === mine);
  const submit = (e) => {
    e.preventDefault();
    const n = Number(form.points);
    if (!n) return setError('Enter the number of points (it can be negative).');
    if (!form.reason.trim()) return setError('Enter a reason.');
    awardPoints(form.house, n, form.reason.trim(), viewer.username);
    setDialog(false); setError(''); setForm({ house: HOUSES[0].id, points: 10, reason: '' }); setTick(tick + 1);
  };
  return (
    <section key={tick} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHead crumb={['Portal', 'Houses']} title="Houses" sub="House points for this term." actions={isTeacher && <button type="button" className="nd-btn" onClick={() => setDialog(true)}>Award points</button>} />
      {!isTeacher && (
        <Banner side={<><Stat label="House points" value={mineRow ? mineRow.points : 0} /><Stat label="Standing" value={mineRow ? `#${standings.indexOf(mineRow) + 1}` : '-'} /></>}>
          <div className="nd-sp" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>Your house</div>
          <div style={{ font: '700 24px var(--head)', marginTop: 4 }}>{mineRow ? mineRow.name : 'Not assigned yet'}</div>
          {!mineRow && <div className="nd-sp" style={{ marginTop: 6 }}>Your form teacher assigns your house.</div>}
        </Banner>
      )}
      <div className="nd-card">
        <h3>Standings</h3>
        {standings.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 14 }}>
            <b style={{ width: 24 }}>{i + 1}</b>
            <span style={{ width: 110, fontWeight: 600 }}><span className="nd-dot" style={{ background: s.color }} />{s.name}</span>
            <div className="nd-hb" style={{ flex: 1 }}><i style={{ width: `${Math.max(2, (s.points / max) * 100)}%`, background: s.color }} /></div>
            <span style={{ width: 70, textAlign: 'right' }}>{s.points}</span>
          </div>
        ))}
      </div>
      <div className="nd-g3">
        <div className="nd-card"><h3>How points are earned</h3><p>{HOUSE_RULES_TEXT}</p></div>
        <div className="nd-card"><h3>Recent points</h3>{log.length === 0 ? <p>No points awarded yet.</p> : log.map((l) => <p key={l.id} style={{ marginTop: 8 }}><b style={{ color: 'var(--text)' }}>{l.points > 0 ? '+' : ''}{l.points}</b> to {(HOUSES.find((h) => h.id === l.houseId) || {}).name} · {l.reason} <small>({timeAgo(l.time)})</small></p>)}</div>
      </div>
      {dialog && (
        <Dialog title="Award points" onClose={() => setDialog(false)}>
          <form onSubmit={submit} noValidate>
            <select className="nd-inp" aria-label="House" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })}>{HOUSES.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select>
            <input className="nd-inp" type="number" aria-label="Points" value={form.points} onChange={(e) => setForm({ ...form, points: e.target.value })} />
            <input className="nd-inp" placeholder="Reason" aria-label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            {error && <p role="alert" style={{ margin: 0, color: '#fbcfe8' }}>{error}</p>}
            <div className="nd-modal-actions"><button type="button" className="nd-btn ghost" onClick={() => setDialog(false)}>Cancel</button><button type="submit" className="nd-btn">Award</button></div>
          </form>
        </Dialog>
      )}
    </section>
  );
}
