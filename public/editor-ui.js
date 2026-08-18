// Tab State Management
export let tabs = [
  { id: 'tab-1', title: 'Tab 1', content: '<p>Start typing your document here...</p>' }
];
export let activeTabId = 'tab-1';

const editor = document.getElementById('editor');
const tabContainer = document.getElementById('tabContainer');

export function initUI() {
  editor.addEventListener('input', () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab) activeTab.content = editor.innerHTML;
  });

  document.getElementById('add-tab-btn').addEventListener('click', createTab);
  switchTab(activeTabId);
}

export function renderTabs() {
  tabContainer.innerHTML = '';
  tabs.forEach((tab) => {
    const tabEl = document.createElement('div');
    tabEl.className = `tab-pill ${tab.id === activeTabId ? 'active' : ''}`;
    tabEl.onclick = () => switchTab(tab.id);
    
    tabEl.innerHTML = `
      <span>📄 ${tab.title}</span>
      ${tabs.length > 1 ? `<span class="close-tab" data-id="${tab.id}">✕</span>` : ''}
    `;
    tabContainer.appendChild(tabEl);
  });

  document.querySelectorAll('.close-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTab(btn.getAttribute('data-id'));
    });
  });
}

export function switchTab(id) {
  activeTabId = id;
  const activeTab = tabs.find(t => t.id === id);
  if (activeTab) editor.innerHTML = activeTab.content;
  renderTabs();
}

function createTab() {
  const newId = `tab-${Date.now()}`;
  tabs.push({
    id: newId,
    title: `Tab ${tabs.length + 1}`,
    content: `<p>New document contents for Tab ${tabs.length + 1}...</p>`
  });
  switchTab(newId);
}

function deleteTab(id) {
  if (tabs.length <= 1) return;
  tabs = tabs.filter(t => t.id !== id);
  if (activeTabId === id) activeTabId = tabs[0].id;
  switchTab(activeTabId);
}