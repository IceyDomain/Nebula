import { useEffect, useState } from 'react';
import { calculatePublishingFee } from '../utils/publishingRates';

const TEMPLATES = ['Blank document', 'Resume', 'Letter', 'Project Proposal'];
const PREMIUM_TEMPLATE_CONTENT = {
  'Formal Letter': 'Dear [Recipient],\n\n[Write your message here.]\n\nSincerely,\n[Your name]',
  'Resume Pro': 'PROFESSIONAL SUMMARY\n[Briefly describe your experience and goals.]\n\nEXPERIENCE\n[Role] | [Organization] | [Dates]\n[Key responsibility or achievement]\n\nEDUCATION\n[Qualification] | [Institution] | [Year]\n\nSKILLS\n[Relevant skills]',
  'Project Proposal Pro': 'PROJECT PROPOSAL\n\nObjective\n[Describe the problem and intended outcome.]\n\nPlan\n[List the steps, resources, and timeline.]\n\nExpected Results\n[Describe measurable outcomes.]\n\nBudget\n[List estimated costs.]',
};

export const getDocsKey = (username) => `nebula_docs_${username || 'guest'}`;

function readDocuments(username) {
  try {
    const documents = JSON.parse(localStorage.getItem(getDocsKey(username)) || '[]');
    return Array.isArray(documents) ? documents : [];
  } catch {
    return [];
  }
}

