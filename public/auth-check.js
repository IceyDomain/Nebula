/* ==========================================================================
   SHARED AUTH & SESSION CHECKER
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get current user session
  const activeUsername = sessionStorage.getItem('activeUser');

  // 2. Redirect to sign-in if no session exists
  if (!activeUsername) {
    window.location.href = 'index.html';
    return;
  }

  // 3. Registered & default accounts database
  const DEFAULT_USERS = {
    "iceydomain": { password: "theicedomain123", role: "owner", name: "IceyDomain (Owner)" },
    "guest": { password: "guest123", role: "user", name: "Guest User" }
  };

  const customUsers = JSON.parse(localStorage.getItem('nebula_accounts') || '{}');
  const allUsers = { ...DEFAULT_USERS, ...customUsers };

  const user = allUsers[activeUsername] || {
    name: activeUsername.charAt(0).toUpperCase() + activeUsername.slice(1),
    role: "user"
  };

  // 4. Update UI elements according to the CURRENT active user
  const activeUserDisplay = document.getElementById('activeUserDisplay');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const brandTitle = document.getElementById('brandTitle');
  const brandIcon = document.getElementById('brandIcon');
  const footerBrand = document.getElementById('footerBrand');

  const adminPanelNavItem = document.getElementById('adminPanelNavItem');
  const ownerPortalNavItem = document.getElementById('ownerPortalNavItem');
  const secretTrigger = document.getElementById('secretTrigger');

  if (activeUserDisplay) activeUserDisplay.textContent = user.name;
  if (userRoleBadge) userRoleBadge.textContent = user.role.toUpperCase();

  // 5. Apply Roles & Dynamic Themes
  document.body.classList.remove('theme-iceydomain', 'theme-admin');

  if (activeUsername === 'iceydomain' || user.role === 'owner') {
    // OWNER LEVEL
    document.body.classList.add('theme-iceydomain');
    if (brandTitle) brandTitle.textContent = "IceyDomain";
    if (brandIcon) brandIcon.textContent = "❄️";
    if (footerBrand) footerBrand.textContent = "IceyDomain Master Workspace • 2026";

    if (adminPanelNavItem) adminPanelNavItem.classList.remove('hidden');
    if (ownerPortalNavItem) ownerPortalNavItem.classList.remove('hidden');
    if (secretTrigger) secretTrigger.classList.remove('hidden');

  } else if (user.role === 'admin') {
    // ADMIN LEVEL
    document.body.classList.add('theme-admin');
    if (brandTitle) brandTitle.textContent = "Nebula Admin";
    if (brandIcon) brandIcon.textContent = "🛡️";
    if (footerBrand) footerBrand.textContent = "Nebula Admin Workspace • 2026";

    if (adminPanelNavItem) adminPanelNavItem.classList.remove('hidden');
    if (ownerPortalNavItem) ownerPortalNavItem.classList.add('hidden');
    if (secretTrigger) secretTrigger.classList.add('hidden');

    if (window.location.pathname.includes('owner.html')) {
      alert('Access Denied: Owner Portal is restricted to IceyDomain.');
      window.location.href = 'index.html';
    }

  } else {
    // REGULAR USER / GUEST LEVEL
    if (brandTitle) brandTitle.textContent = "Nebula";
    if (brandIcon) brandIcon.textContent = "🌌";
    if (footerBrand) footerBrand.textContent = "Nebula Workspace • 2026";

    if (adminPanelNavItem) adminPanelNavItem.classList.add('hidden');
    if (ownerPortalNavItem) ownerPortalNavItem.classList.add('hidden');
    if (secretTrigger) secretTrigger.classList.add('hidden');

    if (window.location.pathname.includes('admin.html') || window.location.pathname.includes('owner.html')) {
      alert('Access Denied: You do not have permission to view this page.');
      window.location.href = 'index.html';
    }
  }

  // Logout event listener
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('activeUser');
      window.location.href = 'index.html';
    });
  }
});