import { useState } from 'react';
import { Banner, Dialog, Empty, Initial, PageHead, Tabs } from './ArdennePortalUI';
import { AnnouncementFeed, PostAnnouncement } from './ArdenneAnnouncements';
import { CLUB_CATEGORIES, addSuggestion, createClub, deleteClub, getClubs, getSuggestions, joinClub, leaveClub, membersOf, myClubIds, removeSuggestion } from './ardennePortalData';

export default function ArdenneClubs({ viewer }) {
  const isTeacher = viewer.role === 'teacher';
  const [tick, setTick] = useState(0);
  const [openId, setOpenId] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [post, setPost] = useState(false);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');
  const [tab, setTab] = useState('about');
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const refresh = () => setTick(tick + 1);
  const clubs = getClubs();
  const mine = myClubIds(viewer.username);
  const suggestions = getSuggestions();
  const club = clubs.find((c) => c.id === openId);

  const submitClub = (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) return setError('Enter a club name.');
    createClub({ name: form.name.trim(), category: form.category || 'Other', description: (form.description || '').trim(), meets: (form.meets || '').trim(), advisor: viewer.username, createdBy: viewer.username });
    setDialog(null); setForm({}); setError(''); refresh();
  };
  const submitSuggestion = (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) return setError('Enter a club name.');
    addSuggestion({ name: form.name.trim(), description: (form.description || '').trim(), by: viewer.username });
    setDialog(null); setForm({}); setError(''); refresh();
  };

  if (club) {
    const members = membersOf(club.id); const joined = mine.includes(club.id);
    return (
      <section key={tick} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <PageHead crumb={['Portal', 'Clubs', club.name]} title={club.name} sub={club.meets ? `Meets ${club.meets}` : 'Meeting time not set yet.'}
          actions={<><button type="button" className="nd-btn ghost" onClick={() => setOpenId(null)}>All clubs</button>
            {!isTeacher && (joined ? <button type="button" className="nd-btn ghost" onClick={() => { leaveClub(club.id, viewer.username); refresh(); }}>Leave club</button> : <button type="button" className="nd-btn" onClick={() => { joinClub(club.id, viewer.username); refresh(); }}>Join</button>)}
            {isTeacher && <button type="button" className="nd-btn" onClick={() => setPost(true)}>Post to club</button>}
            {isTeacher && <button type="button" className="nd-btn danger" onClick={() => { if (window.confirm('Delete this club?')) { deleteClub(club.id); setOpenId(null); } }}>Delete club</button>}</>} />
        <Tabs items={[['about', 'About'], ['announcements', 'Announcements'], ['members', 'Members']]} value={tab} onChange={setTab} />
        {tab === 'about' && <div className="nd-g3"><div className="nd-card"><h3>About the club</h3><p>{club.description || 'No description yet.'}</p></div><div className="nd-card"><h3>Teacher advisor</h3><p>{club.advisor}</p></div><div className="nd-card"><h3>Members</h3><p>{members.length}</p></div></div>}
        {tab === 'announcements' && <div className="nd-card"><AnnouncementFeed viewer={viewer} scope={(a) => a.audience.type === 'club' && a.audience.clubId === club.id} emptyText="No announcements from this club yet." onChanged={refresh} /></div>}
        {tab === 'members' && (members.length === 0 ? <Empty title="No members yet" text="Students appear here after they join." /> : <div className="nd-dl"><div className="nd-r h" style={{ gridTemplateColumns: '1fr' }}><span>Member</span></div>{members.map((m) => <div className="nd-r" key={m} style={{ gridTemplateColumns: '1fr' }}><span className="n"><Initial name={m} />{m}</span></div>)}</div>)}
        {post && <PostAnnouncement viewer={viewer} defaultAudience={{ type: 'club', clubId: club.id }} onClose={() => setPost(false)} onPosted={refresh} />}
      </section>
    );
  }

  const shown = clubs.filter((c) => (cat === 'All' || c.category === cat) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <section key={tick} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHead crumb={['Portal', 'Clubs']} title="Clubs" sub="Find a club and join it."
        actions={isTeacher ? <button type="button" className="nd-btn" onClick={() => { setForm({ category: 'Academic' }); setError(''); setDialog('club'); }}>Create a club</button> : <button type="button" className="nd-btn ghost" onClick={() => { setForm({}); setError(''); setDialog('suggest'); }}>Suggest a new club</button>} />
      <div className="nd-toolbar">
        <input className="nd-inp" style={{ maxWidth: 320 }} placeholder="Search clubs" aria-label="Search clubs" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="nd-inp" style={{ maxWidth: 220 }} aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}><option>All</option>{CLUB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      </div>
      {clubs.length === 0 ? <Empty title="No clubs yet" text={isTeacher ? 'Create the first club for your students.' : 'Clubs will appear here when teachers create them.'} /> : shown.length === 0 ? <Empty title="No clubs match" text="Try a different search." /> : (
        <div className="nd-g3">
          {shown.map((c) => (
            <div className="nd-card" key={c.id}>
              <h3>{c.name}</h3>
              <p>{c.description || 'No description yet.'}</p>
              <div className="nd-foot"><span style={{ fontSize: 13 }}><span className="nd-tag">{c.category}</span> {membersOf(c.id).length} members</span>
                <button type="button" className="nd-btn sm ghost" onClick={() => { setOpenId(c.id); setTab('about'); }}>{mine.includes(c.id) ? 'Open (joined)' : 'View'}</button></div>
            </div>
          ))}
        </div>
      )}
      {isTeacher && suggestions.length > 0 && (
        <div><h2 className="nd-sec">Club suggestions from students</h2>
          <div className="nd-dl">{suggestions.map((s) => (
            <div className="nd-r" key={s.id} style={{ gridTemplateColumns: '1.2fr 1.6fr auto' }}>
              <span className="n">{s.name}</span><span>{s.description || 'No description'} <small style={{ color: 'var(--muted)' }}>by {s.by}</small></span>
              <span className="nd-b2"><button type="button" className="nd-btn sm" onClick={() => { createClub({ name: s.name, category: 'Other', description: s.description, meets: '', advisor: viewer.username, createdBy: viewer.username }); removeSuggestion(s.id); refresh(); }}>Create club</button><button type="button" className="nd-btn sm ghost" onClick={() => { removeSuggestion(s.id); refresh(); }}>Dismiss</button></span>
            </div>))}</div></div>
      )}
      {dialog === 'club' && (
        <Dialog title="Create a club" onClose={() => setDialog(null)}>
          <form onSubmit={submitClub} noValidate>
            <input className="nd-inp" placeholder="Club name" aria-label="Club name" autoFocus value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="nd-inp" aria-label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CLUB_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            <input className="nd-inp" placeholder="When and where it meets (optional)" aria-label="Meeting time" value={form.meets || ''} onChange={(e) => setForm({ ...form, meets: e.target.value })} />
            <textarea className="nd-inp" rows="4" placeholder="What the club does" aria-label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {error && <p role="alert" style={{ margin: 0, color: '#fbcfe8' }}>{error}</p>}
            <div className="nd-modal-actions"><button type="button" className="nd-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="nd-btn">Create</button></div>
          </form>
        </Dialog>
      )}
      {dialog === 'suggest' && (
        <Dialog title="Suggest a new club" onClose={() => setDialog(null)}>
          <form onSubmit={submitSuggestion} noValidate>
            <input className="nd-inp" placeholder="Club name" aria-label="Club name" autoFocus value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="nd-inp" rows="4" placeholder="What would the club do?" aria-label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {error && <p role="alert" style={{ margin: 0, color: '#fbcfe8' }}>{error}</p>}
            <div className="nd-modal-actions"><button type="button" className="nd-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="nd-btn">Send to teachers</button></div>
          </form>
        </Dialog>
      )}
    </section>
  );
}
