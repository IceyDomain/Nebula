// State Management
let autoSaveTimeout;
let isSaved = true;

const editor = document.getElementById('editor');
const docTitle = document.getElementById('docTitle');
const saveIndicator = document.getElementById('saveIndicator');
const saveText = document.getElementById('saveText');

// Auto-save function
function markUnsaved() {
  if (isSaved) {
    isSaved = false;
    saveIndicator.classList.add('saving');
    saveText.textContent = 'Unsaved changes';
  }
  
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    isSaved = true;
    saveIndicator.classList.remove('saving');
    saveText.textContent = 'Saved to Nebula';
    // Here you would actually save to server/database
    saveToLocalStorage();
  }, 1500);
}

// Local storage save
function saveToLocalStorage() {
  const data = {
    title: docTitle.value,
    content: editor.innerHTML,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('nebula-doc', JSON.stringify(data));
}

// Load from local storage
function loadFromLocalStorage() {
  const data = localStorage.getItem('nebula-doc');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      docTitle.value = parsed.title || 'Untitled document';
      editor.innerHTML = parsed.content || '<p>Start typing...</p>';
    } catch (e) {
      editor.innerHTML = '<p>Start typing...</p>';
    }
  } else {
    editor.innerHTML = '<p>Start typing...</p>';
  }
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  setupEditorListeners();
  setupToolbarListeners();
  setupMenus();
  editor.focus();
});

// Editor event listeners
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

// Command executor
function runCmd(command, value = null) {
  document.execCommand(command, false, value);
  editor.focus();
  markUnsaved();
  updateToolbarState();
}

// Update toolbar button states
function updateToolbarState() {
  document.getElementById('btn-bold').classList.toggle('active', document.queryCommandState('bold'));
  document.getElementById('btn-italic').classList.toggle('active', document.queryCommandState('italic'));
  document.getElementById('btn-underline').classList.toggle('active', document.queryCommandState('underline'));
  document.getElementById('btn-strikethrough').classList.toggle('active', document.queryCommandState('strikethrough'));
}

// Toolbar setup
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
  document.getElementById('btn-strikethrough').onclick = () => runCmd('strikethrough');

  // Colors
  document.getElementById('textColor').onchange = (e) => {
    runCmd('foreColor', e.target.value);
  };

  document.getElementById('highlightColor').onchange = (e) => {
    runCmd('backColor', e.target.value);
  };

  // Alignment
  document.getElementById('btn-left').onclick = () => runCmd('justifyLeft');
  document.getElementById('btn-center').onclick = () => runCmd('justifyCenter');
  document.getElementById('btn-right').onclick = () => runCmd('justifyRight');
  document.getElementById('btn-justify').onclick = () => runCmd('justifyFull');

  // Lists
  document.getElementById('btn-ul').onclick = () => runCmd('insertUnorderedList');
  document.getElementById('btn-ol').onclick = () => runCmd('insertOrderedList');

  // Indent
  document.getElementById('btn-indent-inc').onclick = () => runCmd('indent');
  document.getElementById('btn-indent-dec').onclick = () => runCmd('outdent');

  // Links and images
  document.getElementById('btn-link').onclick = () => {
    const url = prompt('Enter URL:');
    if (url) runCmd('createLink', url);
  };

  document.getElementById('btn-image').onclick = () => {
    const url = prompt('Enter image URL:');
    if (url) runCmd('insertImage', url);
  };

  // Share button
  document.getElementById('shareBtn').onclick = () => {
    alert('Share functionality: Copy this document link to share with others!');
  };

  // Help button
  document.getElementById('helpBtn').onclick = () => {
    alert('Nebula Docs v1.0\n\nKeyboard Shortcuts:\nCtrl+B: Bold\nCtrl+I: Italic\nCtrl+U: Underline\nCtrl+Z: Undo\nCtrl+Y: Redo');
  };
}

// Menu Setup
function setupMenus() {
  const fileMenu = document.getElementById('fileMenu');
  const editMenu = document.getElementById('editMenu');
  const menuFileBtn = document.getElementById('menuFileBtn');
  const menuEditBtn = document.getElementById('menuEditBtn');

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

  // Close menus when clicking outside
  document.onclick = () => {
    fileMenu.classList.add('hidden');
    editMenu.classList.add('hidden');
  };

  // File menu items
  document.getElementById('menuNew').onclick = () => {
    if (confirm('Create a new document?')) {
      editor.innerHTML = '<p>Start typing...</p>';
      docTitle.value = 'Untitled document';
      localStorage.removeItem('nebula-doc');
      fileMenu.classList.add('hidden');
    }
  };

  document.getElementById('menuDownload').onclick = () => {
    const content = editor.innerText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docTitle.value + '.txt';
    a.click();
    fileMenu.classList.add('hidden');
  };

  document.getElementById('menuPrint').onclick = () => {
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
    document.getElementById(id).onclick = () => {
      alert('This menu will be available soon!');
    };
  });
}