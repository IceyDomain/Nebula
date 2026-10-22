// Timetable & Calendar: an empty weekly timetable and a month calendar that students fill in themselves.
// Single file, no extra CSS or image files needed. Data is saved in the browser (localStorage).
//
// Usage:
//   <TimetableCalendar key={username} theme="nebula" storageKey={"nebula_timetable_" + username} />
//   <TimetableCalendar key={username} theme="ardenne" storageKey={"ardenne_timetable_" + username} />
//
// Use key={username} so a different signed-in user gets their own timetable.

import { useEffect, useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TYPES = [
  ["class", "Class"],
  ["study", "Study"],
  ["exam", "Exam"],
  ["personal", "Personal"],
];
const THEMES = {
  nebula: {
    "--tc-bg": "#120024", "--tc-panel": "rgba(255,255,255,0.045)", "--tc-line": "rgba(255,255,255,0.11)",
    "--tc-text": "#F2F0FA", "--tc-muted": "#A8A3BD", "--tc-acc": "#7C3AED", "--tc-acc2": "#38BDF8",
    "--tc-soft": "rgba(139,92,246,0.24)", "--tc-radius": "12px",
  },
  ardenne: {
    "--tc-bg": "#08153A", "--tc-panel": "rgba(255,255,255,0.055)", "--tc-line": "rgba(255,255,255,0.13)",
    "--tc-text": "#F4F6FF", "--tc-muted": "#B3BDDA", "--tc-acc": "#2563EB", "--tc-acc2": "#F5B82E",
    "--tc-soft": "rgba(37,99,235,0.30)", "--tc-radius": "6px",
  },
};

const pad = (n) => String(n).padStart(2, "0");
const toYmd = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const newId = () => Date.now() + Math.floor(Math.random() * 1000);
const DEFAULT_PERIODS = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, time: "" }));

function load(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved && typeof saved === "object") {
      return {
        periods: Array.isArray(saved.periods) && saved.periods.length ? saved.periods : DEFAULT_PERIODS,
        entries: saved.entries && typeof saved.entries === "object" ? saved.entries : {},
        events: Array.isArray(saved.events) ? saved.events : [],
      };
    }
  } catch {
    // fall through to an empty timetable
  }
  return { periods: DEFAULT_PERIODS, entries: {}, events: [] };
}

