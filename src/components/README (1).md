# Nebula + Ardenne: complete set

Copy EVERYTHING in this folder into `src/components/` (replace files with the same names).
Do not touch `utils/tierSystem.js` or `utils/publishingRates.js`; the files here use them as they are.

## Which dashboard to show
- Nebula users:   <StandardDashboard user={user} onSignOut={...} />
- Ardenne users:  <ArdenneDashboard user={user} onSignOut={...} />
  user needs: username, role ("student" or "teacher"), grade (7-13), form (1-8), credits, tier, exp.

## Sign-in page
<FindOrganization onBack onSignIn onSignUp onGoogleSignIn onForgotPassword onRequestAccess />
- onSignIn  gets { username, password, org, role }
- onSignUp  gets { username, email, password, org, role, grade, form }
- Teacher access code: in FindOrganization.jsx, ORGANIZATIONS, set teacherCode for Ardenne.
  (This check runs in the browser, so it only keeps honest people out. A real server check comes later.)

## New Ardenne files
ardennePortalData.js (saved data), ArdennePortalUI.jsx, ArdenneHome.jsx, ArdenneFormsGrades.jsx,
ArdenneFormPage.jsx, ArdenneGradePortal.jsx, ArdenneAnnouncements.jsx, ArdenneClubs.jsx, ArdenneHouses.jsx

## Christmas event (both stores)
christmas.js (dates, items, prices), ChristmasStore.jsx (the store section).
Event: Dec 15 to Jan 1. Items bought stay usable all year.
Edit dates and prices at the top of christmas.js.

## Things to set
- ardennePortalData.js: grades are 7-13, forms are 1-8, and the houses are Olson (red), Cohen (blue), Mills (purple), Harrisson (orange), Gayle (pink), Colter (green), Grant (beige), and Phelps (yellow). The specific Sports Day point-awarding rules are still to be confirmed.
- Data (announcements, clubs, house points, who is in which form) is saved in each browser for now.
