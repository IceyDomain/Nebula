// --- Password & Unlock System ---
const MY_PASSWORD = "theicedomain123"; // Change this to your desired password

const loginOverlay = document.getElementById('loginOverlay');
const protectedContent = document.getElementById('protectedContent');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const errorMessage = document.getElementById('errorMessage');
const logoutBtn = document.getElementById('logoutBtn');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');

// 1. Password Visibility Toggle
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
  });
}

// 2. Session Check
if (sessionStorage.getItem('isUnlocked') === 'true') {
  unlockSite();
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (passwordInput.value === MY_PASSWORD) {
      sessionStorage.setItem('isUnlocked', 'true');
      unlockSite();
    } else {
      errorMessage.textContent = 'Incorrect password. Try again!';
      passwordInput.value = '';
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isUnlocked');
    location.reload();
  });
}

function unlockSite() {
  if (loginOverlay) loginOverlay.classList.add('hidden');
  if (protectedContent) protectedContent.classList.remove('hidden');
  initChart();
}

// --- Chart.js Graph ---
function initChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Study Hours',
        data: [2.5, 4.0, 3.2, 5.1, 2.8, 6.0, 4.5],
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } }
      }
    }
  });
}

// --- To-Do & Notes Logic ---
document.addEventListener('DOMContentLoaded', () => {
  renderTodos();
  renderNotes();
});

const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

if (todoForm) {
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!todoInput.value.trim()) return;

    const tasks = JSON.parse(localStorage.getItem('icey_todos') || '[]');
    tasks.push({ text: todoInput.value, completed: false });
    localStorage.setItem('icey_todos', JSON.stringify(tasks));
    todoInput.value = '';
    renderTodos();
  });
}

function renderTodos() {
  if (!todoList) return;
  const tasks = JSON.parse(localStorage.getItem('icey_todos') || '[]');
  todoList.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = `todo-item ${task.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span onclick="toggleTask(${index})" style="cursor: pointer;">${task.completed ? '✓ ' : ''}${escapeHtml(task.text)}</span>
      <button class="delete-btn" onclick="deleteTask(${index})">✕</button>
    `;
    todoList.appendChild(li);
  });
}

window.toggleTask = function(index) {
  const tasks = JSON.parse(localStorage.getItem('icey_todos') || '[]');
  tasks[index].completed = !tasks[index].completed;
  localStorage.setItem('icey_todos', JSON.stringify(tasks));
  renderTodos();
};

window.deleteTask = function(index) {
  const tasks = JSON.parse(localStorage.getItem('icey_todos') || '[]');
  tasks.splice(index, 1);
  localStorage.setItem('icey_todos', JSON.stringify(tasks));
  renderTodos();
};

const noteForm = document.getElementById('noteForm');
const noteTitle = document.getElementById('noteTitle');
const noteBody = document.getElementById('noteBody');
const notesContainer = document.getElementById('notesContainer');

if (noteForm) {
  noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!noteTitle.value.trim() || !noteBody.value.trim()) return;

    const notes = JSON.parse(localStorage.getItem('icey_notes') || '[]');
    notes.unshift({ title: noteTitle.value, body: noteBody.value });
    localStorage.setItem('icey_notes', JSON.stringify(notes));
    noteTitle.value = '';
    noteBody.value = '';
    renderNotes();
  });
}

function renderNotes() {
  if (!notesContainer) return;
  const notes = JSON.parse(localStorage.getItem('icey_notes') || '[]');
  notesContainer.innerHTML = '';

  if (notes.length === 0) {
    notesContainer.innerHTML = '<p class="text-muted" style="font-size:12px;">No saved notes yet.</p>';
    return;
  }

  notes.forEach((note, index) => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h4>${escapeHtml(note.title)}</h4>
        <button class="delete-btn" onclick="deleteNote(${index})">✕</button>
      </div>
      <p>${escapeHtml(note.body)}</p>
    `;
    notesContainer.appendChild(card);
  });
}

window.deleteNote = function(index) {
  const notes = JSON.parse(localStorage.getItem('icey_notes') || '[]');
  notes.splice(index, 1);
  localStorage.setItem('icey_notes', JSON.stringify(notes));
  renderNotes();
};

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// --- Rest Timer Logic ---
const timerText = document.getElementById('timerText');
const startTimerBtn = document.getElementById('startTimerBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');

let timerInterval = null;
let timeRemaining = 300;

if (startTimerBtn) {
  startTimerBtn.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      startTimerBtn.textContent = 'Resume Break';
    } else {
      startTimerBtn.textContent = 'Pause';
      timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
          clearInterval(timerInterval);
          alert('Break time is up!');
        }
      }, 1000);
    }
  });
}

if (resetTimerBtn) {
  resetTimerBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeRemaining = 300;
    updateTimerDisplay();
    startTimerBtn.textContent = 'Start Break';
  });
}

function updateTimerDisplay() {
  if (!timerText) return;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}