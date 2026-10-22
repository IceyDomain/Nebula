// Shared engine for the Nebula and Ardenne document editors (rich text, menus, toolbar, dialogs).
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
const IC = {
  undo: 'M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3', redo: 'M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3',
  print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z', link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  ul: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01', ol: 'M10 6h10M10 12h10M10 18h10M4 5h1v4M4 13h2l-2 3h2',
  indent: 'M3 6h18M11 12h10M11 18h10M3 9l3 3-3 3', outdent: 'M3 6h18M11 12h10M11 18h10M6 9l-3 3 3 3',
  left: 'M3 6h18M3 12h12M3 18h16', center: 'M3 6h18M6 12h12M4 18h16', right: 'M3 6h18M9 12h12M5 18h16', full: 'M3 6h18M3 12h18M3 18h18',
  clear: 'M5 5l14 14M9 4h10M12 4L9 13M8 20h8',
};
const Icon = ({ n }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={IC[n]} /></svg>;

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const textToHtml = (text) => (text ? text.split('\n').map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('') : '<p><br></p>');
export const htmlToText = (html) => {
  const box = document.createElement('div');
  box.innerHTML = html.replace(/<\/(p|div|h[1-6]|li|tr|blockquote)>|<br\s*\/?>/gi, '\n');
  return (box.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
};

export const PREMIUM_TEMPLATE_CONTENT = {
  'Formal Letter': 'Dear [Recipient],\n\n[Write your message here.]\n\nSincerely,\n[Your name]',
  'Resume Pro': 'PROFESSIONAL SUMMARY\n[Briefly describe your experience and goals.]\n\nEXPERIENCE\n[Role] | [Organization] | [Dates]\n[Key responsibility or achievement]\n\nEDUCATION\n[Qualification] | [Institution] | [Year]\n\nSKILLS\n[Relevant skills]',
  'Project Proposal Pro': 'PROJECT PROPOSAL\n\nObjective\n[Describe the problem and intended outcome.]\n\nPlan\n[List the steps, resources, and timeline.]\n\nExpected Results\n[Describe measurable outcomes.]\n\nBudget\n[List estimated costs.]',
};

const CREST = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 38 44"><path d="M19 2l15 5v13c0 11-7 19-15 22C11 39 4 31 4 20V7z" fill="#1D4ED8" stroke="#F5B82E" stroke-width="2.5"/><path d="M13 31l6-16 6 16M15.5 26h7" fill="none" stroke="#F5B82E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>');
const LETTERHEAD = `<p style="text-align:center"><img src="${CREST}" width="48" height="56" alt=""></p><h1 style="text-align:center;font-size:22px;margin:4px 0">Ardenne High School</h1><p style="text-align:center;color:#555555">[School address] &nbsp;·&nbsp; [Telephone] &nbsp;·&nbsp; [Email]</p><hr><p><br></p>`;
const today = () => new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
const detailsTable = () => `<table><tbody>${['Name', 'Class / Form', 'Subject', 'Teacher'].map((k) => `<tr><td style="width:30%"><b>${k}</b></td><td><br></td></tr>`).join('')}<tr><td><b>Date</b></td><td>${today()}</td></tr></tbody></table><p><br></p>`;

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
    <div className="de-menubar" ref={ref} role="menubar">
      {menus.map((menu) => (
        <div className="de-menu" key={menu.label}>
          <button type="button" className={open === menu.label ? 'open' : ''} aria-haspopup="true" aria-expanded={open === menu.label} onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(open === menu.label ? null : menu.label)} onMouseEnter={() => open && setOpen(menu.label)}>{menu.label}</button>
          {open === menu.label && (
            <div className="de-drop" role="menu">
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

export default function DocEditorCore({ variant = 'nebula', docId, title, initialHtml, fee, onTitleChange, onChange, onBack, onPublish }) {
  const school = variant === 'ardenne';
  const edRef = useRef(null);
  const titleRef = useRef(null);
  const range = useRef(null);
  const changeRef = useRef(onChange); changeRef.current = onChange;
  const timer = useRef(null);
  const prefsKey = `nebula_doc_prefs_${variant}_${docId}`;
  const [prefs, setPrefs] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(prefsKey) || 'null'); if (saved) return saved; } catch { /* use defaults */ }
    return { size: school ? 'A4' : 'Letter', margin: 'normal', header: school, footer: school, headerText: 'Ardenne High School', footerText: '', goal: 0, min: 0, max: 0, dark: false };
  });
  const [counts, setCounts] = useState({ words: 0, chars: 0, charsNoSpace: 0 });
  const [pages, setPages] = useState(1);
  const [fmt, setFmt] = useState({});
  const [zoom, setZoom] = useState(100);
  const [size, setSize] = useState(16);
  const [dialog, setDialog] = useState(null);
  const [saved, setSaved] = useState('Saved');
  const [focus, setFocus] = useState(false);
  const [spell, setSpell] = useState(true);
  const [form, setForm] = useState({});

  useEffect(() => { try { localStorage.setItem(prefsKey, JSON.stringify(prefs)); } catch { /* ignore */ } }, [prefs, prefsKey]);
  const setPref = (patch) => setPrefs((p) => ({ ...p, ...patch }));

  const measure = () => {
    const ed = edRef.current; if (!ed) return;
    const text = ed.innerText || '';
    setCounts({ words: text.trim() ? text.trim().split(/\s+/).length : 0, chars: text.replace(/\n/g, '').length, charsNoSpace: text.replace(/\s/g, '').length });
    const ph = PAGE[prefs.size].h;
    setPages(Math.max(1, Math.ceil((ed.scrollHeight + MARGINS[prefs.margin] * 2) / ph)));
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

  useEffect(() => {
    const ed = edRef.current;
    ed.innerHTML = initialHtml || '<p><br></p>';
    try { document.execCommand('styleWithCSS', false, true); document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* ignore */ }
    measure();
    const onSel = () => {
      const sel = window.getSelection();
      if (sel.rangeCount && ed.contains(sel.anchorNode)) { range.current = sel.getRangeAt(0).cloneRange(); updateFmt(); }
    };
    document.addEventListener('selectionchange', onSel);
    return () => { document.removeEventListener('selectionchange', onSel); clearTimeout(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(measure, [prefs.size, prefs.margin]); // eslint-disable-line react-hooks/exhaustive-deps

  const restore = () => {
    const ed = edRef.current; ed.focus();
    if (range.current) { const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range.current); }
  };
  const exec = (cmd, val = null) => { restore(); try { document.execCommand(cmd, false, val); } catch { /* ignore */ } handleInput(); updateFmt(); };
  const insert = (html) => exec('insertHTML', html);
  const applySize = (px) => {
    setSize(px); restore();
    try { document.execCommand('fontSize', false, '7'); } catch { /* ignore */ }
    edRef.current.querySelectorAll('font[size="7"], span[style*="xxx-large"]').forEach((el) => {
      let target = el;
      if (el.tagName === 'FONT') { target = document.createElement('span'); while (el.firstChild) target.appendChild(el.firstChild); el.replaceWith(target); }
      target.style.fontSize = `${px}px`;
    });
    handleInput();
  };
  const stepSize = (dir) => { const i = SIZES.indexOf(size); const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, (i < 0 ? SIZES.indexOf(16) : i) + dir))]; applySize(next); };
  const setLineHeight = (v) => {
    restore(); const sel = window.getSelection(); if (!sel.rangeCount) return;
    const r = sel.getRangeAt(0);
    edRef.current.querySelectorAll('p,h1,h2,h3,h4,li,blockquote').forEach((b) => { if (r.intersectsNode(b)) b.style.lineHeight = v; });
    handleInput();
  };
  const download = (name, type, content) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); };
  const fileName = (title || 'Untitled Document').replace(/[^\w\- ]+/g, '');
  const askLink = () => { setForm({ url: 'https://' }); setDialog('link'); };
  const submitLink = (e) => {
    e.preventDefault(); setDialog(null); if (!form.url) return;
    const sel = window.getSelection();
    if (range.current && range.current.collapsed) insert(`<a href="${escapeHtml(form.url)}">${escapeHtml(form.url)}</a>`); else { void sel; exec('createLink', form.url); }
  };

  const menus = [
    { label: 'File', items: [
      { label: 'Rename', run: () => titleRef.current && titleRef.current.focus() },
      { label: 'Download as HTML', run: () => download(`${fileName}.html`, 'text/html', `<!doctype html><meta charset="utf-8"><title>${escapeHtml(title || '')}</title>${edRef.current.innerHTML}`) },
      { label: 'Download as text', run: () => download(`${fileName}.txt`, 'text/plain', edRef.current.innerText) },
      { label: 'Print', keys: 'Ctrl+P', run: () => window.print() },
      ...(school ? [{ label: 'Page setup...', run: () => { setForm({ size: prefs.size, margin: prefs.margin }); setDialog('page'); } }] : []),
      { divider: true }, { label: 'Close (back to Docs Home)', run: onBack },
    ] },
    { label: 'Edit', items: [
      { label: 'Undo', keys: 'Ctrl+Z', run: () => exec('undo') }, { label: 'Redo', keys: 'Ctrl+Y', run: () => exec('redo') }, { divider: true },
      { label: 'Cut', keys: 'Ctrl+X', run: () => exec('cut') }, { label: 'Copy', keys: 'Ctrl+C', run: () => exec('copy') }, { label: 'Select all', keys: 'Ctrl+A', run: () => exec('selectAll') },
    ] },
    { label: 'View', items: [
      ...[75, 100, 125, 150].map((z) => ({ label: `Zoom ${z}%`, checked: zoom === z, run: () => setZoom(z) })),
      ...(school ? [] : [{ divider: true }, { label: 'Focus mode', checked: focus, run: () => setFocus(!focus) }, { label: 'Dark page', checked: prefs.dark, run: () => setPref({ dark: !prefs.dark }) }]),
    ] },
    { label: 'Insert', items: [
      { label: 'Link...', keys: 'Ctrl+K', run: askLink }, { label: 'Horizontal line', run: () => insert('<hr><p><br></p>') },
      { label: 'Table (3 x 3)', run: () => insert(`<table><tbody>${'<tr><td><br></td><td><br></td><td><br></td></tr>'.repeat(3)}</tbody></table><p><br></p>`) },
      { label: 'Today\'s date', run: () => insert(today()) },
      { divider: true },
      ...(school ? [
        { label: 'School letterhead', run: () => insert(LETTERHEAD) }, { label: 'Assignment details', run: () => insert(detailsTable()) },
        { label: 'Page break', run: () => insert('<div style="page-break-after:always;border-top:1px dashed #9ca3af;margin:16px 0"></div><p><br></p>') },
      ] : [
        { label: 'Star divider', run: () => insert('<p style="text-align:center;letter-spacing:12px">✦ ✦ ✦</p>') },
        { label: 'Callout box', run: () => insert('<div class="de-callout"><b>Note</b><br>Write something here.</div><p><br></p>') },
      ]),
    ] },
    { label: 'Format', items: [
      { label: 'Bold', keys: 'Ctrl+B', run: () => exec('bold') }, { label: 'Italic', keys: 'Ctrl+I', run: () => exec('italic') }, { label: 'Underline', keys: 'Ctrl+U', run: () => exec('underline') }, { label: 'Strikethrough', run: () => exec('strikeThrough') },
      { divider: true }, { label: 'Bulleted list', run: () => exec('insertUnorderedList') }, { label: 'Numbered list', run: () => exec('insertOrderedList') },
      { divider: true }, { label: 'Clear formatting', run: () => exec('removeFormat') },
      ...(school ? [{ divider: true }, { label: 'Header and footer...', run: () => { setForm({ header: prefs.header, footer: prefs.footer, headerText: prefs.headerText, footerText: prefs.footerText }); setDialog('hf'); } }] : []),
    ] },
    { label: 'Tools', items: [
      { label: 'Word count', run: () => setDialog('count') },
      { label: 'Spelling check', checked: spell, run: () => setSpell(!spell) },
      school ? { label: 'Word limit...', run: () => { setForm({ min: prefs.min || '', max: prefs.max || '' }); setDialog('limit'); } } : { label: 'Word goal...', run: () => { setForm({ goal: prefs.goal || '' }); setDialog('goal'); } },
    ] },
    { label: 'Help', items: [{ label: 'Keyboard shortcuts', run: () => setDialog('keys') }] },
  ];

  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); range.current = window.getSelection().rangeCount ? window.getSelection().getRangeAt(0).cloneRange() : null; askLink(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); handleInput(); }
  };

  const pg = PAGE[prefs.size]; const pad = MARGINS[prefs.margin];
  const goalPct = prefs.goal ? Math.min(100, Math.round((counts.words / prefs.goal) * 100)) : 0;
  const limitState = prefs.max && counts.words > prefs.max ? 'over' : prefs.min && counts.words < prefs.min ? 'under' : 'ok';
  const tb = (n, label, on, run) => <button type="button" className={`de-tb ${on ? 'on' : ''}`} aria-label={label} title={label} aria-pressed={!!on} onMouseDown={(e) => e.preventDefault()} onClick={run}><Icon n={n} /></button>;
  const letter = (ch, label, on, run, style) => <button type="button" className={`de-tb ${on ? 'on' : ''}`} aria-label={label} title={label} aria-pressed={!!on} onMouseDown={(e) => e.preventDefault()} onClick={run} style={style}>{ch}</button>;
  const fontValue = FONTS.find((f) => fmt.font && fmt.font.toLowerCase().startsWith(f.toLowerCase())) || (school ? 'Times New Roman' : 'Arial');

  return (
    <div className={`de de-${variant}`}>
      <div className="de-top">
        <button type="button" className="de-btn ghost" onClick={onBack}>← Docs Home</button>
        <input ref={titleRef} className="de-title" aria-label="Document title" value={title} onChange={(e) => onTitleChange(e.target.value)} />
        <div className="de-meta">
          <span>{saved}</span>
          <span>{counts.words} words ({fee.finalCost} Credits, +{fee.earnedExp} EXP)</span>
          <button type="button" className="de-btn" onClick={onPublish}>Share / Publish</button>
        </div>
      </div>

      {!focus && <MenuBar menus={menus} />}
      {!focus && (
        <div className="de-toolbar" role="toolbar" aria-label="Formatting">
          {tb('undo', 'Undo', false, () => exec('undo'))}{tb('redo', 'Redo', false, () => exec('redo'))}{tb('print', 'Print', false, () => window.print())}
          <select className="de-sel" aria-label="Zoom" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}>{[50, 75, 100, 125, 150, 200].map((z) => <option key={z} value={z}>{z}%</option>)}</select>
          <span className="de-sep" />
          <select className="de-sel" aria-label="Text style" value={BLOCKS.some(([k]) => k === fmt.block) ? fmt.block : 'p'} onChange={(e) => exec('formatBlock', e.target.value)}>{BLOCKS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <select className="de-sel" aria-label="Font" value={fontValue} onChange={(e) => exec('fontName', e.target.value)}>{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
          {letter('−', 'Decrease font size', false, () => stepSize(-1))}<span className="de-size">{size}</span>{letter('+', 'Increase font size', false, () => stepSize(1))}
          <span className="de-sep" />
          {letter(<b>B</b>, 'Bold', fmt.bold, () => exec('bold'))}{letter(<i>I</i>, 'Italic', fmt.italic, () => exec('italic'))}{letter(<u>U</u>, 'Underline', fmt.underline, () => exec('underline'))}{letter(<s>S</s>, 'Strikethrough', fmt.strike, () => exec('strikeThrough'))}
          <ColorButton label="Text color" glyph={<b style={{ textDecoration: 'underline', textDecorationColor: 'var(--de-acc2)' }}>A</b>} palette={PALETTES[variant]} onPick={(c) => (c ? exec('foreColor', c) : exec('removeFormat'))} />
          <ColorButton label="Highlight color" glyph={<span style={{ background: 'var(--de-acc2)', color: '#000', padding: '0 4px', borderRadius: 3, fontWeight: 700 }}>H</span>} palette={PALETTES[variant]} onPick={(c) => exec('hiliteColor', c || 'transparent')} />
          {tb('link', 'Insert link', false, askLink)}
          <span className="de-sep" />
          {tb('ul', 'Bulleted list', fmt.ul, () => exec('insertUnorderedList'))}{tb('ol', 'Numbered list', fmt.ol, () => exec('insertOrderedList'))}{tb('outdent', 'Decrease indent', false, () => exec('outdent'))}{tb('indent', 'Increase indent', false, () => exec('indent'))}
          <span className="de-sep" />
          {tb('left', 'Align left', fmt.left, () => exec('justifyLeft'))}{tb('center', 'Align center', fmt.center, () => exec('justifyCenter'))}{tb('right', 'Align right', fmt.right, () => exec('justifyRight'))}{tb('full', 'Justify', fmt.full, () => exec('justifyFull'))}
          <select className="de-sel" aria-label="Line spacing" defaultValue="" onChange={(e) => e.target.value && setLineHeight(e.target.value)}><option value="" disabled>Spacing</option>{['1', '1.15', '1.5', '2'].map((v) => <option key={v} value={v}>{v}</option>)}</select>
          {tb('clear', 'Clear formatting', false, () => exec('removeFormat'))}
        </div>
      )}

      {focus && <button type="button" className="de-btn ghost de-exitfocus" onClick={() => setFocus(false)}>Exit focus mode</button>}

      <div className="de-canvas">
        <div className="de-zoom" style={{ zoom: zoom / 100 }}>
          <div className={`de-page ${prefs.dark ? 'dark' : ''}`} style={{ width: pg.w, minHeight: pg.h, padding: pad, '--de-ph': `${pg.h}px` }}>
            {school && prefs.header && <div className="de-hf head" contentEditable={false}><span>{prefs.headerText}</span><span>{title}</span></div>}
            <div ref={edRef} className="de-content" contentEditable suppressContentEditableWarning spellCheck={spell} role="textbox" aria-multiline="true" aria-label="Document editor" onInput={handleInput} onKeyDown={onKeyDown} style={{ fontSize: 16 }} />
            {school && prefs.footer && <div className="de-hf foot" contentEditable={false}><span>{prefs.footerText}</span><span>Page 1 of {pages}</span></div>}
          </div>
        </div>
      </div>

      <div className="de-status">
        <span>{counts.words} words</span><span>{counts.chars} characters</span><span>{pages} {pages === 1 ? 'page' : 'pages'}</span>
        {!school && prefs.goal > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Goal {counts.words} / {prefs.goal}<span className="de-progress"><i style={{ width: `${goalPct}%` }} /></span>{goalPct}%</span>}
        {school && (prefs.min > 0 || prefs.max > 0) && <span className={limitState === 'ok' ? 'de-ok' : 'de-warn'}>{limitState === 'ok' ? 'Within word limit' : limitState === 'under' ? `Below minimum (${prefs.min})` : `Over limit (${prefs.max})`}</span>}
        {school && <span style={{ marginLeft: 'auto' }}>{prefs.size} · {prefs.margin} margins</span>}
      </div>

      {dialog && (
        <div className="de-back" onMouseDown={() => setDialog(null)}>
          <div className="de-dialog" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            {dialog === 'link' && <form onSubmit={submitLink}><h3>Insert link</h3><label htmlFor="de-url">Web address</label><input id="de-url" autoFocus value={form.url || ''} onChange={(e) => setForm({ url: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="de-btn">Insert</button></div></form>}
            {dialog === 'count' && <><h3>Word count</h3><dl><dt>Words</dt><dd>{counts.words}</dd><dt>Characters</dt><dd>{counts.chars}</dd><dt>Characters (no spaces)</dt><dd>{counts.charsNoSpace}</dd><dt>Reading time</dt><dd>{Math.max(1, Math.round(counts.words / 200))} min</dd></dl><div className="acts"><button type="button" className="de-btn" onClick={() => setDialog(null)}>Close</button></div></>}
            {dialog === 'keys' && <><h3>Keyboard shortcuts</h3><dl>{[['Bold', 'Ctrl+B'], ['Italic', 'Ctrl+I'], ['Underline', 'Ctrl+U'], ['Undo', 'Ctrl+Z'], ['Redo', 'Ctrl+Y'], ['Insert link', 'Ctrl+K'], ['Save now', 'Ctrl+S'], ['Print', 'Ctrl+P']].map(([a, b]) => [<dt key={a}>{a}</dt>, <dd key={b}>{b}</dd>])}</dl><div className="acts"><button type="button" className="de-btn" onClick={() => setDialog(null)}>Close</button></div></>}
            {dialog === 'goal' && <form onSubmit={(e) => { e.preventDefault(); setPref({ goal: Number(form.goal) || 0 }); setDialog(null); }}><h3>Word goal</h3><label htmlFor="de-goal">Words to write (leave empty for no goal)</label><input id="de-goal" type="number" min="0" autoFocus value={form.goal ?? ''} onChange={(e) => setForm({ goal: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="de-btn">Save</button></div></form>}
            {dialog === 'limit' && <form onSubmit={(e) => { e.preventDefault(); setPref({ min: Number(form.min) || 0, max: Number(form.max) || 0 }); setDialog(null); }}><h3>Word limit</h3><label htmlFor="de-min">Minimum words</label><input id="de-min" type="number" min="0" autoFocus value={form.min ?? ''} onChange={(e) => setForm({ ...form, min: e.target.value })} /><label htmlFor="de-max">Maximum words</label><input id="de-max" type="number" min="0" value={form.max ?? ''} onChange={(e) => setForm({ ...form, max: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="de-btn">Save</button></div></form>}
            {dialog === 'page' && <form onSubmit={(e) => { e.preventDefault(); setPref({ size: form.size, margin: form.margin }); setDialog(null); }}><h3>Page setup</h3><label htmlFor="de-size">Paper size</label><select id="de-size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })}><option value="A4">A4</option><option value="Letter">Letter</option></select><label htmlFor="de-margin">Margins</label><select id="de-margin" value={form.margin} onChange={(e) => setForm({ ...form, margin: e.target.value })}><option value="normal">Normal (2.5 cm)</option><option value="narrow">Narrow (1.3 cm)</option><option value="wide">Wide (3.4 cm)</option></select><div className="acts"><button type="button" className="de-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="de-btn">Apply</button></div></form>}
            {dialog === 'hf' && <form onSubmit={(e) => { e.preventDefault(); setPref({ header: form.header, footer: form.footer, headerText: form.headerText, footerText: form.footerText }); setDialog(null); }}><h3>Header and footer</h3><label><input type="checkbox" style={{ width: 'auto', height: 'auto', marginRight: 8 }} checked={!!form.header} onChange={(e) => setForm({ ...form, header: e.target.checked })} />Show header</label><input aria-label="Header text" value={form.headerText || ''} onChange={(e) => setForm({ ...form, headerText: e.target.value })} /><label><input type="checkbox" style={{ width: 'auto', height: 'auto', marginRight: 8 }} checked={!!form.footer} onChange={(e) => setForm({ ...form, footer: e.target.checked })} />Show footer (with page numbers)</label><input aria-label="Footer text" placeholder="Footer text (optional)" value={form.footerText || ''} onChange={(e) => setForm({ ...form, footerText: e.target.value })} /><div className="acts"><button type="button" className="de-btn ghost" onClick={() => setDialog(null)}>Cancel</button><button type="submit" className="de-btn">Apply</button></div></form>}
          </div>
        </div>
      )}
    </div>
  );
}
