const editor = document.getElementById('editor');

export function runCmd(command, value = null) {
  document.execCommand(command, false, value);
  editor.focus();
}

export function initToolbar() {
  document.getElementById('btn-undo').onclick = () => runCmd('undo');
  document.getElementById('btn-redo').onclick = () => runCmd('redo');
  document.getElementById('btn-print').onclick = () => window.print();
  document.getElementById('menu-print').onclick = () => window.print();
  document.getElementById('menu-undo').onclick = () => runCmd('undo');

  document.getElementById('select-format').onchange = (e) => runCmd('formatBlock', e.target.value);

  document.getElementById('btn-bold').onclick = () => runCmd('bold');
  document.getElementById('btn-italic').onclick = () => runCmd('italic');
  document.getElementById('btn-underline').onclick = () => runCmd('underline');

  document.getElementById('btn-left').onclick = () => runCmd('justifyLeft');
  document.getElementById('btn-center').onclick = () => runCmd('justifyCenter');
  document.getElementById('btn-right').onclick = () => runCmd('justifyRight');

  document.getElementById('btn-ul').onclick = () => runCmd('insertUnorderedList');
  document.getElementById('btn-ol').onclick = () => runCmd('insertOrderedList');

  document.querySelectorAll('.chip').forEach(chip => {
    chip.onclick = () => {
      const type = chip.getAttribute('data-template');
      let content = '';
      if (type === 'notes') {
        content = `<h3>Meeting Notes</h3><p><b>Date:</b> ${new Date().toLocaleDateString()}</p><ul><li>Agenda item 1</li></ul><br>`;
      } else if (type === 'email') {
        content = `<p><b>To:</b> </p><p><b>Subject:</b> </p><hr><p>Hi Team,</p><br>`;
      } else if (type === 'cover') {
        content = `<div style="background: linear-gradient(135deg, #7c5dfa, #38bdf8); height: 120px; border-radius: 8px; margin-bottom: 16px;"></div>`;
      } else {
        content = `<p><i>[Inserted ${type} block]</i></p><br>`;
      }
      runCmd('insertHTML', content);
    };
  });
}