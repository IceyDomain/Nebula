import { useState } from 'react';
import { Banner, PageHead, Tabs, Initial, Empty } from './ArdennePortalUI';
import { AnnouncementFeed, PostAnnouncement } from './ArdenneAnnouncements';
import { HOUSES, formLabel, studentsInForm, teacherOfForm, getHouseOf, setHouseOf } from './ardennePortalData';

// One form's portal (for example 7-1). Students see their own form; teachers can open any form.
export default function ArdenneFormPage({ grade, form, viewer, onBack }) {
  const [tab, setTab] = useState('overview');
  const [post, setPost] = useState(false);
  const [tick, setTick] = useState(0);
  const label = formLabel(grade, form);
  const students = studentsInForm(grade, form);
  const teacher = teacherOfForm(grade, form);
  const houseOf = getHouseOf();
  const isTeacher = viewer.role === 'teacher';
  const scope = (a) => (a.audience.type === 'form' && Number(a.audience.grade) === Number(grade) && Number(a.audience.form) === Number(form));

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }} key={tick}>
      <PageHead crumb={['Portal', `Grade ${grade}`, `Form ${label}`]} title={`Form ${label}`} sub={`Grade ${grade}, Form ${form}`}
        actions={<>{onBack && <button type="button" className="nd-btn ghost" onClick={onBack}>Back</button>}{isTeacher && <button type="button" className="nd-btn" onClick={() => setPost(true)}>Post to Form {label}</button>}</>} />
      <Banner side={<><div><div className="nd-sp">Form teacher</div><b>{teacher || 'Not set yet'}</b></div><div><div className="nd-sp">Students</div><b>{students.length}</b></div></>}>
        <div className="nd-sp" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>Your form class space</div>
        <div style={{ font: '700 24px var(--head)', marginTop: 4 }}>Form {label}</div>
      </Banner>
      <Tabs items={[['overview', 'Overview'], ['announcements', 'Announcements'], ['students', isTeacher ? 'Students' : 'Classmates']]} value={tab} onChange={setTab} />

      {tab === 'overview' && (
        <div className="nd-g3">
          <div className="nd-card"><h3>Form announcements</h3><AnnouncementFeed viewer={viewer} scope={scope} emptyText="Messages from the form teacher appear here." onChanged={() => setTick(tick + 1)} /></div>
          <div className="nd-card"><h3>Students</h3><p>{students.length} {students.length === 1 ? 'student has' : 'students have'} joined this form.</p></div>
          <div className="nd-card"><h3>Form teacher</h3><p>{teacher || 'No form teacher has joined this form yet.'}</p></div>
        </div>
      )}
      {tab === 'announcements' && <div className="nd-card"><AnnouncementFeed viewer={viewer} scope={scope} emptyText="No announcements for this form yet." onChanged={() => setTick(tick + 1)} /></div>}
      {tab === 'students' && (students.length === 0 ? <Empty title="No students yet" text="Students appear here after they sign up with this grade and form." /> : (
        <div className="nd-dl">
          <div className="nd-r h" style={{ gridTemplateColumns: isTeacher ? '1.5fr 1fr' : '1fr' }}><span>Student</span>{isTeacher && <span>House</span>}</div>
          {students.map((s) => (
            <div className="nd-r" key={s.username} style={{ gridTemplateColumns: isTeacher ? '1.5fr 1fr' : '1fr' }}>
              <span className="n"><Initial name={s.username} />{s.username}</span>
              {isTeacher && (
                <select className="nd-inp" aria-label={`House for ${s.username}`} value={houseOf[s.username] || ''} onChange={(e) => { setHouseOf(s.username, e.target.value); setTick(tick + 1); }}>
                  <option value="">Not assigned</option>{HOUSES.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
      ))}
      {post && <PostAnnouncement viewer={viewer} defaultAudience={{ type: 'form', grade, form }} onClose={() => setPost(false)} onPosted={() => setTick(tick + 1)} />}
    </section>
  );
}
