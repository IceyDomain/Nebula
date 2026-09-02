const SCHEDULE = [
  ['09:00', 'Physics', 'Room 204', 'violet'],
  ['11:00', 'Nebula Docs', 'Library Lab', 'cyan'],
  ['14:00', 'Mathematics', 'Room 118', 'pink'],
];

export default function PersonalTimetable() {
  return (
    <section className="timetable-container">
      <div className="page-heading"><h2>Personal Timetable</h2><p className="subtext">Your upcoming classes, assignments, and reminders.</p></div>
      <div className="schedule-list">{SCHEDULE.map(([time, title, location, tone]) => <div className={`schedule-row ${tone}`} key={`${time}-${title}`}><time>{time}</time><div><h3>{title}</h3><p>{location}</p></div><span>Upcoming</span></div>)}</div>
    </section>
  );
}