export default function NebulaDocs({ credits, user, onPublish, onUpdateCredits, onEditorStateChange, theme = 'nebula' }) {
  const username = user?.username;
  const docsKey = getDocsKey(username);
  const [userDocs, setUserDocs] = useState(() => readDocuments(username));
  const [activeDocId, setActiveDocId] = useState(null);
  const [docTitle, setDocTitle] = useState('Untitled Document');
  const [docText, setDocText] = useState('');
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [query, setQuery] = useState('');
  const wordCount = docText.trim() ? docText.trim().split(/\s+/).length : 0;
  const publishingFee = calculatePublishingFee(docText, user?.tier);
  const currentExp = user?.exp || 0;
  const availableTemplates = [
    ...TEMPLATES,
    ...Object.keys(PREMIUM_TEMPLATE_CONTENT).filter((template) => user?.unlockedTemplates?.includes(template)),
  ];

  useEffect(() => {
    setUserDocs(readDocuments(username));
    setActiveDocId(null);
    onEditorStateChange?.(false);
  }, [docsKey, onEditorStateChange, username]);

  const saveDocuments = (documents) => {
    setUserDocs(documents);
    localStorage.setItem(docsKey, JSON.stringify(documents));
  };

  const openDocument = (document) => {
    setActiveDocId(document.id);
    setDocTitle(document.title);
    setDocText(document.text);
    onEditorStateChange?.(true);
  };

  const closeEditor = () => {
    setActiveDocId(null);
    onEditorStateChange?.(false);
  };

  const createDocument = (template = 'Blank document') => {
    const document = {
      id: Date.now(),
      title: template === 'Blank document' ? 'Untitled Document' : template,
      text: PREMIUM_TEMPLATE_CONTENT[template] || '',
      updatedAt: new Date().toLocaleDateString(),
    };
    saveDocuments([document, ...userDocs]);
    openDocument(document);
  };

  const autoSave = (text, title) => {
    setDocText(text);
    setDocTitle(title);
    saveDocuments(userDocs.map((document) => document.id === activeDocId ? { ...document, title: title || 'Untitled Document', text, updatedAt: new Date().toLocaleDateString() } : document));
  };

  const handlePublish = () => {
    if (!docText.trim()) return alert('Cannot publish an empty document.');
    if (credits < publishingFee.finalCost) return alert(`Not enough credits. You need ${publishingFee.finalCost} credits.`);
    onUpdateCredits(credits - publishingFee.finalCost, currentExp + publishingFee.earnedExp);
    onPublish({ id: Date.now(), title: docTitle || 'Untitled Document', text: docText, words: wordCount, creditCost: publishingFee.finalCost, earnedExp: publishingFee.earnedExp, date: new Date().toLocaleDateString() });
    setDocTitle('Untitled Document');
    setDocText('');
  };

  if (activeDocId === null) {
    const visibleDocs = userDocs.filter((document) => `${document.title} ${document.text}`.toLowerCase().includes(query.toLowerCase()));
    return (
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div className="nd-crumb">{theme === 'ardenne' ? 'Portal' : 'Nebula'} / <span>Notes & Docs</span></div>
          <h1 className="nd-ttl">Notes & Docs</h1>
          <p className="nd-sub">Write, save and publish your notes.</p>
        </div>
        <div>
          <h2 className="nd-sec">Start a new document</h2>
          <div className="nd-g4">
            {availableTemplates.map((label) => (
              <button type="button" className="nd-tile" key={label} onClick={() => createDocument(label)}>
                <div className={`nd-paper ${label === 'Blank document' ? 'blank' : ''}`}>{label === 'Blank document' ? '+' : null}</div>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <h2 className="nd-sec" style={{ margin: 0, border: 0, padding: 0 }}>Recent documents</h2>
            {userDocs.length > 0 && <input className="nd-inp" style={{ maxWidth: 280 }} aria-label="Search documents" placeholder="Search documents" value={query} onChange={(event) => setQuery(event.target.value)} />}
          </div>
          {userDocs.length === 0 ? (
            <div className="nd-empty"><b>No text documents yet</b>Select a blank document or choose a template above to get started.</div>
          ) : visibleDocs.length === 0 ? (
            <div className="nd-empty"><b>No documents match your search</b></div>
          ) : (
            <div className="nd-g4">
              {visibleDocs.map((document) => (
                <button type="button" className="nd-tile" key={document.id} onClick={() => openDocument(document)}>
                  <div className="nd-paper" style={{ alignItems: 'flex-start', justifyContent: 'flex-start', padding: 10, fontSize: 11, textAlign: 'left', overflow: 'hidden' }}>{document.text ? `${document.text.substring(0, 80)}...` : 'Empty document'}</div>
                  {document.title}
                  <small>Opened {document.updatedAt}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="nd-docs-editor">
      <div className="nd-docs-head">
        <div className="nd-docs-row">
          <button type="button" className="nd-btn sm ghost" onClick={closeEditor}>← Docs Home</button>
          <input className="nd-inp" aria-label="Document title" value={docTitle} onChange={(event) => autoSave(docText, event.target.value)} />
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>{wordCount} words ({publishingFee.finalCost} Credits, +{publishingFee.earnedExp} EXP)</span>
          <button type="button" className="nd-btn" onClick={handlePublish}>Share / Publish</button>
        </div>
        <div className="nd-menubar" aria-hidden="true"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Help</span></div>
        <div className="nd-fmt" aria-label="Formatting toolbar">
          <select className="nd-inp" aria-label="Font family" value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}><option value="sans-serif">Sans Serif</option><option value="serif">Serif</option><option value="monospace">Monospace</option><option value="cursive">Cursive</option></select>
          <select className="nd-inp" aria-label="Font size" value={fontSize} onChange={(event) => setFontSize(event.target.value)}>{['12px', '14px', '16px', '18px', '24px'].map((size) => <option key={size} value={size}>{parseInt(size, 10)}</option>)}</select>
          <button type="button" className={`nd-tool ${isBold ? 'active' : ''}`} aria-label="Bold" aria-pressed={isBold} onClick={() => setIsBold(!isBold)}><b>B</b></button>
          <button type="button" className={`nd-tool ${isItalic ? 'active' : ''}`} aria-label="Italic" aria-pressed={isItalic} onClick={() => setIsItalic(!isItalic)}><i>I</i></button>
          <button type="button" className={`nd-tool ${isUnderline ? 'active' : ''}`} aria-label="Underline" aria-pressed={isUnderline} onClick={() => setIsUnderline(!isUnderline)}><u>U</u></button>
          {['left', 'center', 'right'].map((align) => <button type="button" key={align} className={`nd-tool ${textAlign === align ? 'active' : ''}`} aria-label={`Align ${align}`} aria-pressed={textAlign === align} onClick={() => setTextAlign(align)}>{align === 'left' ? '⇤' : align === 'center' ? '↔' : '⇥'}</button>)}
        </div>
      </div>
      <div className="nd-page-wrap">
        <div className="nd-page">
          <textarea aria-label="Document editor" placeholder="Type your notes here..." value={docText} onChange={(event) => autoSave(event.target.value, docTitle)} style={{ fontSize, fontFamily, textAlign, fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textDecoration: isUnderline ? 'underline' : 'none' }} />
        </div>
      </div>
    </section>
  );
}
