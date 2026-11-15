// Shared engine for the Nebula and Ardenne document editors (Google Docs style).
// Use NebulaDocEditor.jsx or ArdenneDocEditor.jsx, not this file directly.
import { useEffect, useRef, useState } from 'react';
import './doc-editor.css';

const FONTS = ['Arial', 'Verdana', 'Trebuchet MS', 'Georgia', 'Times New Roman', 'Courier New'];
const SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
const BLOCKS = [['p', 'Normal text'], ['h1', 'Title'], ['h2', 'Heading 1'], ['h3', 'Heading 2'], ['h4', 'Heading 3'], ['blockquote', 'Quote']];
const PALETTES = {
  nebula: ['#000000', '#434343', '#9ca3af', '#ffffff', '#7c3aed', '#38bdf8', '#d946ef', '#2dd4bf', '#facc15', '#f472b6'],
  ardenne: ['#000000', '#434343', '#9ca3af', '#ffffff', '#1d4ed8', '#08153a', '#f5b82e', '#16a34a', '#b91c1c', '#6b7280'],
};
const PAGE = { A4: { w: 794, h: 1123 }, Letter: { w: 816, h: 1056 } };
const MARGINS = { normal: 96, narrow: 48, wide: 128 };
const SYMBOLS = ['©', '®', '™', '°', '±', '×', '÷', '≠', '≤', '≥', '∞', '√', 'π', 'Ω', 'µ', '→', '←', '↑', '↓', '✓', '✦', '★', '§', '¶', '€', '£', '¥', '¢', '½', '¼', '¾', 'α', 'β', 'γ', 'Δ', 'θ', 'λ', 'σ', '•', '…'];
const P = {
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3', redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3', print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z',
  spell: 'M3 17L8 5l5 12M5 13h6M14 19l3 3 6-7', paint: 'M5 4h12v5H5zM11 9v4h-3v8h3v-8', link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  cadd: 'M4 4h16v13H9l-5 4zM12 7.5v6M9 10.5h6', image: 'M4 5h16v14H4zM8 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4 16l5-5 4 4 3-3 4 4',
  left: 'M3 6h18M3 12h12M3 18h16', center: 'M3 6h18M6 12h12M4 18h16', right: 'M3 6h18M9 12h12M5 18h16', full: 'M3 6h18M3 12h18M3 18h18',
  check: 'M4 6l1.5 1.5L8 5M4 13l1.5 1.5L8 11M11 6h9M11 13h9M4 20h5M11 20h9', ul: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01', ol: 'M10 6h10M10 12h10M10 18h10M4 5h1v4M4 13h2l-2 3h2',
  indent: 'M3 6h18M11 12h10M11 18h10M3 9l3 3-3 3', outdent: 'M3 6h18M11 12h10M11 18h10M6 9l-3 3 3 3', clear: 'M5 5l14 14M9 4h10M12 4L9 13M8 20h8',
  chat: 'M4 4h16v12H9l-5 4z', history: 'M4 12a8 8 0 108-8M4 4v5h5M12 8v5l3 2', doc: 'M6 3h9l4 4v14H6zM9 12h7M9 16h5', up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6',
  plus: 'M12 5v14M5 12h14', minus: 'M5 12h14', close: 'M5 5l14 14M19 5L5 19', back: 'M15 6l-6 6 6 6', lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3',
};
const Ic = ({ n, s = 18 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>;

const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const textToHtml = (text) => (text ? text.split('\n').map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('') : '<p><br></p>');
export const htmlToText = (html) => {
  const box = document.createElement('div');
  box.innerHTML = html.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>|<br\s*\/?>/gi, '\n');
  return (box.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
};
const today = () => new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const stamp = () => new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const regexEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uid = () => Date.now() + Math.floor(Math.random() * 1000);

export const PREMIUM_TEMPLATE_CONTENT = {
  'Formal Letter': 'Dear [Recipient],\n\n[Write your message here.]\n\nSincerely,\n[Your name]',
  'Resume Pro': 'PROFESSIONAL SUMMARY\n[Briefly describe your experience and goals.]\n\nEXPERIENCE\n[Role] | [Organization] | [Dates]\n[Key responsibility or achievement]\n\nEDUCATION\n[Qualification] | [Institution] | [Year]\n\nSKILLS\n[Relevant skills]',
  'Project Proposal Pro': 'PROJECT PROPOSAL\n\nObjective\n[Describe the problem and intended outcome.]\n\nPlan\n[List the steps, resources, and timeline.]\n\nExpected Results\n[Describe measurable outcomes.]\n\nBudget\n[List estimated costs.]',
};

const CREST = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 38 44"><path d="M19 2l15 5v13c0 11-7 19-15 22C11 39 4 31 4 20V7z" fill="#1D4ED8" stroke="#F5B82E" stroke-width="2.5"/><path d="M13 31l6-16 6 16M15.5 26h7" fill="none" stroke="#F5B82E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
const LETTERHEAD = `<p style="text-align:center"><img src="${CREST}" width="48" height="56" alt=""></p><h1 style="text-align:center;font-size:22px;margin:4px 0">Ardenne High School</h1><p style="text-align:center;color:#555555">[School address] &nbsp;·&nbsp; [Telephone] &nbsp;·&nbsp; [Email]</p><hr><p><br></p>`;
const detailsTable = () => `<table><tbody>${['Name', 'Class / Form', 'Subject', 'Teacher'].map((k) => `<tr><td style="width:30%"><b>${k}</b></td><td><br></td></tr>`).join('')}<tr><td><b>Date</b></td><td>${today()}</td></tr></tbody></table><p><br></p>`;
const tableHtml = (r, c) => `<table><tbody>${`<tr>${'<td><br></td>'.repeat(c)}</tr>`.repeat(r)}</tbody></table><p><br></p>`;

export function templateHtml(label, variant) {
  const head = variant === 'ardenne' ? LETTERHEAD : '';
  if (PREMIUM_TEMPLATE_CONTENT[label]) return textToHtml(PREMIUM_TEMPLATE_CONTENT[label]);
  if (label === 'Letter') return `${head}<p>${today()}</p><p><br></p><p>[Recipient name]<br>[Recipient address]</p><p><br></p><p>Dear [Name],</p><p>Write your letter here.</p><p><br></p><p>Yours sincerely,</p><p><br></p><p>[Your name]</p>`;
  if (label === 'Resume') return `<h1>[Your Name]</h1><p>[Phone] · [Email] · [Address]</p><h2>Education</h2><p>[School, years attended]</p><h2>Skills</h2><ul><li>[Skill]</li><li>[Skill]</li></ul><h2>Experience</h2><p>[Role, place, dates]</p>`;
  if (label === 'Project Proposal') return `${head}<h1>[Project Title]</h1><h2>Overview</h2><p>Describe the project in a few sentences.</p><h2>Goals</h2><ul><li>[Goal]</li></ul><h2>Timeline</h2><p>[Key dates]</p><h2>Resources</h2><p>[What you need]</p>`;
  return '';
}

function MenuBar({ menus }) {
  const [open, setOpen] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    const esc = (e) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', close); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  return (
    <div className="gd-menus" ref={ref} role="menubar" style={{ position: 'relative' }}>
      {menus.map((menu) => (
        <div className="de-menu" key={menu.label}>
          <button type="button" className={open === menu.label ? 'open' : ''} aria-haspopup="true" aria-expanded={open === menu.label} onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(open === menu.label ? null : menu.label)} onMouseEnter={() => open && setOpen(menu.label)}>{menu.label}</button>
          {open === menu.label && (
            <div className="de-drop" role="menu" style={{ zIndex: 60 }}>
              {menu.items.map((item, i) => item.divider ? <hr key={i} /> : (
                <button type="button" role="menuitem" key={item.label} onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen(null); item.run(); }}>
                  <span>{item.checked ? '✓ ' : ''}{item.label}</span>{item.keys && <kbd>{item.keys}</kbd>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ColorButton({ label, glyph, palette, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="de-colorwrap">
      <button type="button" className="de-tb" aria-label={label} title={label} onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(!open)}>{glyph}</button>
      {open && (
        <div className="de-swatches" role="group" aria-label={label}>
          {palette.map((c) => <button type="button" key={c} aria-label={c} style={{ background: c }} onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(c); setOpen(false); }} />)}
          <button type="button" className="none" onMouseDown={(e) => e.preventDefault()} onClick={() => { onPick(null); setOpen(false); }}>Reset</button>
        </div>
      )}
    </div>
  );
}

const loadJson = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };
const saveJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

export default function DocEditorCore({ variant = 'nebula', docId, title, initialHtml, fee, onTitleChange, onChange, onBack, onPublish, docTheme = null, themesOwned = false }) {
  const school = variant === 'ardenne';
  const edRef = useRef(null); const titleRef = useRef(null); const range = useRef(null);
  const changeRef = useRef(onChange); changeRef.current = onChange;
  const timer = useRef(null); const recRef = useRef(null); const lastSnap = useRef('');
  const prefsKey = `nebula_doc_prefs_${variant}_${docId}`; const versKey = `nebula_doc_versions_${variant}_${docId}`;
  const [prefs, setPrefs] = useState(() => ({
    size: school ? 'A4' : 'Letter', margin: 'normal', header: school, footer: school, headerText: 'Ardenne High School', footerText: '',
    goal: 0, min: 0, max: 0, dark: false, ruler: true, outline: true, status: 'Draft', checks: { info: false, proof: false }, comments: [],
    ...loadJson(prefsKey, {}),
  }));
  const [versions, setVersions] = useState(() => loadJson(versKey, []));
  const [counts, setCounts] = useState({ words: 0, chars: 0, charsNoSpace: 0 });
  const [pages, setPages] = useState(1);
  const [outline, setOutline] = useState([]);
  const [hasRefs, setHasRefs] = useState(false);
  const [fmt, setFmt] = useState({});
  const [zoom, setZoom] = useState(100);
  const [size, setSize] = useState(16);
  const [dialog, setDialog] = useState(null);
  const [saved, setSaved] = useState('Saved');
  const [focus, setFocus] = useState(false);
  const [spell, setSpell] = useState(true);
  const [mode, setMode] = useState('editing');
  const [panel, setPanel] = useState(null); // 'comments' | 'history' | 'tools'
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState('');
  const [paint, setPaint] = useState(null);
  const [listening, setListening] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [clock, setClock] = useState({ mode: 'focus', left: 1500, running: false });
  const pageTheme = prefs.theme === 'default' ? null : (prefs.theme || docTheme);

  useEffect(() => { saveJson(prefsKey, prefs); }, [prefs, prefsKey]);
  const setPref = (patch) => setPrefs((p) => ({ ...p, ...patch }));

  /* ---------- measuring / saving ---------- */
  const measure = () => {
    const ed = edRef.current; if (!ed) return;
    const text = ed.innerText || '';
    setCounts({ words: text.trim() ? text.trim().split(/\s+/).length : 0, chars: text.replace(/\n/g, '').length, charsNoSpace: text.replace(/\s/g, '').length });
    setPages(Math.max(1, Math.ceil((ed.scrollHeight + MARGINS[prefs.margin] * 2) / PAGE[prefs.size].h)));
    setOutline([...ed.querySelectorAll('h1,h2,h3,h4')].map((h) => ({ text: h.textContent.trim(), level: Number(h.tagName[1]) })).filter((h) => h.text));
    setHasRefs(!!ed.querySelector('sup[data-fn]') || /(reference|bibliograph|sources)/i.test([...ed.querySelectorAll('h1,h2,h3,h4')].map((h) => h.textContent).join(' ')));
  };
  const handleInput = () => {
    const ed = edRef.current; if (!ed) return;
    measure(); setSaved('Saving...');
    changeRef.current({ html: ed.innerHTML, text: ed.innerText || '' });
    clearTimeout(timer.current); timer.current = setTimeout(() => setSaved('Saved'), 700);
  };
  const updateFmt = () => {
    const q = (c) => { try { return document.queryCommandState(c); } catch { return false; } };
    let block = ''; let font = '';
    try { block = String(document.queryCommandValue('formatBlock') || '').toLowerCase().replace(/[<>]/g, ''); } catch { /* ignore */ }
    try { font = String(document.queryCommandValue('fontName') || '').replace(/["']/g, ''); } catch { /* ignore */ }
    setFmt({ bold: q('bold'), italic: q('italic'), underline: q('underline'), strike: q('strikeThrough'), ul: q('insertUnorderedList'), ol: q('insertOrderedList'), left: q('justifyLeft'), center: q('justifyCenter'), right: q('justifyRight'), full: q('justifyFull'), block, font });
  };

  /* ---------- versions ---------- */
  const snapshot = (label) => {
    const ed = edRef.current; if (!ed) return;
    const html = ed.innerHTML; if (html === lastSnap.current && !label) return;
    lastSnap.current = html;
    const next = [{ id: uid(), time: stamp(), label: label || '', html, words: (ed.innerText || '').trim() ? ed.innerText.trim().split(/\s+/).length : 0 }, ...loadJson(versKey, [])].slice(0, 15);
    if (!saveJson(versKey, next)) { next.length = Math.min(next.length, 5); saveJson(versKey, next); }
    setVersions(next);
  };
  const restoreVersion = (v) => {
    if (!window.confirm('Restore this version? Your current text is saved as a version first.')) return;
    snapshot('Before restore'); edRef.current.innerHTML = v.html; lastSnap.current = v.html; handleInput();
  };

  /* ---------- setup ---------- */
  useEffect(() => {
    const ed = edRef.current;
    ed.innerHTML = initialHtml || '<p><br></p>';
    lastSnap.current = ed.innerHTML;
    try { document.execCommand('styleWithCSS', false, true); document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* ignore */ }
    measure();
    const onSel = () => {
      const sel = window.getSelection();
      if (sel.rangeCount && ed.contains(sel.anchorNode)) { range.current = sel.getRangeAt(0).cloneRange(); updateFmt(); }
    };
    document.addEventListener('selectionchange', onSel);
    const auto = setInterval(() => snapshot(''), 120000);
    return () => { document.removeEventListener('selectionchange', onSel); clearInterval(auto); clearTimeout(timer.current); if (recRef.current) recRef.current.stop(); snapshot(''); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(measure, [prefs.size, prefs.margin]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!clock.running) return undefined;
    const id = setInterval(() => setClock((c) => (c.left > 1 ? { ...c, left: c.left - 1 } : c.mode === 'focus' ? { mode: 'break', left: 300, running: true } : { mode: 'focus', left: 1500, running: true })), 1000);
    return () => clearInterval(id);
  }, [clock.running]);

  /* ---------- editing helpers ---------- */
  const restore = () => {
    const ed = edRef.current; ed.focus();
    if (range.current) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range.current); }
  };
  const exec = (cmd, val = null) => { restore(); try { document.execCommand(cmd, false, val); } catch { /* ignore */ } handleInput(); updateFmt(); };
  const insert = (html) => exec('insertHTML', html);
  const applySize = (px) => {
    const n = Math.min(96, Math.max(6, Number(px) || 16)); setSize(n); restore();
    try { document.execCommand('fontSize', false, '7'); } catch { /* ignore */ }
    edRef.current.querySelectorAll('font[size="7"], span[style*="xxx-large"]').forEach((el) => {
      let target = el;
      if (el.tagName === 'FONT') { target = document.createElement('span'); while (el.firstChild) target.appendChild(el.firstChild); el.replaceWith(target); }
      target.style.fontSize = `${n}px`;
    });
    handleInput();
  };
  const stepSize = (dir) => { const i = SIZES.indexOf(Number(size)); applySize(SIZES[Math.min(SIZES.length - 1, Math.max(0, (i < 0 ? SIZES.indexOf(16) : i) + dir))]); };
  const setLineHeight = (v) => {
    restore(); const sel = window.getSelection(); if (!sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    edRef.current.querySelectorAll('p,h1,h2,h3,h4,li,blockquote').forEach((b) => { if (r.intersectsNode(b)) b.style.lineHeight = v; });
    handleInput();
  };
  const download = (name, type, content) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
  const fileName = (title || 'Untitled Document').replace(/[^\w\- ]+/g, '');
  const open = (kind, initial = {}) => { setForm(initial); setMsg(''); setDialog(kind); };
  const close = () => { setDialog(null); setMsg(''); };

  const submitLink = (e) => {
    e.preventDefault(); close(); if (!form.url) return;
    if (range.current && range.current.collapsed) insert(`<a href="${escapeHtml(form.url)}">${escapeHtml(form.url)}</a>`); else exec('createLink', form.url);
  };
  const submitImage = (e) => {
    e.preventDefault();
    const file = form.file;
    if (file) {
      if (file.size > 1500000) { setMsg('That image is too large (limit 1.5 MB). Choose a smaller one.'); return; }
      const reader = new FileReader();
      reader.onload = () => { close(); insert(`<img src="${reader.result}" alt="${escapeHtml(file.name)}"><p><br></p>`); };
      reader.readAsDataURL(file);
    } else if (form.url) { close(); insert(`<img src="${escapeHtml(form.url)}" alt=""><p><br></p>`); } else setMsg('Choose a file or paste an image address.');
  };
  const insertFootnote = () => {
    const ed = edRef.current; const n = ed.querySelectorAll('sup[data-fn]').length + 1;
    insert(`<sup data-fn="${n}">${n}</sup>`);
    const p = document.createElement('p'); p.className = 'de-fn'; p.innerHTML = `<sup>${n}</sup> [Footnote text]`; ed.appendChild(p); handleInput();
  };
  const insertToc = () => {
    const items = [...edRef.current.querySelectorAll('h1,h2,h3,h4')].filter((h) => h.textContent.trim());
    if (!items.length) { window.alert('Add some headings first, then insert the table of contents.'); return; }
    insert(`<div class="de-toc"><p><b>Contents</b></p>${items.map((h) => `<p style="margin-left:${(Number(h.tagName[1]) - 1) * 18}px">${escapeHtml(h.textContent.trim())}</p>`).join('')}</div><p><br></p>`);
  };
  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { window.alert('Voice typing is not supported in this browser. Try Chrome or Edge.'); return; }
    if (listening && recRef.current) { recRef.current.stop(); return; }
    const rec = new SR(); rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
    rec.onresult = (e) => { for (let i = e.resultIndex; i < e.results.length; i += 1) if (e.results[i].isFinal) exec('insertText', `${e.results[i][0].transcript} `); };
    rec.onend = () => setListening(false); rec.onerror = () => setListening(false);
    recRef.current = rec; rec.start(); setListening(true);
  };

  /* ---------- paint format ---------- */
  const startPaint = () => {
    if (paint) { setPaint(null); return; }
    const q = (c) => { try { return document.queryCommandState(c); } catch { return false; } };
    let color = ''; try { color = document.queryCommandValue('foreColor'); } catch { /* ignore */ }
    setPaint({ bold: q('bold'), italic: q('italic'), underline: q('underline'), strike: q('strikeThrough'), font: fmt.font, color });
  };
  const applyPaint = () => {
    const sel = window.getSelection();
    if (!paint || !sel.rangeCount || sel.getRangeAt(0).collapsed) return;
    range.current = sel.getRangeAt(0).cloneRange();
    const q = (c) => { try { return document.queryCommandState(c); } catch { return false; } };
    if (q('bold') !== paint.bold) exec('bold'); if (q('italic') !== paint.italic) exec('italic');
    if (q('underline') !== paint.underline) exec('underline'); if (q('strikeThrough') !== paint.strike) exec('strikeThrough');
    if (paint.font) exec('fontName', paint.font); if (paint.color) exec('foreColor', paint.color);
    setPaint(null);
  };

  /* ---------- find and replace ---------- */
  const findNext = (back = false) => {
    if (!form.find) return;
    edRef.current.focus();
    const ok = window.find(form.find, !!form.matchCase, back, true, false, false, false);
    setMsg(ok ? '' : 'No matches found.');
  };
  const replaceOne = () => {
    const sel = window.getSelection(); const cur = sel.toString();
    if (cur && (form.matchCase ? cur === form.find : cur.toLowerCase() === (form.find || '').toLowerCase()) && edRef.current.contains(sel.anchorNode)) { document.execCommand('insertText', false, form.repl || ''); handleInput(); }
    findNext();
  };
  const replaceAll = () => {
    if (!form.find) return;
    const rx = new RegExp(regexEscape(form.find), form.matchCase ? 'g' : 'gi'); let n = 0;
    const walker = document.createTreeWalker(edRef.current, NodeFilter.SHOW_TEXT); const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => { const next = node.nodeValue.replace(rx, () => { n += 1; return form.repl || ''; }); if (next !== node.nodeValue) node.nodeValue = next; });
    handleInput(); setMsg(`Replaced ${n} ${n === 1 ? 'match' : 'matches'}.`);
  };

  /* ---------- comments ---------- */
  const submitComment = (e) => {
    e.preventDefault();
    if (!form.text || !form.text.trim()) { setMsg('Write a comment first.'); return; }
    restore(); const sel = window.getSelection();
    if (!sel.rangeCount || sel.getRangeAt(0).collapsed) { setMsg('Select some text in the document first, then add a comment.'); return; }
    const id = uid(); const holder = document.createElement('div'); holder.appendChild(sel.getRangeAt(0).cloneContents());
    const quote = (holder.textContent || '').slice(0, 80);
    try { document.execCommand('insertHTML', false, `<span class="de-cm" data-cid="${id}">${holder.innerHTML}</span>`); } catch { /* ignore */ }
    setPref({ comments: [...prefs.comments, { id, author: 'You', time: stamp(), text: form.text.trim(), quote, resolved: false, replies: [] }] });
    handleInput(); close(); setPanel('comments');
  };
  const anchorOf = (id) => edRef.current.querySelector(`[data-cid="${id}"]`);
  const flash = (el) => { if (!el) return; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); el.classList.add('de-flash'); setTimeout(() => el.classList.remove('de-flash'), 1200); };
  const updateComment = (id, patch) => setPref({ comments: prefs.comments.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  const resolveComment = (id) => { const el = anchorOf(id); if (el) { el.classList.add('done'); handleInput(); } updateComment(id, { resolved: true }); };
  const deleteComment = (id) => {
    const el = anchorOf(id);
    if (el) { while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el); el.remove(); handleInput(); }
    setPref({ comments: prefs.comments.filter((c) => c.id !== id) });
  };
  const addReply = (id, text) => { if (!text.trim()) return; updateComment(id, { replies: [...prefs.comments.find((c) => c.id === id).replies, { id: uid(), author: 'You', time: stamp(), text: text.trim() }] }); };

  /* ---------- keyboard / clicks ---------- */
  const onKeyDown = (e) => {
    const mod = e.ctrlKey || e.metaKey; const k = e.key.toLowerCase();
    if (mod && k === 'k') { e.preventDefault(); range.current = window.getSelection().rangeCount ? window.getSelection().getRangeAt(0).cloneRange() : null; open('link', { url: 'https://' }); }
    if (mod && k === 'h') { e.preventDefault(); open('find', { find: window.getSelection().toString() }); }
    if (mod && k === 's') { e.preventDefault(); snapshot('Saved by you'); handleInput(); }
  };
  const onEditorClick = (e) => {
    const li = e.target.closest && e.target.closest('li');
    if (li && li.parentNode.classList && li.parentNode.classList.contains('de-check') && e.clientX - li.getBoundingClientRect().left < 28) { li.classList.toggle('done'); handleInput(); }
    const cm = e.target.closest && e.target.closest('.de-cm');
    if (cm) { setPanel('comments'); }
  };

  /* ---------- menus ---------- */
  const menus = [
    { label: 'File', items: [
      { label: 'Rename', run: () => titleRef.current && titleRef.current.focus() },
      { label: 'Make a copy of this version', run: () => snapshot('Copy') },
      { label: 'Share...', run: () => open('share') },
      { divider: true },
      { label: 'Download as HTML', run: () => download(`${fileName}.html`, 'text/html', `<!doctype html><meta charset="utf-8"><title>${escapeHtml(title || '')}</title>${edRef.current.innerHTML}`) },
      { label: 'Download as text', run: () => download(`${fileName}.txt`, 'text/plain', edRef.current.innerText) },
      { divider: true },
      { label: 'Version history', run: () => setPanel('history') },
      { label: 'Page setup...', run: () => open('page', { size: prefs.size, margin: prefs.margin, dark: prefs.dark }) },
      { label: 'Print', keys: 'Ctrl+P', run: () => window.print() },
      { divider: true }, { label: 'Close (back to Docs Home)', run: onBack },
    ] },
    { label: 'Edit', items: [
      { label: 'Undo', keys: 'Ctrl+Z', run: () => exec('undo') }, { label: 'Redo', keys: 'Ctrl+Y', run: () => exec('redo') }, { divider: true },
      { label: 'Cut', keys: 'Ctrl+X', run: () => exec('cut') }, { label: 'Copy', keys: 'Ctrl+C', run: () => exec('copy') }, { label: 'Select all', keys: 'Ctrl+A', run: () => exec('selectAll') },
      { label: 'Delete', run: () => exec('delete') }, { divider: true }, { label: 'Find and replace...', keys: 'Ctrl+H', run: () => open('find', { find: '' }) },
    ] },
    { label: 'View', items: [
      { label: 'Mode: Editing', checked: mode === 'editing', run: () => setMode('editing') }, { label: 'Mode: Viewing', checked: mode === 'viewing', run: () => setMode('viewing') }, { divider: true },
      { label: 'Show ruler', checked: prefs.ruler, run: () => setPref({ ruler: !prefs.ruler }) }, { label: 'Show outline', checked: prefs.outline, run: () => setPref({ outline: !prefs.outline }) },
      { label: school ? 'Show submission checklist' : 'Show study tools', checked: panel === 'tools', run: () => setPanel(panel === 'tools' ? null : 'tools') },
      { label: 'Show comments', checked: panel === 'comments', run: () => setPanel(panel === 'comments' ? null : 'comments') }, { divider: true },
      ...[75, 100, 125, 150].map((z) => ({ label: `Zoom ${z}%`, checked: zoom === z, run: () => setZoom(z) })),
      ...(school ? [] : [{ divider: true }, { label: 'Focus mode', checked: focus, run: () => setFocus(!focus) }, { label: 'Dark page', checked: prefs.dark, run: () => setPref({ dark: !prefs.dark }) }]),
    ] },
    { label: 'Insert', items: [
      { label: 'Image...', run: () => open('image', {}) }, { label: 'Table...', run: () => open('table', { r: 3, c: 3 }) }, { label: 'Horizontal line', run: () => insert('<hr><p><br></p>') },
      { label: 'Footnote', keys: 'Ctrl+Alt+F', run: insertFootnote }, { label: 'Special characters...', run: () => open('symbols') },
      { divider: true },
      ...(school ? [{ label: 'School letterhead', run: () => insert(LETTERHEAD) }, { label: 'Assignment details', run: () => insert(detailsTable()) }]
        : [{ label: 'Star divider', run: () => insert('<p style="text-align:center;letter-spacing:12px">✦ ✦ ✦</p>') }, { label: 'Callout box', run: () => insert('<div class="de-callout"><b>Note</b><br>Write something here.</div><p><br></p>') }]),
      { label: 'Date', run: () => insert(today()) }, { divider: true },
      { label: 'Page break', run: () => insert('<div class="de-pagebreak"></div><p><br></p>') }, { label: 'Header and footer...', run: () => open('hf', { header: prefs.header, footer: prefs.footer, headerText: prefs.headerText, footerText: prefs.footerText }) },
      { divider: true }, { label: 'Link...', keys: 'Ctrl+K', run: () => open('link', { url: 'https://' }) }, { label: 'Comment...', run: () => open('comment', { text: '' }) }, { label: 'Table of contents', run: insertToc },
    ] },
    { label: 'Format', items: [
      { label: 'Bold', keys: 'Ctrl+B', run: () => exec('bold') }, { label: 'Italic', keys: 'Ctrl+I', run: () => exec('italic') }, { label: 'Underline', keys: 'Ctrl+U', run: () => exec('underline') }, { label: 'Strikethrough', run: () => exec('strikeThrough') },
      { label: 'Superscript', run: () => exec('superscript') }, { label: 'Subscript', run: () => exec('subscript') }, { divider: true },
      { label: 'Bulleted list', run: () => exec('insertUnorderedList') }, { label: 'Numbered list', run: () => exec('insertOrderedList') }, { label: 'Checklist', run: () => insert('<ul class="de-check"><li><br></li></ul>') },
      { divider: true }, { label: 'Clear formatting', run: () => exec('removeFormat') },
      ...(themesOwned ? [{ divider: true }, { label: 'Theme: Default', checked: pageTheme !== 'christmas', run: () => setPref({ theme: 'default' }) }, { label: 'Theme: Christmas', checked: pageTheme === 'christmas', run: () => setPref({ theme: 'christmas' }) }] : []),
    ] },
    { label: 'Tools', items: [
      { label: 'Spelling check', checked: spell, run: () => setSpell(!spell) }, { label: 'Word count', keys: 'Ctrl+Shift+C', run: () => open('count') },
      school ? { label: 'Word limit...', run: () => open('limit', { min: prefs.min || '', max: prefs.max || '' }) } : { label: 'Word goal...', run: () => open('goal', { goal: prefs.goal || '' }) },
      { divider: true }, { label: 'Voice typing', checked: listening, run: toggleVoice },
    ] },
    { label: 'Help', items: [{ label: 'Keyboard shortcuts', run: () => open('keys') }] },
  ];

  /* ---------- derived ---------- */
  const pg = PAGE[prefs.size]; const pad = MARGINS[prefs.margin];
  const goalPct = prefs.goal ? Math.min(100, Math.round((counts.words / prefs.goal) * 100)) : 0;
  const limitState = prefs.max && counts.words > prefs.max ? 'over' : prefs.min && counts.words < prefs.min ? 'under' : 'ok';
  const fontValue = FONTS.find((f) => fmt.font && fmt.font.toLowerCase().startsWith(f.toLowerCase())) || (school ? 'Times New Roman' : 'Arial');
  const mmss = `${String(Math.floor(clock.left / 60)).padStart(2, '0')}:${String(clock.left % 60).padStart(2, '0')}`;
  const readMin = Math.max(1, Math.ceil(counts.words / 200));
  const tb = (n, label, on, run) => <button type="button" className={`de-tb ${on ? 'on' : ''}`} aria-label={label} title={label} aria-pressed={!!on} onMouseDown={(e) => e.preventDefault()} onClick={run}><Ic n={n} /></button>;
  const letter = (ch, label, on, run) => <button type="button" className={`de-tb ${on ? 'on' : ''}`} aria-label={label} title={label} aria-pressed={!!on} onMouseDown={(e) => e.preventDefault()} onClick={run}>{ch}</button>;
  const checks = [
    [!!prefs.checks.info, 'Name, class and teacher added', () => setPref({ checks: { ...prefs.checks, info: !prefs.checks.info } })],
    [(prefs.min > 0 || prefs.max > 0) && limitState === 'ok', prefs.min || prefs.max ? 'Within the word limit' : 'Word limit set and met', null],
    [hasRefs, 'References added', null],
    [!!prefs.checks.proof, 'Proofread', () => setPref({ checks: { ...prefs.checks, proof: !prefs.checks.proof } })],
    [prefs.header && prefs.footer, 'Header and footer on', null],
  ];
  const openComments = prefs.comments.filter((c) => !c.resolved);

  return (
    <div className={`de de-${variant}${collapsed ? ' gd-collapsed' : ''}`}>
      {focus && <button type="button" className="de-btn ghost de-exitfocus" onClick={() => setFocus(false)}>Exit focus mode</button>}

      {!focus && (
        <div className="gd-top">
          <button type="button" className="de-iconbtn" aria-label="Back to Docs Home" onClick={onBack}><Ic n="back" /></button>
          <div className="gd-logo"><Ic n="doc" s={20} /></div>
          <div className="gd-titlecol">
            <div className="gd-titlerow">
              <input ref={titleRef} className="gd-title" aria-label="Document title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
              <span style={{ fontSize: 12, color: 'var(--de-muted)', marginLeft: 6 }}>{saved}{school ? ` · ${prefs.status}` : ''}</span>
            </div>
            <MenuBar menus={menus} />
          </div>
          <div className="gd-right">
            {tb('history', 'Version history', panel === 'history', () => setPanel(panel === 'history' ? null : 'history'))}
            {tb('chat', 'Comments', panel === 'comments', () => setPanel(panel === 'comments' ? null : 'comments'))}
            <button type="button" className="gd-share" onClick={() => open('share')}><Ic n="lock" s={16} />Share</button>
            <button type="button" className="de-btn ghost" aria-label="Share / Publish" onClick={onPublish} title={`${counts.words} words: ${fee.finalCost} Credits, +${fee.earnedExp} EXP`}>Publish ({fee.finalCost} Credits)</button>
          </div>
        </div>
      )}

      {!focus && (
        <div className="gd-toolbar" role="toolbar" aria-label="Formatting">
          {tb('undo', 'Undo', false, () => exec('undo'))}{tb('redo', 'Redo', false, () => exec('redo'))}{tb('print', 'Print', false, () => window.print())}
          {tb('spell', 'Spelling check', spell, () => setSpell(!spell))}{tb('paint', 'Paint format', !!paint, startPaint)}
          <select className="de-sel" aria-label="Zoom" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>{[50, 75, 100, 125, 150, 200].map((z) => <option key={z} value={z}>{z}%</option>)}</select>
          <span className="de-sep" />
          <select className="de-sel" aria-label="Text style" value={BLOCKS.some(([k]) => k === fmt.block) ? fmt.block : 'p'} onChange={(e) => exec('formatBlock', e.target.value)}>{BLOCKS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select className="de-sel" aria-label="Font" value={fontValue} onChange={(e) => exec('fontName', e.target.value)}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
          <span className="de-sep" />
          {tb('minus', 'Decrease font size', false, () => stepSize(-1))}
          <input className="gd-num" aria-label="Font size" value={size} onChange={(e) => setSize(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applySize(size)} style={{ width: 40, textAlign: 'center', background: 'transparent', color: 'inherit' }} />
          {tb('plus', 'Increase font size', false, () => stepSize(1))}
          <span className="de-sep" />
          {letter(<b>B</b>, 'Bold', fmt.bold, () => exec('bold'))}{letter(<i>I</i>, 'Italic', fmt.italic, () => exec('italic'))}{letter(<u>U</u>, 'Underline', fmt.underline, () => exec('underline'))}{letter(<s>S</s>, 'Strikethrough', fmt.strike, () => exec('strikeThrough'))}
          <ColorButton label="Text color" glyph={<b style={{ borderBottom: '3px solid var(--de-acc2)' }}>A</b>} palette={PALETTES[variant]} onPick={(c) => (c ? exec('foreColor', c) : exec('removeFormat'))} />
          <ColorButton label="Highlight color" glyph={<span style={{ background: 'var(--de-acc2)', color: '#000', padding: '0 4px', borderRadius: 3, fontWeight: 700 }}>H</span>} palette={PALETTES[variant]} onPick={(c) => exec('hiliteColor', c || 'transparent')} />
          <span className="de-sep" />
          {tb('link', 'Insert link', false, () => open('link', { url: 'https://' }))}{tb('cadd', 'Add comment', false, () => open('comment', { text: '' }))}{tb('image', 'Insert image', false, () => open('image', {}))}
          <span className="de-sep" />
          {tb('left', 'Align left', fmt.left, () => exec('justifyLeft'))}{tb('center', 'Align center', fmt.center, () => exec('justifyCenter'))}{tb('right', 'Align right', fmt.right, () => exec('justifyRight'))}{tb('full', 'Justify', fmt.full, () => exec('justifyFull'))}
          <select className="de-sel" aria-label="Line spacing" defaultValue="" onChange={(e) => e.target.value && setLineHeight(e.target.value)}><option value="" disabled>Spacing</option>{['1', '1.15', '1.5', '2'].map((v) => <option key={v} value={v}>{v}</option>)}</select>
          {tb('check', 'Checklist', false, () => insert('<ul class="de-check"><li><br></li></ul>'))}{tb('ul', 'Bulleted list', fmt.ul, () => exec('insertUnorderedList'))}{tb('ol', 'Numbered list', fmt.ol, () => exec('insertOrderedList'))}
          {tb('outdent', 'Decrease indent', false, () => exec('outdent'))}{tb('indent', 'Increase indent', false, () => exec('indent'))}{tb('clear', 'Clear formatting', false, () => exec('removeFormat'))}
          <span className="gd-mode">
            <select className="de-mode" aria-label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}><option value="editing">Editing</option><option value="viewing">Viewing</option></select>
            {tb('up', 'Hide the toolbar', false, () => setCollapsed(true))}
          </span>
        </div>
      )}
      {collapsed && !focus && <div style={{ padding: '0 16px' }}><button type="button" className="de-btn ghost" onClick={() => setCollapsed(false)}>Show toolbar</button></div>}

      <div className="gd-body">
        {!focus && prefs.outline && (
          <aside className="gd-left" aria-label="Outline">
            <div className="gd-lh"><span>Outline</span></div>
            {outline.length === 0 ? <p className="gd-hint">Headings you add to the document will appear here.</p> : (
              <ul className="gd-out">{outline.map((h, i) => (
                <li key={`${i}-${h.text}`} className={h.level > 1 ? 'l2' : ''} onClick={() => { const el = [...edRef.current.querySelectorAll('h1,h2,h3,h4')].filter((x) => x.textContent.trim())[i]; flash(el); }}>{h.text}</li>
              ))}</ul>
            )}
          </aside>
        )}

        <main className={`gd-mid ${mode === 'viewing' ? 'view' : ''}`}>
          {prefs.ruler && !focus && <div className="de-ruler" style={{ width: pg.w * zoom / 100 }} />}
          <div className="de-zoom" style={{ zoom: zoom / 100 }}>
            <div className={`de-page ${prefs.dark ? 'dark' : ''} ${pageTheme === 'christmas' ? 'de-theme-christmas' : ''}`} style={{ width: pg.w, minHeight: pg.h, padding: pad, '--de-ph': `${pg.h}px` }}>
              {prefs.header && <div className="de-hf head" contentEditable={false}><span>{prefs.headerText}</span><span>{title}</span></div>}
              <div ref={edRef} className="de-content" contentEditable={mode === 'editing'} suppressContentEditableWarning spellCheck={spell} role="textbox" aria-multiline="true" aria-label="Document editor" onInput={handleInput} onKeyDown={onKeyDown} onClick={onEditorClick} onMouseUp={applyPaint} style={{ fontSize: 16, fontFamily: school ? '"Times New Roman",Times,serif' : 'Arial,sans-serif' }} />
              {prefs.footer && <div className="de-hf foot" contentEditable={false}><span>{prefs.footerText}</span><span>Page 1 of {pages}</span></div>}
            </div>
          </div>
        </main>

        {!focus && panel === 'comments' && (
          <aside className="gd-panel" aria-label="Comments">
            <h4>Comments<button type="button" className="de-tb" aria-label="Close" onClick={() => setPanel(null)}><Ic n="close" s={16} /></button></h4>
            {prefs.comments.length === 0 && <p className="gd-hint">No comments yet. Select text and choose Add comment.</p>}
            {prefs.comments.map((c) => (
              <div className="gd-card" key={c.id} style={{ opacity: c.resolved ? 0.6 : 1 }}>
                <div className="who"><span className="de-av">{c.author.charAt(0)}</span><span><b>{c.author}</b><small>{c.time}{c.resolved ? ' · Resolved' : ''}</small></span></div>
                {c.quote && <div style={{ fontSize: 12, color: 'var(--de-muted)', borderLeft: '3px solid var(--de-acc2)', paddingLeft: 8, marginBottom: 6 }} onClick={() => flash(anchorOf(c.id))}>{c.quote}</div>}
                <div>{c.text}</div>
                {c.replies.map((r) => <div key={r.id} style={{ marginTop: 8, paddingLeft: 10, borderLeft: '2px solid var(--de-line)' }}><b>{r.author}</b> <small>{r.time}</small><br />{r.text}</div>)}
                {!c.resolved && <input aria-label="Reply" placeholder="Reply" onKeyDown={(e) => { if (e.key === 'Enter') { addReply(c.id, e.target.value); e.target.value = ''; } }} />}
                <div className="acts">
                  {!c.resolved && <button type="button" className="p" onClick={() => resolveComment(c.id)}>Resolve</button>}
                  <button type="button" onClick={() => deleteComment(c.id)}>Delete</button>
                </div>
              </div>
            ))}
          </aside>
        )}

        {!focus && panel === 'history' && (
          <aside className="gd-panel" aria-label="Version history">
            <h4>Version history<button type="button" className="de-tb" aria-label="Close" onClick={() => setPanel(null)}><Ic n="close" s={16} /></button></h4>
            <button type="button" className="de-btn" style={{ marginBottom: 12 }} onClick={() => snapshot('Saved by you')}>Save a version now</button>
            {versions.length === 0 && <p className="gd-hint">Versions are saved automatically every few minutes while you write.</p>}
            {versions.map((v, i) => (
              <div className={`gd-vrow ${i === 0 ? 'on' : ''}`} key={v.id}>
                <b>{i === 0 ? 'Latest version' : v.time}</b><small>{i === 0 ? `${v.time} · ` : ''}{v.words} words{v.label ? ` · ${v.label}` : ''}</small>
                {i > 0 && <div style={{ marginTop: 8 }}><button type="button" className="de-btn ghost" style={{ height: 30 }} onClick={() => restoreVersion(v)}>Restore this version</button></div>}
              </div>
            ))}
          </aside>
        )}

        {!focus && panel === 'tools' && (
          <aside className="gd-panel" aria-label={school ? 'Submission checklist' : 'Study tools'}>
            <h4>{school ? 'Submission checklist' : 'Study tools'}<button type="button" className="de-tb" aria-label="Close" onClick={() => setPanel(null)}><Ic n="close" s={16} /></button></h4>
            {school ? (
              <>
                <div className="gd-card"><b>Document status</b>
                  <select className="de-sel" style={{ width: '100%', marginTop: 8, height: 38 }} aria-label="Document status" value={prefs.status} onChange={(e) => setPref({ status: e.target.value })}><option>Draft</option><option>Final</option></select>
                </div>
                <div className="gd-card"><b>Before you hand it in</b>
                  {checks.map(([ok, label, toggle]) => (
                    <div className="gd-chk" key={label}>
                      {toggle ? <button type="button" aria-label={label} aria-pressed={ok} onClick={toggle} style={{ all: 'unset', cursor: 'pointer' }}><i className={ok ? 'ok' : ''}>{ok ? '✓' : ''}</i></button> : <i className={ok ? 'ok' : ''}>{ok ? '✓' : ''}</i>}
                      {label}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="gd-card"><b>Focus timer ({clock.mode === 'focus' ? '25 min focus' : '5 min break'})</b><div className="gd-big">{mmss}</div>
                  <div className="acts"><button type="button" className="p" onClick={() => setClock({ ...clock, running: !clock.running })}>{clock.running ? 'Pause' : 'Start'}</button><button type="button" onClick={() => setClock({ mode: 'focus', left: 1500, running: false })}>Reset</button></div>
                </div>
                <div className="gd-card"><b>Word goal</b>
                  {prefs.goal > 0 ? <><div style={{ margin: '8px 0 6px' }}>{counts.words} / {prefs.goal} words</div><span className="de-progress" style={{ display: 'block', width: '100%' }}><i style={{ width: `${goalPct}%` }} /></span></> : <p style={{ margin: '8px 0 0' }}>No goal set. Use Tools, then Word goal.</p>}
                </div>
                <div className="gd-card"><b>Reading time</b><div className="gd-big">{readMin} min</div></div>
                <div className="gd-card"><b>Credits and EXP</b><div style={{ marginTop: 6 }}>Publishing costs {fee.finalCost} Credits and earns +{fee.earnedExp} EXP</div></div>
              </>
            )}
          </aside>
        )}
      </div>

      <div className="de-status">
        <span>{counts.words} words</span><span>{counts.chars} characters</span><span>{pages} {pages === 1 ? 'page' : 'pages'}</span><span>{readMin} min read</span>
        {!school && prefs.goal > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Goal {counts.words} / {prefs.goal}<span className="de-progress"><i style={{ width: `${goalPct}%` }} /></span>{goalPct}%</span>}
        {school && (prefs.min > 0 || prefs.max > 0) && <span className={limitState === 'ok' ? 'de-ok' : 'de-warn'}>{limitState === 'ok' ? 'Within word limit' : limitState === 'under' ? `Below minimum (${prefs.min})` : `Over limit (${prefs.max})`}</span>}
        {paint && <span className="de-ok">Paint format: select text to apply</span>}
        {listening && <span className="de-warn">Listening...</span>}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          {!school && <button type="button" className="de-tb" style={{ width: 'auto', padding: '0 8px', fontSize: 12 }} onClick={() => setPanel(panel === 'tools' ? null : 'tools')}>{clock.running ? `${clock.mode === 'focus' ? 'Focus' : 'Break'} ${mmss}` : 'Study tools'}</button>}
          {school && <button type="button" className="de-tb" style={{ width: 'auto', padding: '0 8px', fontSize: 12 }} onClick={() => setPanel(panel === 'tools' ? null : 'tools')}>Checklist</button>}
          <span>{prefs.size} · {prefs.margin} margins · {openComments.length} open {openComments.length === 1 ? 'comment' : 'comments'}</span>
        </span>
      </div>

      {dialog && (
        <div className="de-back" style={{ position: 'fixed' }} onMouseDown={close}>
          <div className="de-dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            {dialog === 'link' && <form onSubmit={submitLink}><h3>Insert link</h3><label htmlFor="d-url">Web address</label><input id="d-url" className="gd-input" autoFocus value={form.url || ''} onChange={(e) => setForm({ url: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Insert</button></div></form>}
            {dialog === 'image' && <form onSubmit={submitImage}><h3>Insert image</h3><label htmlFor="d-file">Upload from your device</label><input id="d-file" type="file" accept="image/*" onChange={(e) => setForm({ ...form, file: e.target.files[0] })} /><label htmlFor="d-iurl">Or paste an image address</label><input id="d-iurl" className="gd-input" placeholder="https://" value={form.url || ''} onChange={(e) => setForm({ ...form, url: e.target.value })} />{msg && <p className="de-msg" role="alert">{msg}</p>}<div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Insert</button></div></form>}
            {dialog === 'table' && <form onSubmit={(e) => { e.preventDefault(); close(); insert(tableHtml(Math.min(20, Math.max(1, Number(form.r) || 1)), Math.min(10, Math.max(1, Number(form.c) || 1)))); }}><h3>Insert table</h3><label htmlFor="d-r">Rows</label><input id="d-r" className="gd-input" type="number" min="1" max="20" autoFocus value={form.r} onChange={(e) => setForm({ ...form, r: e.target.value })} /><label htmlFor="d-c">Columns</label><input id="d-c" className="gd-input" type="number" min="1" max="10" value={form.c} onChange={(e) => setForm({ ...form, c: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Insert</button></div></form>}
            {dialog === 'symbols' && <><h3>Special characters</h3><div className="gd-sym">{SYMBOLS.map((s) => <button type="button" key={s} onMouseDown={(e) => e.preventDefault()} onClick={() => { close(); insert(s); }}>{s}</button>)}</div><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Close</button></div></>}
            {dialog === 'comment' && <form onSubmit={submitComment}><h3>Add comment</h3><p className="de-msg" style={{ marginTop: 0 }}>Select the text you want to comment on first.</p><label htmlFor="d-cm">Comment</label><textarea id="d-cm" className="gd-input" rows="3" autoFocus value={form.text || ''} onChange={(e) => setForm({ text: e.target.value })} />{msg && <p className="de-msg" role="alert">{msg}</p>}<div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Comment</button></div></form>}
            {dialog === 'find' && <div><h3>Find and replace</h3><label htmlFor="d-f">Find</label><input id="d-f" className="gd-input" autoFocus value={form.find || ''} onChange={(e) => setForm({ ...form, find: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && findNext()} /><label htmlFor="d-rp">Replace with</label><input id="d-rp" className="gd-input" value={form.repl || ''} onChange={(e) => setForm({ ...form, repl: e.target.value })} /><label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={!!form.matchCase} onChange={(e) => setForm({ ...form, matchCase: e.target.checked })} style={{ width: 'auto' }} />Match case</label>{msg && <p className="de-msg" role="status">{msg}</p>}<div className="acts"><button type="button" className="de-btn ghost" onClick={() => findNext(true)}>Previous</button><button type="button" className="de-btn ghost" onClick={() => findNext()}>Next</button><button type="button" className="de-btn ghost" onClick={replaceOne}>Replace</button><button type="button" className="de-btn" onClick={replaceAll}>Replace all</button></div><div className="acts" style={{ marginTop: 8 }}><button type="button" className="de-btn ghost" onClick={close}>Close</button></div></div>}
            {dialog === 'count' && <><h3>Word count</h3><dl><dt>Pages</dt><dd>{pages}</dd><dt>Words</dt><dd>{counts.words}</dd><dt>Characters</dt><dd>{counts.chars}</dd><dt>Characters (no spaces)</dt><dd>{counts.charsNoSpace}</dd><dt>Reading time</dt><dd>{readMin} min</dd></dl><div className="acts"><button type="button" className="de-btn" onClick={close}>OK</button></div></>}
            {dialog === 'keys' && <><h3>Keyboard shortcuts</h3><dl>{[['Bold', 'Ctrl+B'], ['Italic', 'Ctrl+I'], ['Underline', 'Ctrl+U'], ['Undo / Redo', 'Ctrl+Z / Ctrl+Y'], ['Insert link', 'Ctrl+K'], ['Find and replace', 'Ctrl+H'], ['Save a version', 'Ctrl+S'], ['Print', 'Ctrl+P']].map(([a, b]) => [<dt key={a}>{a}</dt>, <dd key={b}>{b}</dd>])}</dl><div className="acts"><button type="button" className="de-btn" onClick={close}>Close</button></div></>}
            {dialog === 'goal' && <form onSubmit={(e) => { e.preventDefault(); setPref({ goal: Number(form.goal) || 0 }); close(); }}><h3>Word goal</h3><label htmlFor="d-g">Words to write (empty for no goal)</label><input id="d-g" className="gd-input" type="number" min="0" autoFocus value={form.goal ?? ''} onChange={(e) => setForm({ goal: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Save</button></div></form>}
            {dialog === 'limit' && <form onSubmit={(e) => { e.preventDefault(); setPref({ min: Number(form.min) || 0, max: Number(form.max) || 0 }); close(); }}><h3>Word limit</h3><label htmlFor="d-mn">Minimum words</label><input id="d-mn" className="gd-input" type="number" min="0" autoFocus value={form.min ?? ''} onChange={(e) => setForm({ ...form, min: e.target.value })} /><label htmlFor="d-mx">Maximum words</label><input id="d-mx" className="gd-input" type="number" min="0" value={form.max ?? ''} onChange={(e) => setForm({ ...form, max: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Save</button></div></form>}
            {dialog === 'page' && <form onSubmit={(e) => { e.preventDefault(); setPref({ size: form.size, margin: form.margin, dark: !!form.dark }); close(); }}><h3>Page setup</h3><label htmlFor="d-sz">Paper size</label><select id="d-sz" className="gd-input" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}><option value="A4">A4</option><option value="Letter">Letter</option></select><label htmlFor="d-mg">Margins</label><select id="d-mg" className="gd-input" value={form.margin} onChange={(e) => setForm({ ...form, margin: e.target.value })}><option value="normal">Normal (2.5 cm)</option><option value="narrow">Narrow (1.3 cm)</option><option value="wide">Wide (3.4 cm)</option></select>{!school && <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={!!form.dark} onChange={(e) => setForm({ ...form, dark: e.target.checked })} style={{ width: 'auto' }} />Dark page</label>}<div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">OK</button></div></form>}
            {dialog === 'hf' && <form onSubmit={(e) => { e.preventDefault(); setPref({ header: !!form.header, footer: !!form.footer, headerText: form.headerText || '', footerText: form.footerText || '' }); close(); }}><h3>Header and footer</h3><label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={!!form.header} onChange={(e) => setForm({ ...form, header: e.target.checked })} style={{ width: 'auto' }} />Show header</label><input className="gd-input" aria-label="Header text" value={form.headerText || ''} onChange={(e) => setForm({ ...form, headerText: e.target.value })} /><label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={!!form.footer} onChange={(e) => setForm({ ...form, footer: e.target.checked })} style={{ width: 'auto' }} />Show footer with page numbers</label><input className="gd-input" aria-label="Footer text" placeholder="Footer text (optional)" value={form.footerText || ''} onChange={(e) => setForm({ ...form, footerText: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Cancel</button><button type="submit" className="de-btn">Apply</button></div></form>}
            {dialog === 'share' && <><h3>Share</h3><p className="de-msg" style={{ marginTop: 0 }}>Share a copy of this document.</p><div className="acts" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}><button type="button" className="de-btn ghost" onClick={() => { navigator.clipboard && navigator.clipboard.writeText(edRef.current.innerText); setMsg('Text copied.'); }}>Copy text</button><button type="button" className="de-btn ghost" onClick={() => download(`${fileName}.html`, 'text/html', edRef.current.innerHTML)}>Download HTML</button><button type="button" className="de-btn ghost" onClick={() => download(`${fileName}.txt`, 'text/plain', edRef.current.innerText)}>Download text</button></div>{msg && <p className="de-msg" role="status">{msg}</p>}<div className="gd-row" style={{ marginTop: 14 }}><span className="g">Publish to the Community forum<small>{fee.finalCost} Credits, +{fee.earnedExp} EXP</small></span><button type="button" className="de-btn" onClick={() => { close(); onPublish(); }}>Publish</button></div><div className="acts"><button type="button" className="de-btn ghost" onClick={close}>Done</button></div></>}
          </div>
        </div>
      )}
    </div>
  );
}
