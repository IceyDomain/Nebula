import { sanitizeDocumentHtml } from '../utils/sanitizeDocumentHtml';

export default function CommunityDocument({ topic }) {
  if (!topic.documentHtml) {
    return <p style={{ color: 'var(--text)', fontSize: 16 }}>{topic.content}</p>;
  }

  return (
    <article className="nd-card" aria-label={`Shared document: ${topic.title}`} style={{ background: '#fff', color: '#111827', overflow: 'auto', maxHeight: '70vh' }}>
      <div style={{ maxWidth: 816, minHeight: 200, margin: '0 auto', padding: 32 }}>
        <div dangerouslySetInnerHTML={{ __html: sanitizeDocumentHtml(topic.documentHtml) }} />
      </div>
    </article>
  );
}
