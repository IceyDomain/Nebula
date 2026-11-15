import { PageHead } from './ArdennePortalUI';
import { GRADES, FORMS, formLabel, gradeStudentCount } from './ardennePortalData';

// Teacher page: pick any grade or form to open its portal.
export default function ArdenneFormsGrades({ onOpenGrade, onOpenForm }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PageHead crumb={['Staff', 'Forms & Grades']} title="Forms & Grades" sub="Every grade has forms 1 to 8. Forms are written grade-form, so 7-1 is Grade 7, Form 1." />
      <div className="nd-g3">
        {GRADES.map((g) => (
          <div className="nd-card" key={g}>
            <h3>Grade {g}</h3>
            <div className="nd-b2" style={{ margin: '10px 0 14px' }}>
              {FORMS.map((f) => <button type="button" key={f} className="nd-tag nd-chipbtn" onClick={() => onOpenForm(g, f)}>{formLabel(g, f)}</button>)}
            </div>
            <p>{gradeStudentCount(g)} students signed up</p>
            <div style={{ marginTop: 14 }}><button type="button" className="nd-btn sm ghost" onClick={() => onOpenGrade(g)}>Open Grade {g} portal</button></div>
          </div>
        ))}
      </div>
    </section>
  );
}
