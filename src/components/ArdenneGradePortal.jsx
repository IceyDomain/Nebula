import { useState } from 'react';
import { Banner, PageHead, Tabs, Empty } from './ArdennePortalUI';
import { AnnouncementFeed, PostAnnouncement } from './ArdenneAnnouncements';
import { FORMS, formLabel, studentsInForm } from './ardennePortalData';

// One grade's portal (for example Grade 9) with its forms 1 to 8.
export default function ArdenneGradePortal({ grade, viewer, onOpenForm }) {
  const [tab, setTab] = useState('overview');
  const [post, setPost] = useState(false);
  const [tick, setTick] = useState(0);
  const isTeacher = viewer.role === 'teacher';
  const scope = (a) => a.audience.type === 'grade' && Number(a.audience.grade) === Number(grade);
  const ownForm = (f) => !isTeacher && Number(viewer.grade) === Number(grade) && Number(viewer.form) === f;

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }} key={tick}>
      <PageHead crumb={['Portal', `Grade ${grade}`]} title={`Grade ${grade} Portal`} sub={`Everything for Grade ${grade} in one place.`}
        actions={isTeacher && <button type="button" className="nd-btn" onClick={() => setPost(true)}>Post to Grade {grade}</button>} />
      <Banner side={<div><div className="nd-sp">Forms</div><b>{FORMS.length} forms</b></div>}>
        <div className="nd-sp" style={{ textTransform: 'uppercase', letterSpacing: '.1em' }}>Grade coordinator</div>
        <div style={{ font: '700 22px var(--head)', marginTop: 4 }}>Not set yet</div>
      </Banner>
      <Tabs items={[['overview', 'Overview'], ['announcements', 'Announcements'], ['forms', 'Forms']]} value={tab} onChange={setTab} />

      {tab !== 'forms' && (
        <div className="nd-card"><h3>Grade {grade} announcements</h3><AnnouncementFeed viewer={viewer} scope={scope} emptyText={`No announcements for Grade ${grade} yet.`} onChanged={() => setTick(tick + 1)} /></div>
      )}
      {(tab === 'overview' || tab === 'forms') && (
        <div>
          <h2 className="nd-sec">Forms in Grade {grade}</h2>
          <div className="nd-g4">
            {FORMS.map((f) => {
              const count = studentsInForm(grade, f).length;
              const canOpen = isTeacher || ownForm(f);
              return (
                <button type="button" className="nd-tile" key={f} disabled={!canOpen} onClick={() => onOpenForm(grade, f)} style={{ opacity: canOpen ? 1 : 0.6, cursor: canOpen ? 'pointer' : 'default' }}>
                  Form {formLabel(grade, f)}<small>{count} {count === 1 ? 'student' : 'students'}{ownForm(f) ? ' · Your form' : ''}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {tab === 'overview' && <Empty title="Discussion" text="Grade discussions can be added here later." />}
      {post && <PostAnnouncement viewer={viewer} defaultAudience={{ type: 'grade', grade }} onClose={() => setPost(false)} onPosted={() => setTick(tick + 1)} />}
    </section>
  );
}
