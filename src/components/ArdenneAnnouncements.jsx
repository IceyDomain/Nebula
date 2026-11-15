import { useState } from 'react';
import { Dialog, Empty } from './ArdennePortalUI';
import { GRADES, FORMS, HOUSES, getAnnouncements, postAnnouncement, deleteAnnouncement, visibleTo, audienceLabel, getClubs, timeAgo } from './ardennePortalData';

// Shows announcements this person is allowed to see. `scope` can narrow the list (for example one form).
export function AnnouncementFeed({ viewer, scope, emptyText = 'No announcements yet.', onChanged }) {
  const list = getAnnouncements().filter((a) => visibleTo(a, viewer)).filter((a) => !scope || scope(a))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.id - a.id);
  if (list.length === 0) return <p style={{ margin: 0, color: 'var(--muted)' }}>{emptyText}</p>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {list.map((a) => (
        <article key={a.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="nd-tag">{audienceLabel(a.audience)}</span>
            {a.pinned && <span className="nd-tag">Pinned</span>}
            <small style={{ color: 'var(--muted)' }}>{a.author} · {timeAgo(a.time)}</small>
            {viewer.role === 'teacher' && a.author === viewer.username && (
              <button type="button" className="nd-btn sm ghost" style={{ marginLeft: 'auto' }} onClick={() => { deleteAnnouncement(a.id); onChanged && onChanged(); }}>Delete</button>
            )}
          </div>
          <h4 style={{ margin: '8px 0 4px', font: '700 16px var(--head)' }}>{a.title}</h4>
          <p style={{ margin: 0, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{a.body}</p>
        </article>
      ))}
    </div>
  );
}

export function PostAnnouncement({ viewer, defaultAudience, onClose, onPosted }) {
  const clubs = getClubs();
  const [type, setType] = useState(defaultAudience?.type || 'form');
  const [grade, setGrade] = useState(defaultAudience?.grade || viewer.grade || GRADES[0]);
  const [form, setForm] = useState(defaultAudience?.form || viewer.form || 1);
  const [house, setHouse] = useState(HOUSES[0].id);
  const [club, setClub] = useState(defaultAudience?.clubId || (clubs[0] && clubs[0].id) || '');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return setError('Enter a title and a message.');
    const audience = { type, ...(type === 'grade' ? { grade } : {}), ...(type === 'form' ? { grade, form } : {}), ...(type === 'house' ? { houseId: house } : {}), ...(type === 'club' ? { clubId: club } : {}) };
    if (type === 'club' && !club) return setError('Create a club first, or choose another audience.');
    postAnnouncement({ audience, title: title.trim(), body: body.trim(), pinned, author: viewer.username, authorRole: viewer.role });
    onPosted && onPosted();
    onClose();
  };

  return (
    <Dialog title="Post announcement" onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <label style={{ color: '#c9c5da', fontSize: 13 }} htmlFor="an-type">Send to</label>
        <select id="an-type" className="nd-inp" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="form">A form</option><option value="grade">A grade</option><option value="school">The whole school</option>
          <option value="house">A house</option>{clubs.length > 0 && <option value="club">A club</option>}
        </select>
        {(type === 'grade' || type === 'form') && (
          <div style={{ display: 'grid', gridTemplateColumns: type === 'form' ? '1fr 1fr' : '1fr', gap: 12 }}>
            <select className="nd-inp" aria-label="Grade" value={grade} onChange={(e) => setGrade(Number(e.target.value))}>{GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}</select>
            {type === 'form' && <select className="nd-inp" aria-label="Form" value={form} onChange={(e) => setForm(Number(e.target.value))}>{FORMS.map((f) => <option key={f} value={f}>Form {f}</option>)}</select>}
          </div>
        )}
        {type === 'house' && <select className="nd-inp" aria-label="House" value={house} onChange={(e) => setHouse(e.target.value)}>{HOUSES.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select>}
        {type === 'club' && <select className="nd-inp" aria-label="Club" value={club} onChange={(e) => setClub(e.target.value)}>{clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
        <input className="nd-inp" placeholder="Title" aria-label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="nd-inp" rows="5" placeholder="Write your announcement" aria-label="Message" value={body} onChange={(e) => setBody(e.target.value)} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#c9c5da', fontSize: 14 }}><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} style={{ width: 'auto' }} />Pin to the top</label>
        {error && <p role="alert" style={{ margin: 0, color: '#fbcfe8', fontSize: 14 }}>{error}</p>}
        <div className="nd-modal-actions"><button type="button" className="nd-btn ghost" onClick={onClose}>Cancel</button><button type="submit" className="nd-btn">Post</button></div>
      </form>
    </Dialog>
  );
}

export function AnnouncementsPage({ viewer }) {
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }} key={tick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div><div className="nd-crumb">Portal / <span>Announcements</span></div><h1 className="nd-ttl">Announcements</h1><p className="nd-sub">Messages from the school, your grade, your form, your house and your clubs.</p></div>
        {viewer.role === 'teacher' && <button type="button" className="nd-btn" onClick={() => setOpen(true)}>Post announcement</button>}
      </div>
      <div className="nd-card"><AnnouncementFeed viewer={viewer} emptyText="No announcements yet." onChanged={() => setTick(tick + 1)} /></div>
      {open && <PostAnnouncement viewer={viewer} onClose={() => setOpen(false)} onPosted={() => setTick(tick + 1)} />}
      {viewer.role !== 'teacher' && <Empty title="Only teachers can post" text="You will see messages here when your teachers post them." />}
    </section>
  );
}
