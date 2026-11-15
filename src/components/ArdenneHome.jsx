import { useState } from 'react';
import { Banner, PageHead, Stat } from './ArdennePortalUI';
import { AnnouncementFeed, PostAnnouncement } from './ArdenneAnnouncements';
import { HOUSES, formLabel, getAnnouncements, getClubs, getHouseOf, myClubIds, studentsInForm } from './ardennePortalData';
import { TIER_PERKS, calculateProgress } from '../utils/tierSystem';

function readUpcoming(storageKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    const today = new Date().toISOString().slice(0, 10);
    return (Array.isArray(saved?.events) ? saved.events : []).filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  } catch { return []; }
}
const dateLine = () => new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export function StudentHome({ viewer, credits, tier, exp, notesCount, timetableKey, onNavigate }) {
  const progress = calculateProgress(exp);
  const upcoming = readUpcoming(timetableKey);
  const nextTier = Object.entries(TIER_PERKS).find(([, p]) => p.level > (TIER_PERKS[tier]?.level || 0));
  const house = HOUSES.find((h) => h.id === getHouseOf()[viewer.username]);
  const clubCount = myClubIds(viewer.username).length;
  const hasForm = viewer.grade && viewer.form;
  const spaces = [
    ['form', hasForm ? `Form ${formLabel(viewer.grade, viewer.form)}` : 'My Form', hasForm ? `Grade ${viewer.grade}, Form ${viewer.form}` : 'Your grade and form are not set'],
    ['grade', hasForm ? `Grade ${viewer.grade} Portal` : 'My Grade', 'Announcements and forms for your grade'],
    ['house', house ? house.name : 'My House', house ? 'Your house' : 'Not assigned yet'],
    ['club', 'My Clubs', `${clubCount} joined`],
  ];
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHead crumb={['Portal', 'Dashboard']} title="Student Dashboard" sub={dateLine()} />
      <div><h2 className="nd-sec">My spaces</h2>
        <div className="nd-g4">{spaces.map(([key, title, sub]) => <button type="button" className="nd-tile" key={key} onClick={() => onNavigate(key)}>{title}<small>{sub}</small></button>)}</div></div>
      <div className="nd-g4">
        <Stat label="Level" value={progress.level} note={`${progress.currentLevelExp} / ${progress.nextLevelExp} XP`} />
        <Stat label="Credits" value={credits} note="Spend them in the Store" />
        <Stat label="Tier" value={tier} note={nextTier ? `Next: ${nextTier[0]} at Level ${nextTier[1].level}` : 'Highest tier'} />
        <Stat label="Saved notes" value={notesCount} note="In your Docs library" />
      </div>
      <div className="nd-g3">
        <div className="nd-card" style={{ gridColumn: 'span 2' }}><h3>Announcements</h3><AnnouncementFeed viewer={viewer} emptyText="No announcements yet. Messages from your teachers appear here." /></div>
        <div className="nd-card"><h3>Upcoming events</h3>{upcoming.length === 0 ? <p>No upcoming events. Add one in Timetable &amp; Calendar.</p> : upcoming.map((e) => <p key={e.id} style={{ marginTop: 8 }}><b style={{ color: 'var(--text)' }}>{e.title}</b><br />{e.date}</p>)}</div>
      </div>
      <div><h2 className="nd-sec">Quick links</h2>
        <div className="nd-b2">
          <a className="nd-btn" href="https://classroom.google.com" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>Open Google Classroom</a>
          <button type="button" className="nd-btn ghost" onClick={() => onNavigate('timetable')}>Timetable &amp; Calendar</button>
          <button type="button" className="nd-btn ghost" onClick={() => onNavigate('notes')}>Notes &amp; Docs</button>
        </div></div>
    </section>
  );
}

export function TeacherHome({ viewer, onNavigate }) {
  const [post, setPost] = useState(false);
  const [tick, setTick] = useState(0);
  const hasForm = viewer.grade && viewer.form;
  const students = hasForm ? studentsInForm(viewer.grade, viewer.form) : [];
  const mine = getAnnouncements().filter((a) => a.author === viewer.username).length;
  return (
    <section key={tick} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHead crumb={['Staff', 'Dashboard']} title="Teacher Dashboard" sub={dateLine()} />
      <Banner side={<><button type="button" className="nd-btn" onClick={() => setPost(true)}>Post announcement</button><a className="nd-btn ghost" href="https://classroom.google.com" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center' }}>Open Google Classroom</a></>}>
        <div className="nd-sp" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>Welcome back</div>
        <div style={{ font: '700 24px var(--head)', marginTop: 4 }}>{viewer.username}</div>
        <div className="nd-sp" style={{ marginTop: 6 }}>{hasForm ? `Form teacher of Form ${formLabel(viewer.grade, viewer.form)}` : 'Your form is not set'}</div>
      </Banner>
      <div className="nd-g4">
        <Stat label="My form" value={hasForm ? formLabel(viewer.grade, viewer.form) : '-'} />
        <Stat label="Students in my form" value={students.length} />
        <Stat label="Announcements I posted" value={mine} />
        <Stat label="Clubs" value={getClubs().length} />
      </div>
      {hasForm && (
        <div><h2 className="nd-sec">My form</h2>
          <div className="nd-dl"><div className="nd-r h" style={{ gridTemplateColumns: '1.4fr 1fr 120px' }}><span>Form</span><span>Students</span><span /></div>
            <div className="nd-r" style={{ gridTemplateColumns: '1.4fr 1fr 120px' }}><span className="n">Form {formLabel(viewer.grade, viewer.form)}<small>Grade {viewer.grade} · Form teacher</small></span><span>{students.length}</span><button type="button" className="nd-btn sm ghost" onClick={() => onNavigate('form')}>Open</button></div></div></div>
      )}
      <div className="nd-card"><h3>Your announcements</h3><AnnouncementFeed viewer={viewer} scope={(a) => a.author === viewer.username} emptyText="Announcements you post appear here." onChanged={() => setTick(tick + 1)} /></div>
      {post && <PostAnnouncement viewer={viewer} defaultAudience={hasForm ? { type: 'form', grade: viewer.grade, form: viewer.form } : undefined} onClose={() => setPost(false)} onPosted={() => setTick(tick + 1)} />}
    </section>
  );
}
