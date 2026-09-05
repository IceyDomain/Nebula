import { useEffect, useState } from 'react';
import { calculatePublishingFee } from '../utils/publishingRates';

const TEMPLATES = [
  ['Blank document', 'blank-card'],
  ['Resume', 'resume-preview'],
  ['Letter', 'letter-preview'],
  ['Project Proposal', 'proposal-preview'],
];

export const getDocsKey = (username) => `nebula_docs_${username || 'guest'}`;

function readDocuments(username) {
  try {
    const documents = JSON.parse(localStorage.getItem(getDocsKey(username)) || '[]');
    return Array.isArray(documents) ? documents : [];
  } catch {
    return [];
  }
}

export default function NebulaDocs({ credits, user, onPublish, onUpdateCredits, onEditorStateChange }) {
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
  const wordCount = docText.trim() ? docText.trim().split(/\s+/).length : 0;
  const publishingFee = calculatePublishingFee(docText, user?.tier);
  const currentExp = user?.exp || 0;

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
    const document = { id: Date.now(), title: template === 'Blank document' ? 'Untitled Document' : template, text: '', updatedAt: new Date().toLocaleDateString() };
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
    return (
      <section className="docs-home-container">
        <section className="template-section">
          <div className="section-header"><h3>Start a new document</h3></div>
          <div className="template-grid">
            {TEMPLATES.map(([label, className]) => <button type="button" className={`template-card ${className}`} key={label} onClick={() => createDocument(label)}>{className === 'blank-card' ? <span className="plus-icon">+</span> : <span className="template-preview" aria-hidden="true" />}<span>{label}</span></button>)}
          </div>
        </section>
        <section className="recent-docs-section">
          <div className="section-header"><h3>Recent documents</h3></div>
          {userDocs.length === 0 ? <div className="empty-docs-box"><p>No text documents yet</p><span>Select a blank document or choose a template above to get started</span></div> : <div className="recent-docs-grid">{userDocs.map((document) => <button type="button" className="doc-tile" key={document.id} onClick={() => openDocument(document)}><span className="doc-tile-preview">{document.text ? `${document.text.substring(0, 80)}...` : 'Empty document'}</span><span className="doc-tile-info"><strong className="doc-tile-title">📄 {document.title}</strong><small className="doc-tile-date">Opened {document.updatedAt}</small></span></button>)}</div>}
        </section>
      </section>
    );
  }

  return (
    <section className="gdocs-full-page-editor">
      <div className="gdocs-header">
        <div className="gdocs-title-row"><button type="button" className="back-home-btn" onClick={closeEditor}>← Docs Home</button><span className="gdocs-doc-icon" aria-hidden="true">📄</span><input className="gdocs-title-input" aria-label="Document title" value={docTitle} onChange={(event) => autoSave(docText, event.target.value)} /><div className="gdocs-actions"><span className="gdocs-word-badge">{wordCount} words ({publishingFee.finalCost} Credits, +{publishingFee.earnedExp} EXP)</span><button type="button" className="gdocs-share-btn" onClick={handlePublish}>🚀 Share / Publish</button></div></div>
        <div className="gdocs-menu-bar" aria-label="Document menus"><span>File</span><span>Edit</span><span>View</span><span>Insert</span><span>Format</span><span>Tools</span><span>Help</span></div>
        <div className="gdocs-toolbar" aria-label="Formatting toolbar"><select aria-label="Font family" value={fontFamily} onChange={(event) => setFontFamily(event.target.value)}><option value="sans-serif">Sans Serif</option><option value="serif">Serif</option><option value="monospace">Monospace</option><option value="cursive">Cursive</option></select><select aria-label="Font size" value={fontSize} onChange={(event) => setFontSize(event.target.value)}><option value="12px">12</option><option value="14px">14</option><option value="16px">16</option><option value="18px">18</option><option value="24px">24</option></select><div className="toolbar-divider" /><button type="button" className={`tool-btn ${isBold ? 'active' : ''}`} aria-label="Bold" onClick={() => setIsBold(!isBold)}><b>B</b></button><button type="button" className={`tool-btn ${isItalic ? 'active' : ''}`} aria-label="Italic" onClick={() => setIsItalic(!isItalic)}><i>I</i></button><button type="button" className={`tool-btn ${isUnderline ? 'active' : ''}`} aria-label="Underline" onClick={() => setIsUnderline(!isUnderline)}><u>U</u></button><div className="toolbar-divider" /><button type="button" className={`tool-btn ${textAlign === 'left' ? 'active' : ''}`} aria-label="Align left" onClick={() => setTextAlign('left')}>≡</button><button type="button" className={`tool-btn ${textAlign === 'center' ? 'active' : ''}`} aria-label="Align center" onClick={() => setTextAlign('center')}>☵</button><button type="button" className={`tool-btn ${textAlign === 'right' ? 'active' : ''}`} aria-label="Align right" onClick={() => setTextAlign('right')}>≡</button></div>
      </div>
      <div className="gdocs-page-wrapper"><div className="gdocs-document-page"><textarea className="gdocs-textarea" aria-label="Document editor" placeholder="Type your notes here..." value={docText} onChange={(event) => autoSave(event.target.value, docTitle)} style={{ fontSize, fontFamily, textAlign, fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal', textDecoration: isUnderline ? 'underline' : 'none' }} /></div></div>
    </section>
  );
}
