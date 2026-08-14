// Version Control
if (localStorage.getItem('nebula_version') !== '3.0') {
  localStorage.setItem('nebula_version', '3.0');
}

// Built-in Default Users
const DEFAULT_USERS = {
  "iceydomain": {
    password: "theicedomain123",
    role: "owner",
    name: "IceyDomain (Owner)"
  },
  "guest": {
    password: "guest123",
    role: "user",
    name: "Guest User"
  }
};

let authMode = 'signin';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const errorMessage = document.getElementById('errorMessage');
const loginOverlay = document.getElementById('loginOverlay');
const protectedContent = document.getElementById('protectedContent');
const logoutBtn = document.getElementById('logoutBtn');
const activeUserDisplay = document.getElementById('activeUserDisplay');
const userRoleBadge = document.getElementById('userRoleBadge');
const secretTrigger = document.getElementById('secretTrigger');
const adminPanelNavItem = document.getElementById('adminPanelNavItem');
const ownerPortalNavItem = document.getElementById('ownerPortalNavItem');
const brandTitle = document.getElementById('brandTitle');
const brandIcon = document.getElementById('brandIcon');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const tabSignIn = document.getElementById('tabSignIn');
const tabSignUp = document.getElementById('tabSignUp');

// Tabs Switcher
if (tabSignIn && tabSignUp) {
  tabSignIn.addEventListener('click', () => {
    authMode = 'signin';
    tabSignIn.classList.add('active');
    tabSignUp.classList.remove('active');
    submitAuthBtn.textContent = 'Sign In →';
    errorMessage.textContent = '';
  });

  tabSignUp.addEventListener('click', () => {
    authMode = 'signup';
    tabSignUp.classList.add('active');
    tabSignIn.classList.remove('active');
    submitAuthBtn.textContent = 'Create Account →';
    errorMessage.textContent = '';
  });
}

// Password Visibility Eye Toggle
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
  });
}

// Session Check (Keep logged in as THAT active user)
const currentSessionUser = sessionStorage.getItem('activeUser');
if (currentSessionUser) {
  loadDashboard(currentSessionUser);
}

// Form Submission
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    const customUsers = JSON.parse(localStorage.getItem('nebula_accounts') || '{}');
    const allUsers = { ...DEFAULT_USERS, ...customUsers };

    if (authMode === 'signin') {
      if (allUsers[username] && allUsers[username].password === password) {
        sessionStorage.setItem('activeUser', username);
        loadDashboard(username);
      } else {
        errorMessage.textContent = 'Invalid username or password.';
      }
    } else {
      if (allUsers[username]) {
        errorMessage.textContent = 'Username already exists! Pick another one.';
        return;
      }

      // Registered users default to standard 'user'
      customUsers[username] = {
        password: password,
        role: "user",
        name: username.charAt(0).toUpperCase() + username.slice(1)
      };
      
      localStorage.setItem('nebula_accounts', JSON.stringify(customUsers));
      sessionStorage.setItem('activeUser', username);
      loadDashboard(username);
    }
  });
}

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('activeUser');
    location.reload();
  });
}

// Load Dashboard & Role-based Access
function loadDashboard(username) {
  const customUsers = JSON.parse(localStorage.getItem('nebula_accounts') || '{}');
  const allUsers = { ...DEFAULT_USERS, ...customUsers };
  
  const user = allUsers[username] || { 
    name: username.charAt(0).toUpperCase() + username.slice(1), 
    role: "user" 
  };

  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (protectedContent) protectedContent.classList.remove('hidden');

  if (activeUserDisplay) activeUserDisplay.textContent = user.name;
  if (userRoleBadge) userRoleBadge.textContent = user.role.toUpperCase();

  // Reset theme state
  document.body.classList.remove('theme-iceydomain', 'theme-admin');

  // ROLE CONTROLS
  if (username === 'iceydomain' || user.role === 'owner') {
    // OWNER PRIVILEGES
    document.body.classList.add('theme-iceydomain');
    if (brandTitle) brandTitle.textContent = "IceyDomain";
    if (brandIcon) brandIcon.textContent = "❄️";
    if (secretTrigger) secretTrigger.classList.remove('hidden');
    if (ownerPortalNavItem) ownerPortalNavItem.classList.remove('hidden');
    if (adminPanelNavItem) adminPanelNavItem.classList.remove('hidden');

  } else if (user.role === 'admin') {
    // ADMIN PRIVILEGES
    document.body.classList.add('theme-admin');
    if (brandTitle) brandTitle.textContent = "Nebula Admin";
    if (brandIcon) brandIcon.textContent = "🛡️";
    if (adminPanelNavItem) adminPanelNavItem.classList.remove('hidden');
    if (ownerPortalNavItem) ownerPortalNavItem.classList.add('hidden');
    if (secretTrigger) secretTrigger.classList.add('hidden');

  } else {
    // STANDARD MEMBER
    if (brandTitle) brandTitle.textContent = "Nebula";
    if (brandIcon) brandIcon.textContent = "🌌";
    if (adminPanelNavItem) adminPanelNavItem.classList.add('hidden');
    if (ownerPortalNavItem) ownerPortalNavItem.classList.add('hidden');
    if (secretTrigger) secretTrigger.classList.add('hidden');
  }

  initChart();
}

// Chart Initializer
function initChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      datasets: [{
        label: 'System Bandwidth',
        data: [4, 7, 3, 9, 8],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}