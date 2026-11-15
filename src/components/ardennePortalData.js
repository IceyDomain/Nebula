// Ardenne portal data layer. Everything is saved in the browser (localStorage) for now.
// To use a real database later, replace the read() and write() helpers below and keep the rest.

export const ARDENNE_ID = 'ardenne-high-school';
export const GRADES = [7, 8, 9, 10, 11, 12, 13];
export const FORMS = [1, 2, 3, 4, 5, 6, 7, 8];
export const HOUSES = [
  { id: 'olson', name: 'Olson', color: '#dc2626' },
];
export const HOUSE_RULES_TEXT = 'House points are associated with Sports Day. The specific point-awarding rules have not been confirmed yet.';
export const CLUB_CATEGORIES = ['Academic', 'Sports', 'Arts', 'Service', 'Other'];

const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ } return value; };

export const formLabel = (grade, form) => `${grade}-${form}`;

/* ---------- profiles (who is in which grade and form) ---------- */
export const getProfiles = () => read('ardenne_profiles', {});
export function saveProfile(username, patch) {
  const all = getProfiles();
  all[username] = { ...all[username], ...patch };
  write('ardenne_profiles', all);
  return all[username];
}
export const studentsInForm = (grade, form) => Object.entries(getProfiles())
  .filter(([, p]) => p.role === 'student' && Number(p.grade) === Number(grade) && Number(p.form) === Number(form))
  .map(([username, p]) => ({ username, ...p }));
export const teacherOfForm = (grade, form) => {
  const hit = Object.entries(getProfiles()).find(([, p]) => p.role === 'teacher' && Number(p.grade) === Number(grade) && Number(p.form) === Number(form));
  return hit ? hit[0] : null;
};
export const gradeStudentCount = (grade) => Object.values(getProfiles()).filter((p) => p.role === 'student' && Number(p.grade) === Number(grade)).length;

/* ---------- houses ---------- */
export const getHouseOf = () => read('ardenne_house_of', {});
export const setHouseOf = (username, houseId) => write('ardenne_house_of', { ...getHouseOf(), [username]: houseId });
export const getHousePoints = () => read('ardenne_house_points', {});
export const getPointLog = () => read('ardenne_point_log', []);
export function awardPoints(houseId, points, reason, by) {
  write('ardenne_house_points', { ...getHousePoints(), [houseId]: (getHousePoints()[houseId] || 0) + points });
  write('ardenne_point_log', [{ id: Date.now(), houseId, points, reason, by, time: new Date().toISOString() }, ...getPointLog()].slice(0, 100));
}

/* ---------- clubs ---------- */
export const getClubs = () => read('ardenne_clubs', []);
export function createClub(club) {
  const next = [{ ...club, id: `club_${Date.now()}` }, ...getClubs()];
  write('ardenne_clubs', next);
  return next;
}
export const deleteClub = (id) => write('ardenne_clubs', getClubs().filter((c) => c.id !== id));
export const getMembers = () => read('ardenne_club_members', {});
export const membersOf = (clubId) => getMembers()[clubId] || [];
export const myClubIds = (username) => Object.entries(getMembers()).filter(([, list]) => list.includes(username)).map(([id]) => id);
export function joinClub(clubId, username) {
  const all = getMembers(); const list = all[clubId] || [];
  if (!list.includes(username)) write('ardenne_club_members', { ...all, [clubId]: [...list, username] });
}
export function leaveClub(clubId, username) {
  const all = getMembers(); write('ardenne_club_members', { ...all, [clubId]: (all[clubId] || []).filter((u) => u !== username) });
}
export const getSuggestions = () => read('ardenne_club_suggestions', []);
export const addSuggestion = (s) => write('ardenne_club_suggestions', [{ ...s, id: Date.now() }, ...getSuggestions()]);
export const removeSuggestion = (id) => write('ardenne_club_suggestions', getSuggestions().filter((s) => s.id !== id));

/* ---------- announcements ---------- */
export const getAnnouncements = () => read('ardenne_announcements', []);
export function postAnnouncement(a) {
  const next = [{ ...a, id: Date.now(), time: new Date().toISOString() }, ...getAnnouncements()];
  return write('ardenne_announcements', next);
}
export const deleteAnnouncement = (id) => write('ardenne_announcements', getAnnouncements().filter((a) => a.id !== id));

// viewer = { username, role, grade, form }. Teachers see every announcement.
export function visibleTo(a, viewer) {
  if (viewer.role === 'teacher') return true;
  const aud = a.audience || { type: 'school' };
  if (aud.type === 'school') return true;
  if (aud.type === 'grade') return Number(aud.grade) === Number(viewer.grade);
  if (aud.type === 'form') return Number(aud.grade) === Number(viewer.grade) && Number(aud.form) === Number(viewer.form);
  if (aud.type === 'house') return getHouseOf()[viewer.username] === aud.houseId;
  if (aud.type === 'club') return myClubIds(viewer.username).includes(aud.clubId);
  return false;
}
export function audienceLabel(aud = { type: 'school' }) {
  if (aud.type === 'school') return 'Whole school';
  if (aud.type === 'grade') return `Grade ${aud.grade}`;
  if (aud.type === 'form') return `Form ${formLabel(aud.grade, aud.form)}`;
  if (aud.type === 'house') return (HOUSES.find((h) => h.id === aud.houseId) || { name: 'House' }).name;
  if (aud.type === 'club') return (getClubs().find((c) => c.id === aud.clubId) || { name: 'Club' }).name;
  return '';
}
export const timeAgo = (iso) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now'; if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60); if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString();
};

// Turns the signed-in user object into the viewer used above.
export function viewerOf(user) {
  const role = user.role === 'teacher' ? 'teacher' : 'student';
  return { username: user.username || (user.email || '').split('@')[0] || 'Student', role, grade: Number(user.grade) || null, form: Number(user.form) || null };
}
