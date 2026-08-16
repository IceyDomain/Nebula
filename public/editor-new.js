// ===== STATE & VARIABLES =====
let openTabs = [];
let activeTabId = null;
let autoSaveTimeout;
let isSaved = true;

const editor = document.getElementById('editor');
const docTitle = document.getElementById('docTitle');
const saveIndicator = document.getElementById('saveIndicator');
const saveText = document.getElementById('saveText');
const tabsContainer = document.getElementById('tabsContainer');
const addTabBtn = document.getElementById('addTabBtn');

// ===== DOCUMENT MANAGEMENT =====
function getStoredDocs() {
  return JSON.parse(localStorage.getItem('nebula_docs_list') || '[]');
}

function updateDocInList(docId, title, content) {
  let docs = getStoredDocs();
  const docIndex = docs.findIndex(d => d.id === docId);
  
  if (docIndex !== -1) {
    docs[docIndex].title = title;
    docs[docIndex].content = content;
    docs[docIndex].updatedAt = new Date().toISOString();
  }
  
  localStorage.setItem('nebula_docs_list', JSON.stringify(docs));
}

function openDocumentFromParam() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get('id');
  
  if (docId) {
    const docs = getStoredDocs();
    const doc = docs.find(d => d.id === docId);
    
    if (doc) {
      addTabFromDoc(doc);
      switchToTab(docId);
    }
  }
}

// ===== TABS MANAGEMENT =====
function addTabFromDoc(doc) {
  const tabExists = openTabs.find(t => t.id === doc.id);
  if (!tabExists) {
    openTabs.push({
      id: doc.id,
      title: doc.title,
      content: doc.content
    });
  }
}

function renderTabs() {
  tabsContainer.innerHTML = '';
  
  openTabs.forEach(tab => {
    const tabEl = document.createElement('div');
    tabEl.className = `tab ${tab.id === activeTabId ? 'active' : ''}`;
    tabEl.onclick = () => switchToTab(tab.id);
    
    tabEl.innerHTML = `
      <span class="tab-title">${tab.title}</span>
      <span class="tab-close" onclick="event.stopPropagation(); closeTab('${tab.id}')">✕</span>
    `;
    
    tabsContainer.appendChild(tabEl);
  });
}

function switchToTab(tabId) {
  if (activeTabId) {
    const activeTab = openTabs.find(t => t.id === activeTabId);
    if (activeTab) {
      activeTab.content = editor.innerHTML;
      activeTab.title = docTitle.value;
    }
  }
  
  activeTabId = tabId;
  const tab = openTabs.find(t => t.id === tabId);
  
  if (tab) {
    editor.innerHTML = tab.content;
    docTitle.value = tab.title;
    renderTabs();
  }
}

function closeTab(tabId) {
  openTabs = openTabs.filter(t => t.id !== tabId);
  
  if (activeTabId === tabId) {
    if (openTabs.length > 0) {
      switchToTab(openTabs[0].id);
    } else {
      const blankTab = {
        id: 'tab_' + Date.now(),
        title: 'Untitled document',
        content: '<p></p>'
      };
      openTabs.push(blankTab);
      activeTabId = blankTab.id;
      editor.innerHTML = blankTab.content;
      docTitle.value = blankTab.title;
    }
  }
  
  renderTabs();
}

function createBlankTab() {
  const blankTab = {
    id: 'tab_' + Date.now(),
    title: 'Untitled document',
    content: '<p></p>'
  };

  if (!openTabs.some(tab => tab.id === blankTab.id)) {
    openTabs.push(blankTab);
  }

  switchToTab(blankTab.id);
}

addTabBtn.onclick = () => {
  createBlankTab();
};

// ===== AUTO-SAVE & PERSISTENCE =====
function markUnsaved() {
  if (isSaved) {
    isSaved = false;
    saveIndicator.classList.add('saving');
    saveText.textContent = 'Unsaved changes';
  }
  
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    saveDocument();
  }, 1500);
}

function saveDocument() {
  if (activeTabId) {
    const tab = openTabs.find(t => t.id === activeTabId);
    if (tab) {
      tab.title = docTitle.value;
      tab.content = editor.innerHTML;
      updateDocInList(activeTabId, docTitle.value, editor.innerHTML);
      
      isSaved = true;
      saveIndicator.classList.remove('saving');
      saveText.textContent = 'Saved to Nebula';
      renderTabs();
    }
  }
}

// ===== EDITOR EVENT LISTENERS =====
function setupEditorListeners() {
  editor.addEventListener('input', markUnsaved);
  
  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  });

  docTitle.addEventListener('input', markUnsaved);
  docTitle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') editor.focus();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          runCmd('bold');
          break;
        case 'i':
          e.preventDefault();
          runCmd('italic');
          break;
        case 'u':
          e.preventDefault();
          runCmd('underline');
          break;
        case 'z':
          e.preventDefault();
          runCmd('undo');
          break;
        case 'y':
          e.preventDefault();
          runCmd('redo');
          break;
      }
    }
  });
}

// ===== COMMAND EXECUTOR =====
function runCmd(command, value = null) {
  document.execCommand(command, false, value);
  editor.focus();
  markUnsaved();
  updateToolbarState();
}

function updateToolbarState() {
  document.getElementById('btn-bold').classList.toggle('active', document.queryCommandState('bold'));
  document.getElementById('btn-italic').classList.toggle('active', document.queryCommandState('italic'));
  document.getElementById('btn-underline').classList.toggle('active', document.queryCommandState('underline'));
}