export default function TimetableCalendar({ theme = "nebula", storageKey = "nebula_timetable" }) {
  const today = new Date();
  const todayStr = toYmd(today);
  const [data, setData] = useState(() => load(storageKey));
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const { periods, entries, events } = data;

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // storage unavailable: keep working in memory
    }
  }, [data, storageKey]);

  useEffect(() => {
    if (!modal) return undefined;
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const closeModal = () => {
    setModal(null);
    setError("");
  };
  const setForm = (patch) => setModal({ ...modal, form: { ...modal.form, ...patch } });

  /* ---------- subjects ---------- */
  const openSubject = (day, periodId) => {
    const key = day + "|" + periodId;
    const existing = entries[key];
    setModal({
      kind: "subject",
      originalKey: existing ? key : null,
      form: existing ? { ...existing, day, period: periodId } : { subject: "", room: "", type: "class", notes: "", day, period: periodId },
    });
  };
  const saveSubject = (e) => {
    e.preventDefault();
    const f = modal.form;
    if (!f.subject.trim()) return setError("Enter a subject name.");
    const key = f.day + "|" + f.period;
    if (entries[key] && key !== modal.originalKey) return setError("That box already has a subject. Open it to edit it.");
    const next = { ...entries };
    if (modal.originalKey) delete next[modal.originalKey];
    next[key] = { subject: f.subject.trim(), room: f.room.trim(), type: f.type, notes: f.notes.trim() };
    setData({ ...data, entries: next });
    closeModal();
  };
  const deleteSubject = () => {
    const next = { ...entries };
    delete next[modal.originalKey];
    setData({ ...data, entries: next });
    closeModal();
  };

  /* ---------- periods ---------- */
  const addPeriod = () => setData({ ...data, periods: [...periods, { id: Math.max(0, ...periods.map((p) => p.id)) + 1, time: "" }] });
  const openPeriod = (p) => setModal({ kind: "period", id: p.id, form: { time: p.time } });
  const savePeriod = (e) => {
    e.preventDefault();
    setData({ ...data, periods: periods.map((p) => (p.id === modal.id ? { ...p, time: modal.form.time.trim() } : p)) });
    closeModal();
  };
  const removePeriod = () => {
    const next = { ...entries };
    DAYS.forEach((d) => delete next[d + "|" + modal.id]);
    setData({ ...data, periods: periods.filter((p) => p.id !== modal.id), entries: next });
    closeModal();
  };

  /* ---------- events ---------- */
  const openEvent = (ev, date) =>
    setModal({
      kind: "event",
      id: ev ? ev.id : null,
      form: ev ? { title: ev.title, date: ev.date, type: ev.type, notes: ev.notes || "" } : { title: "", date: date || todayStr, type: "class", notes: "" },
    });
  const saveEvent = (e) => {
    e.preventDefault();
    const f = modal.form;
    if (!f.title.trim()) return setError("Enter a title.");
    if (!f.date) return setError("Choose a date.");
    const item = { id: modal.id || newId(), title: f.title.trim(), date: f.date, type: f.type, notes: f.notes.trim() };
    setData({ ...data, events: modal.id ? events.map((x) => (x.id === modal.id ? item : x)) : [...events, item] });
    closeModal();
  };
  const deleteEvent = () => {
    setData({ ...data, events: events.filter((x) => x.id !== modal.id) });
    closeModal();
  };

  /* ---------- calendar grid ---------- */
  const first = new Date(cursor.y, cursor.m, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => new Date(cursor.y, cursor.m, i - offset + 1));
  const shiftMonth = (n) => {
    const d = new Date(cursor.y, cursor.m + n, 1);
    setCursor({ y: d.getFullYear(), m: d.getMonth() });
  };
  const upcoming = events.filter((x) => x.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const hasEntries = Object.keys(entries).length > 0;

  return (
    <div className="tc" style={THEMES[theme] || THEMES.nebula}>
      <style>{STYLES}</style>

      <header className="tc-head">
        <h1>Timetable &amp; Calendar</h1>
        <p>Build your own weekly timetable and keep track of important dates.</p>
      </header>

      <section>
        <div className="tc-bar">
          <h2>My Timetable</h2>
          <div className="tc-actions">
            <button type="button" className="tc-btn tc-ghost" onClick={addPeriod}>+ Add period</button>
            <button type="button" className="tc-btn tc-ghost" onClick={() => window.print()}>Print</button>
            <button type="button" className="tc-btn" onClick={() => openSubject("Monday", periods[0] ? periods[0].id : 1)}>+ Add subject</button>
          </div>
        </div>
        {!hasEntries && <p className="tc-hint">Your timetable is empty. Choose <b>Add subject</b>, or select a box, to start filling it in.</p>}
        <div className="tc-table-wrap">
          <div className="tc-table" style={{ gridTemplateColumns: "150px repeat(5, minmax(120px, 1fr))" }}>
            <div className="tc-th tc-left">Period</div>
            {DAYS.map((d) => (
              <div className="tc-th" key={d}>{d}</div>
            ))}
            {periods.map((p, i) => (
              <PeriodRow key={p.id} p={p} n={i + 1} entries={entries} onTime={() => openPeriod(p)} onCell={openSubject} />
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="tc-bar">
          <h2>Calendar</h2>
          <div className="tc-actions">
            <button type="button" className="tc-btn tc-ghost" aria-label="Previous month" onClick={() => shiftMonth(-1)}>&lsaquo;</button>
            <span className="tc-month">{MONTHS[cursor.m]} {cursor.y}</span>
            <button type="button" className="tc-btn tc-ghost" aria-label="Next month" onClick={() => shiftMonth(1)}>&rsaquo;</button>
            <button type="button" className="tc-btn tc-ghost" onClick={() => setCursor({ y: today.getFullYear(), m: today.getMonth() })}>Today</button>
            <button type="button" className="tc-btn" onClick={() => openEvent(null)}>+ Add event</button>
          </div>
        </div>
        <div className="tc-calwrap">
          <div className="tc-cal">
            {WEEKDAYS.map((w) => (
              <div className="tc-wd" key={w}>{w}</div>
            ))}
            {cells.map((d) => {
              const ds = toYmd(d);
              const dayEvents = events.filter((x) => x.date === ds);
              return (
                <div className={"tc-day" + (d.getMonth() !== cursor.m ? " tc-other" : "") + (ds === todayStr ? " tc-today" : "")} key={ds}>
                  <button type="button" className="tc-daynum" aria-label={"Add event on " + ds} onClick={() => openEvent(null, ds)}>{d.getDate()}</button>
                  {dayEvents.slice(0, 2).map((ev) => (
                    <button type="button" key={ev.id} className={"tc-chipev tc-t-" + ev.type} onClick={() => openEvent(ev)}>{ev.title}</button>
                  ))}
                  {dayEvents.length > 2 && <span className="tc-more">+{dayEvents.length - 2} more</span>}
                </div>
              );
            })}
          </div>
          <aside className="tc-side">
            <h3>Upcoming</h3>
            {upcoming.length === 0 ? (
              <p>No events scheduled. Add an event and it will appear here.</p>
            ) : (
              <ul>
                {upcoming.map((ev) => (
                  <li key={ev.id}>
                    <button type="button" onClick={() => openEvent(ev)}>
                      <span className={"tc-dot tc-t-" + ev.type} />
                      <span><b>{ev.title}</b><small>{ev.date}</small></span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="tc-legend">
              {TYPES.map(([k, label]) => (
                <span key={k}><i className={"tc-dot tc-t-" + k} />{label}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {modal && modal.kind === "subject" && (
        <Modal title={modal.originalKey ? "Edit subject" : "Add to timetable"} onClose={closeModal}>
          <form onSubmit={saveSubject} noValidate>
            <Field id="tc-subject" label="Subject">
              <input id="tc-subject" autoFocus value={modal.form.subject} placeholder="e.g. Mathematics" onChange={(e) => setForm({ subject: e.target.value })} />
            </Field>
            <Field id="tc-room" label="Room or teacher (optional)">
              <input id="tc-room" value={modal.form.room} placeholder="e.g. Room 118" onChange={(e) => setForm({ room: e.target.value })} />
            </Field>
            <div className="tc-two">
              <Field id="tc-day" label="Day">
                <select id="tc-day" value={modal.form.day} onChange={(e) => setForm({ day: e.target.value })}>
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
              <Field id="tc-period" label="Period">
                <select id="tc-period" value={modal.form.period} onChange={(e) => setForm({ period: Number(e.target.value) })}>
                  {periods.map((p, i) => <option key={p.id} value={p.id}>Period {i + 1}</option>)}
                </select>
              </Field>
            </div>
            <TypeChips value={modal.form.type} onChange={(type) => setForm({ type })} />
            <Field id="tc-notes" label="Notes (optional)">
              <textarea id="tc-notes" rows="3" value={modal.form.notes} placeholder="Add details or materials" onChange={(e) => setForm({ notes: e.target.value })} />
            </Field>
            {error && <p className="tc-error" role="alert">{error}</p>}
            <Footer onCancel={closeModal} onDelete={modal.originalKey ? deleteSubject : null} saveLabel="Save subject" />
          </form>
        </Modal>
      )}

      {modal && modal.kind === "period" && (
        <Modal title="Period time" onClose={closeModal}>
          <form onSubmit={savePeriod}>
            <Field id="tc-time" label="Time (optional)">
              <input id="tc-time" autoFocus value={modal.form.time} placeholder="e.g. 08:00 - 08:45" onChange={(e) => setForm({ time: e.target.value })} />
            </Field>
            <Footer onCancel={closeModal} onDelete={periods.length > 1 ? removePeriod : null} deleteLabel="Remove period" saveLabel="Save time" />
          </form>
        </Modal>
      )}

      {modal && modal.kind === "event" && (
        <Modal title={modal.id ? "Edit event" : "Add event"} onClose={closeModal}>
          <form onSubmit={saveEvent} noValidate>
            <Field id="tc-title" label="Title">
              <input id="tc-title" autoFocus value={modal.form.title} placeholder="e.g. Physics test" onChange={(e) => setForm({ title: e.target.value })} />
            </Field>
            <Field id="tc-date" label="Date">
              <input id="tc-date" type="date" value={modal.form.date} onChange={(e) => setForm({ date: e.target.value })} />
            </Field>
            <TypeChips value={modal.form.type} onChange={(type) => setForm({ type })} />
            <Field id="tc-enotes" label="Notes (optional)">
              <textarea id="tc-enotes" rows="3" value={modal.form.notes} onChange={(e) => setForm({ notes: e.target.value })} />
            </Field>
            {error && <p className="tc-error" role="alert">{error}</p>}
            <Footer onCancel={closeModal} onDelete={modal.id ? deleteEvent : null} saveLabel="Save event" />
          </form>
        </Modal>
      )}
    </div>
  );
}

function PeriodRow({ p, n, entries, onTime, onCell }) {
  return (
    <>
      <div className="tc-tm">
        <b>Period {n}</b>
        <button type="button" onClick={onTime}>{p.time || "Set time"}</button>
      </div>
      {DAYS.map((d) => {
        const e = entries[d + "|" + p.id];
        return e ? (
          <button type="button" key={d} className={"tc-sub tc-t-" + e.type} onClick={() => onCell(d, p.id)}>
            <b>{e.subject}</b>
            {e.room && <small>{e.room}</small>}
          </button>
        ) : (
          <button type="button" key={d} className="tc-empty" aria-label={"Add subject on " + d + ", Period " + n} onClick={() => onCell(d, p.id)}>+</button>
        );
      })}
    </>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="tc-backdrop" onMouseDown={onClose}>
      <div className="tc-modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <div className="tc-mhead">
          <h2>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}>&times;</button>
        </div>
        <div className="tc-mbody">{children}</div>
      </div>
    </div>
  );
}

function Field({ id, label, children }) {
  return (
    <div className="tc-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

function TypeChips({ value, onChange }) {
  return (
    <div className="tc-field">
      <span className="tc-label">Type</span>
      <div className="tc-chips">
        {TYPES.map(([k, label]) => (
          <button type="button" key={k} className={"tc-chip" + (value === k ? " on" : "")} aria-pressed={value === k} onClick={() => onChange(k)}>{label}</button>
        ))}
      </div>
    </div>
  );
}

function Footer({ onCancel, onDelete, saveLabel, deleteLabel = "Delete" }) {
  return (
    <div className="tc-foot">
      {onDelete && <button type="button" className="tc-btn tc-danger" onClick={onDelete}>{deleteLabel}</button>}
      <span className="tc-grow" />
      <button type="button" className="tc-btn tc-ghost" onClick={onCancel}>Cancel</button>
      <button type="submit" className="tc-btn">{saveLabel}</button>
    </div>
  );
}

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=DM+Sans:wght@400;500;600&display=swap");
.tc { color: var(--tc-text); font-family: "DM Sans", sans-serif; display: flex; flex-direction: column; gap: 28px; }
.tc *, .tc *::before, .tc *::after { box-sizing: border-box; }
.tc h1, .tc h2, .tc h3 { font-family: "Manrope", sans-serif; margin: 0; }
.tc-head h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; }
.tc-head p { margin: 6px 0 0; color: var(--tc-muted); font-size: 16px; }
.tc-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.tc-bar h2 { font-size: 19px; font-weight: 700; }
.tc-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.tc-month { font-family: "Manrope", sans-serif; font-weight: 700; font-size: 16px; min-width: 150px; text-align: center; }
.tc-btn { height: 38px; padding: 0 16px; border: 0; border-radius: var(--tc-radius); background: var(--tc-acc); color: #fff; font: 600 14px "DM Sans", sans-serif; cursor: pointer; }
.tc-btn:hover { filter: brightness(1.12); }
.tc-ghost { background: transparent; border: 1px solid var(--tc-line); color: var(--tc-text); }
.tc-danger { background: transparent; border: 1px solid #F472B6; color: #FBCFE8; }
.tc-hint { margin: 0 0 14px; color: var(--tc-muted); font-size: 14px; }
.tc-hint b { color: var(--tc-text); }

.tc-table-wrap, .tc-calwrap > .tc-cal { overflow-x: auto; }
.tc-table { display: grid; border: 1px solid var(--tc-line); border-radius: var(--tc-radius); overflow: hidden; background: var(--tc-panel); }
.tc-table > * { border-top: 1px solid var(--tc-line); border-left: 1px solid var(--tc-line); min-height: 62px; }
.tc-th { border-top: 0 !important; min-height: 0 !important; padding: 12px; text-align: center; background: rgba(255,255,255,0.06); font: 700 12px "DM Sans", sans-serif; text-transform: uppercase; letter-spacing: 0.1em; color: var(--tc-muted); }
.tc-left { text-align: left; border-left: 0 !important; }
.tc-tm { border-left: 0 !important; padding: 12px 14px; background: rgba(255,255,255,0.03); display: flex; flex-direction: column; gap: 4px; align-items: flex-start; }
.tc-tm b { font-size: 14px; }
.tc-tm button { background: none; border: 0; padding: 0; cursor: pointer; font: 12px "DM Sans", sans-serif; color: var(--tc-acc2); text-decoration: underline; }
.tc-empty { background: transparent; border-bottom: 0; border-right: 0; color: rgba(255,255,255,0.28); font-size: 22px; cursor: pointer; }
.tc-empty:hover { background: var(--tc-soft); color: var(--tc-text); }
.tc-sub { padding: 10px 14px; text-align: left; color: var(--tc-text); font-family: inherit; border-bottom: 0; border-right: 0; background: transparent; cursor: pointer; }
.tc-sub b { display: block; font-size: 14px; }
.tc-sub small { display: block; margin-top: 2px; color: var(--tc-muted); font-size: 12px; }
.tc-sub:hover { background: var(--tc-soft); }
.tc-sub.tc-t-class { box-shadow: inset 3px 0 0 var(--tc-acc); }
.tc-sub.tc-t-study { box-shadow: inset 3px 0 0 #0D9488; }
.tc-sub.tc-t-exam { box-shadow: inset 3px 0 0 #BE185D; }
.tc-sub.tc-t-personal { box-shadow: inset 3px 0 0 #8A97A6; }

.tc-calwrap { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; align-items: start; }
.tc-cal { display: grid; grid-template-columns: repeat(7, minmax(80px, 1fr)); border: 1px solid var(--tc-line); border-radius: var(--tc-radius); overflow: hidden; background: var(--tc-panel); }
.tc-wd { padding: 10px; text-align: center; background: rgba(255,255,255,0.06); font: 700 11px "DM Sans", sans-serif; text-transform: uppercase; letter-spacing: 0.1em; color: var(--tc-muted); }
.tc-day { min-height: 92px; padding: 6px; border-top: 1px solid var(--tc-line); border-left: 1px solid var(--tc-line); display: flex; flex-direction: column; gap: 3px; }
.tc-other .tc-daynum { color: rgba(255,255,255,0.3); }
.tc-daynum { align-self: flex-start; width: 26px; height: 26px; border: 0; border-radius: 50%; background: none; color: var(--tc-text); font: 13px "DM Sans", sans-serif; cursor: pointer; }
.tc-daynum:hover { background: var(--tc-soft); }
.tc-today .tc-daynum { background: var(--tc-acc2); color: #0B0617; font-weight: 700; }
.tc-chipev { border: 0; border-radius: 4px; padding: 3px 6px; text-align: left; color: #fff; font: 600 11px "DM Sans", sans-serif; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tc-chipev.tc-t-class { background: var(--tc-acc); }
.tc-chipev.tc-t-study { background: #0D9488; }
.tc-chipev.tc-t-exam { background: #BE185D; }
.tc-chipev.tc-t-personal { background: #6B7280; }
.tc-more { font-size: 11px; color: var(--tc-muted); }

.tc-side { background: var(--tc-panel); border: 1px solid var(--tc-line); border-radius: var(--tc-radius); padding: 20px; }
.tc-side h3 { font-size: 15px; color: var(--tc-acc2); margin-bottom: 10px; }
.tc-side p { margin: 0; color: var(--tc-muted); font-size: 14px; line-height: 1.55; }
.tc-side ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.tc-side li button { width: 100%; display: flex; gap: 10px; align-items: center; padding: 8px; border: 0; border-radius: 6px; background: none; color: var(--tc-text); text-align: left; font-family: inherit; cursor: pointer; }
.tc-side li button:hover { background: var(--tc-soft); }
.tc-side li small { display: block; color: var(--tc-muted); font-size: 12px; }
.tc-legend { display: flex; flex-direction: column; gap: 8px; margin-top: 18px; font-size: 13px; color: var(--tc-muted); }
.tc-dot { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 8px; flex: none; }
.tc-dot.tc-t-class { background: var(--tc-acc); }
.tc-dot.tc-t-study { background: #0D9488; }
.tc-dot.tc-t-exam { background: #BE185D; }
.tc-dot.tc-t-personal { background: #8A97A6; }

.tc-backdrop { position: fixed; inset: 0; background: rgba(5,3,15,0.7); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 1000; }
.tc-modal { width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; background: #17142A; color: var(--tc-text); border: 1px solid var(--tc-line); border-radius: var(--tc-radius); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }
.tc-mhead { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--tc-line); }
.tc-mhead h2 { font-size: 20px; font-weight: 700; }
.tc-mhead button { background: none; border: 0; color: var(--tc-muted); font-size: 26px; line-height: 1; cursor: pointer; }
.tc-mbody { padding: 22px 24px; }
.tc-mbody form { display: flex; flex-direction: column; gap: 16px; }
.tc-field { display: flex; flex-direction: column; gap: 6px; }
.tc-field label, .tc-label { font-size: 13px; font-weight: 600; color: var(--tc-muted); }
.tc-field input, .tc-field select, .tc-field textarea { width: 100%; min-height: 44px; padding: 10px 14px; border: 1px solid var(--tc-line); border-radius: var(--tc-radius); background: rgba(255,255,255,0.05); color: var(--tc-text); font: 15px "DM Sans", sans-serif; }
.tc-field textarea { resize: vertical; }
.tc-field input:focus, .tc-field select:focus, .tc-field textarea:focus { outline: 2px solid var(--tc-acc2); outline-offset: 1px; }
.tc-field select option { color: #111; }
.tc-two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.tc-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.tc-chip { padding: 8px 14px; border: 1px solid var(--tc-line); border-radius: var(--tc-radius); background: none; color: var(--tc-muted); font: 600 14px "DM Sans", sans-serif; cursor: pointer; }
.tc-chip.on { background: var(--tc-soft); border-color: var(--tc-acc2); color: var(--tc-text); }
.tc-error { margin: 0; padding: 10px 12px; border-radius: 8px; border: 1px solid rgba(244,114,182,0.5); background: rgba(244,114,182,0.12); color: #FBCFE8; font-size: 14px; }
.tc-foot { display: flex; gap: 10px; align-items: center; padding-top: 4px; }
.tc-grow { flex: 1; }

@media (max-width: 860px) {
  .tc-calwrap { grid-template-columns: 1fr; }
  .tc-two { grid-template-columns: 1fr; }
}
@media print {
  .tc-actions, .tc-hint, .tc > section:nth-of-type(2) { display: none; }
}
`;
