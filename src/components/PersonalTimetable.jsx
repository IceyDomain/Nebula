import { useEffect, useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = Array.from({ length: 12 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);
const DEFAULT_EVENTS = [
  { id: 1, title: 'Physics', room: 'Room 204', day: 'Monday', time: '09:00', duration: 1, category: 'class', description: 'Bring lab manual' },
  { id: 2, title: 'Nebula Docs Study', room: 'Library Lab', day: 'Wednesday', time: '11:00', duration: 2, category: 'study', description: 'Review project notes' },
  { id: 3, title: 'Mathematics', room: 'Room 118', day: 'Friday', time: '14:00', duration: 1, category: 'exam', description: 'Quiz on Algebra' },
];
const EMPTY_FORM = { title: '', room: '', day: 'Monday', time: '08:00', duration: 1, category: 'class', description: '' };

function readEvents() {
  try {
    const savedEvents = JSON.parse(localStorage.getItem('nebula_timetable_events') || 'null');
    return Array.isArray(savedEvents) ? savedEvents.map((event) => ({ ...event, duration: event.duration || 1, description: event.description || '' })) : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

export default function PersonalTimetable() {
  const [viewMode, setViewMode] = useState('week');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [events, setEvents] = useState(readEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formState, setFormState] = useState(EMPTY_FORM);
  const displayedDays = viewMode === 'day' ? [selectedDay] : DAYS;

  useEffect(() => {
    localStorage.setItem('nebula_timetable_events', JSON.stringify(events));
  }, [events]);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }
    if (Notification.permission === 'granted') {
      setNotificationsEnabled((enabled) => !enabled);
      if (!notificationsEnabled) new Notification('Nebula Timetable', { body: 'Notifications are now enabled for your schedule.' });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        new Notification('Nebula Timetable', { body: 'Notifications enabled successfully.' });
      }
    } else {
      alert('Notification permissions are blocked in your browser settings.');
    }
  };

  const openAddModal = (day = 'Monday', time = '08:00') => {
    setEditingId(null);
    setFormState({ ...EMPTY_FORM, day, time });
    setIsModalOpen(true);
  };

  const openEditModal = (event, clickEvent) => {
    clickEvent.stopPropagation();
    setEditingId(event.id);
    setFormState({ title: event.title, room: event.room || '', day: event.day, time: event.time, duration: event.duration || 1, category: event.category || 'class', description: event.description || '' });
    setIsModalOpen(true);
  };

  const saveEvent = (submitEvent) => {
    submitEvent.preventDefault();
    if (!formState.title.trim()) return;
    const eventData = { ...formState, title: formState.title.trim() };
    setEvents(editingId !== null ? events.map((event) => event.id === editingId ? { ...event, ...eventData } : event) : [...events, { ...eventData, id: Date.now() }]);
    setIsModalOpen(false);
  };

  const deleteEvent = () => {
    setEvents(events.filter((event) => event.id !== editingId));
    setIsModalOpen(false);
  };

  return (
    <section className="gcal-timetable-container">
      <div className="gcal-toolbar">
        <div className="gcal-toolbar-left">
          <h2>Personal Schedule</h2>
          <div className="view-switcher" role="group" aria-label="Calendar view">
            <button type="button" className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week View</button>
            <button type="button" className={`view-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>Day View</button>
          </div>
          {viewMode === 'day' && <select className="day-select-dropdown" aria-label="Selected day" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>{DAYS.map((day) => <option key={day}>{day}</option>)}</select>}
        </div>
        <div className="gcal-toolbar-right">
          <button type="button" className={`notification-toggle-btn ${notificationsEnabled ? 'enabled' : ''}`} onClick={toggleNotifications}>{notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}</button>
          <button type="button" className="primary-add-btn" onClick={() => openAddModal()}>+ Create Event</button>
        </div>
      </div>
      <div className="gcal-grid-card">
        <div className="gcal-grid" style={{ gridTemplateColumns: `70px repeat(${displayedDays.length}, minmax(130px, 1fr))` }}>
          <div className="grid-corner-cell">GMT-5</div>
          {displayedDays.map((day) => <div className="grid-day-header" key={day}><span className="day-name">{day.slice(0, 3).toUpperCase()}</span></div>)}
          {TIME_SLOTS.map((time) => <div className="gcal-grid-row" key={time}>
            <div className="grid-time-label">{time}</div>
            {displayedDays.map((day) => <div className="grid-time-cell" key={`${day}-${time}`} onClick={() => openAddModal(day, time)}>
              {events.filter((event) => event.day === day && event.time === time).map((event) => <button type="button" className={`gcal-event-chip category-${event.category}`} style={{ height: `${(event.duration || 1) * 100}%` }} key={event.id} onClick={(clickEvent) => openEditModal(event, clickEvent)}>
                <span className="chip-time">{event.time}</span><span className="chip-title">{event.title}</span>{event.room && <span className="chip-sub">{event.room}</span>}
              </button>)}
            </div>)}
          </div>)}
        </div>
      </div>
      {isModalOpen && <div className="gcal-modal-backdrop" onClick={() => setIsModalOpen(false)}>
        <div className="gcal-modal-card" role="dialog" aria-modal="true" aria-labelledby="gcal-modal-title" onClick={(clickEvent) => clickEvent.stopPropagation()}>
          <div className="gcal-modal-header"><h3 id="gcal-modal-title">{editingId !== null ? 'Edit Event Details' : 'Add New Event'}</h3><button type="button" className="close-x" aria-label="Close dialog" onClick={() => setIsModalOpen(false)}>X</button></div>
          <form onSubmit={saveEvent}>
            <div className="input-group"><input className="title-input" required aria-label="Event title" value={formState.title} onChange={(event) => setFormState({ ...formState, title: event.target.value })} placeholder="Add title and details" /></div>
            <div className="input-row"><div className="input-group"><label htmlFor="gcal-event-day">Day</label><select id="gcal-event-day" value={formState.day} onChange={(event) => setFormState({ ...formState, day: event.target.value })}>{DAYS.map((day) => <option key={day}>{day}</option>)}</select></div><div className="input-group"><label htmlFor="gcal-event-time">Start Time</label><select id="gcal-event-time" value={formState.time} onChange={(event) => setFormState({ ...formState, time: event.target.value })}>{TIME_SLOTS.map((time) => <option key={time}>{time}</option>)}</select></div></div>
            <div className="input-row"><div className="input-group"><label htmlFor="gcal-event-duration">Duration</label><select id="gcal-event-duration" value={formState.duration} onChange={(event) => setFormState({ ...formState, duration: Number(event.target.value) })}><option value="1">1 Hour</option><option value="2">2 Hours</option><option value="3">3 Hours</option></select></div><div className="input-group"><label htmlFor="gcal-event-category">Category</label><select id="gcal-event-category" value={formState.category} onChange={(event) => setFormState({ ...formState, category: event.target.value })}><option value="class">Class</option><option value="study">Study</option><option value="exam">Exam</option><option value="personal">Personal</option></select></div></div>
            <div className="input-group"><label htmlFor="gcal-event-room">Location / Room</label><input id="gcal-event-room" value={formState.room} onChange={(event) => setFormState({ ...formState, room: event.target.value })} placeholder="e.g. Room 204 or Online" /></div>
            <div className="input-group"><label htmlFor="gcal-event-description">Description / Notes</label><textarea id="gcal-event-description" value={formState.description} onChange={(event) => setFormState({ ...formState, description: event.target.value })} placeholder="Add notes, agenda, or materials..." /></div>
            <div className="modal-footer">{editingId !== null && <button type="button" className="danger-btn" onClick={deleteEvent}>Delete</button>}<div className="right-btn-group"><button type="button" className="ghost-btn" onClick={() => setIsModalOpen(false)}>Cancel</button><button type="submit" className="save-btn">Save Event</button></div></div>
          </form>
        </div>
      </div>}
    </section>
  );
}