// ===== TOOLBAR SETUP =====
function setupToolbarListeners() {
  // Undo/Redo
  document.getElementById('btn-undo').onclick = () => runCmd('undo');
  document.getElementById('btn-redo').onclick = () => runCmd('redo');

  // Font family
  document.getElementById('fontFamily').onchange = (e) => {
    runCmd('fontName', e.target.value);
  };

  // Font size
  document.getElementById('fontSize').onchange = (e) => {
    runCmd('fontSize', e.target.value);
  };

  // Text formatting
  document.getElementById('btn-bold').onclick = () => runCmd('bold');
  document.getElementById('btn-italic').onclick = () => runCmd('italic');
  document.getElementById('btn-underline').onclick = () => runCmd('underline');

  // Color pickers
  const textColorBtn = document.getElementById('btn-textColor');
  const textColorPicker = document.getElementById('textColorPicker');
  
  textColorBtn.onclick = () => {
    textColorPicker.click();
  };
  
  textColorPicker.onchange = (e) => {
    runCmd('foreColor', e.target.value);
  };

  const highlightColorBtn = document.getElementById('btn-highlightColor');
  const highlightColorPicker = document.getElementById('highlightColorPicker');
  
  highlightColorBtn.onclick = () => {
    highlightColorPicker.click();
  };
  
  highlightColorPicker.onchange = (e) => {
    runCmd('backColor', e.target.value);
  };

  // Alignment
  document.getElementById('btn-left').onclick = () => runCmd('justifyLeft');
  document.getElementById('btn-center').onclick = () => runCmd('justifyCenter');
  document.getElementById('btn-right').onclick = () => runCmd('justifyRight');

  // Lists
  document.getElementById('btn-ul').onclick = () => runCmd('insertUnorderedList');
  document.getElementById('btn-ol').onclick = () => runCmd('insertOrderedList');

  // Link
  document.getElementById('btn-link').onclick = () => {
    const url = prompt('Enter URL:');
    if (url) runCmd('createLink', url);
  };

  // Share button
  document.getElementById('shareBtn').onclick = () => {
    alert('Share functionality: Copy this document link to share with others!');
  };

  // Help button
  document.getElementById('helpBtn').onclick = () => {
    alert('Nebula Docs\n\nKeyboard Shortcuts:\nCtrl+B: Bold\nCtrl+I: Italic\nCtrl+U: Underline\nCtrl+Z: Undo\nCtrl+Y: Redo\n\nColor Buttons: Click to open color picker');
  };
}

// ===== MENU SETUP =====
function setupMenus() {
  const fileMenu = document.getElementById('fileMenu');
  const editMenu = document.getElementById('editMenu');
  const menuFileBtn = document.getElementById('menuFileBtn');
  const menuEditBtn = document.getElementById('menuEditBtn');

  // Close all menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrapper')) {
      fileMenu.classList.add('hidden');
      editMenu.classList.add('hidden');
    }
  });

  // File menu toggle
  menuFileBtn.onclick = (e) => {
    e.stopPropagation();
    fileMenu.classList.toggle('hidden');
    editMenu.classList.add('hidden');
  };

  // Edit menu toggle
  menuEditBtn.onclick = (e) => {
    e.stopPropagation();
    editMenu.classList.toggle('hidden');
    fileMenu.classList.add('hidden');
  };

  // File menu items
  document.getElementById('menuNew').onclick = () => {
    saveDocument();
    window.location.href = 'notes.html';
    fileMenu.classList.add('hidden');
  };

  document.getElementById('menuOpen').onclick = () => {
    saveDocument();
    window.location.href = 'notes.html';
    fileMenu.classList.add('hidden');
  };

  document.getElementById('menuDownload').onclick = () => {
    const content = editor.innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docTitle.value + '.txt';
    a.click();
    window.URL.revokeObjectURL(url);
    fileMenu.classList.add('hidden');
  };

  document.getElementById('menuPrint').onclick = () => {
    saveDocument();
    window.print();
    fileMenu.classList.add('hidden');
  };

  // Edit menu items
  document.getElementById('menuUndo').onclick = () => {
    runCmd('undo');
    editMenu.classList.add('hidden');
  };

  document.getElementById('menuRedo').onclick = () => {
    runCmd('redo');
    editMenu.classList.add('hidden');
  };

  document.getElementById('menuSelectAll').onclick = () => {
    runCmd('selectAll');
    editMenu.classList.add('hidden');
  };

  // Disable other menu buttons for now
  ['menuViewBtn', 'menuInsertBtn', 'menuFormatBtn', 'menuToolsBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.onclick = () => {
        alert('This menu will be available soon!');
      };
    }
  });
}

// ===== INITIALIZATION =====
window.addEventListener('DOMContentLoaded', () => {
  if (!openTabs.length) {
    const initialTab = {
      id: 'tab_' + Date.now(),
      title: 'Untitled document',
      content: '<p></p>'
    };
    openTabs.push(initialTab);
    activeTabId = initialTab.id;
  }

  openDocumentFromParam();
  
  if (activeTabId) {
    switchToTab(activeTabId);
  }
  
  setupEditorListeners();
  setupToolbarListeners();
  setupMenus();
  renderTabs();
  
  editor.focus();
  
  // Save before leaving page
  window.addEventListener('beforeunload', () => {
    if (!isSaved) {
      saveDocument();
    }
  });
});