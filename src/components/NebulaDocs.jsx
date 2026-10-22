import { useEffect, useState } from 'react';
import { publishDocumentToCommunity } from '../utils/communityDocuments';
import { calculatePublishingFee } from '../utils/publishingRates';
import NebulaDocEditor from './NebulaDocEditor';
import { htmlToText, PREMIUM_TEMPLATE_CONTENT, templateHtml, textToHtml } from './DocEditorCore';

const TEMPLATES = ['Blank document', 'Resume', 'Letter', 'Project Proposal'];

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
  const [docHtml, setDocHtml] = useState('');
  const [query, setQuery] = useState('');
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
    setDocText(document.text || '');
    setDocHtml(document.html ?? textToHtml(document.text || ''));
    onEditorStateChange?.(true);
  };

  const closeEditor = () => {
    setActiveDocId(null);
    onEditorStateChange?.(false);
  };

  const createDocument = (template = 'Blank document') => {
    const html = templateHtml(template, 'nebula');
    const document = { id: Date.now(), title: template === 'Blank document' ? 'Untitled Document' : template, text: html ? htmlToText(html) : '', html, updatedAt: new Date().toLocaleDateString() };
    saveDocuments([document, ...userDocs]);
    openDocument(document);
  };

  const handleChange = ({ html, text }) => {
    setDocText(text);
    setDocHtml(html);
    saveDocuments(userDocs.map((document) => document.id === activeDocId ? { ...document, html, text, updatedAt: new Date().toLocaleDateString() } : document));
  };

  const handleTitle = (title) => {
    setDocTitle(title);
    saveDocuments(userDocs.map((document) => document.id === activeDocId ? { ...document, title: title || 'Untitled Document' } : document));
  };

  const handlePublish = async () => {
    if (!docText.trim()) return alert('Cannot publish an empty document.');
    if (credits < publishingFee.finalCost) return alert(`Not enough credits. You need ${publishingFee.finalCost} credits.`);
    const document = {
      id: Date.now(),
      title: docTitle || 'Untitled Document',
      text: docText,
      html: docHtml || textToHtml(docText),
      creditCost: publishingFee.finalCost,
      earnedExp: publishingFee.earnedExp,
      date: new Date().toLocaleDateString(),
    };
    try {
      await publishDocumentToCommunity({ document, fee: publishingFee, user, theme });
      onUpdateCredits(credits - publishingFee.finalCost, currentExp + publishingFee.earnedExp);
      onPublish(document);
      alert('Published to the Community forum.');
    } catch (error) {
      alert(`Unable to publish this document to the Community forum. ${error.message}`);
    }
  };

  if (activeDocId !== null) {
    return (
      <NebulaDocEditor
        key={activeDocId}
        docId={activeDocId}
        title={docTitle}
        initialHtml={docHtml}
        fee={publishingFee}
        onTitleChange={handleTitle}
        onChange={handleChange}
        onBack={closeEditor}
        onPublish={handlePublish}
      />
    );
  }

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
