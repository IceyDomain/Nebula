import { useState } from 'react';

export default function SharedDashboard({ publishedNotes, setPublishedNotes, currentUser }) {
  const [postText, setPostText] = useState('');
  const CHAR_LIMIT = 500;

  const handleCreatePost = () => {
    if (!postText.trim()) return alert('Post content cannot be empty.');
    const newPost = { id: Date.now(), author: currentUser || 'Anonymous', title: 'Community Post', text: postText, words: postText.trim().split(/\s+/).length, date: new Date().toLocaleDateString() };
    const updatedNotes = [newPost, ...publishedNotes];
    setPublishedNotes(updatedNotes);
    localStorage.setItem('nebula_published_notes', JSON.stringify(updatedNotes));
    setPostText('');
  };

  const handleDeletePost = (id) => {
    const updatedNotes = publishedNotes.filter((post) => post.id !== id);
    setPublishedNotes(updatedNotes);
    localStorage.setItem('nebula_published_notes', JSON.stringify(updatedNotes));
  };

  return (
    <section className="shared-dashboard">
      <div className="page-heading"><h2>Shared Community</h2><p className="subtext">Explore notes and posts published by the Nebula community.</p></div>
      <div className="community-composer"><textarea aria-label="Community post" placeholder="Share something with the community..." value={postText} maxLength={CHAR_LIMIT} onChange={(event) => setPostText(event.target.value)} /><div className="composer-footer"><span className={`char-counter ${postText.length >= CHAR_LIMIT ? 'limit-reached' : ''}`}>{postText.length} / {CHAR_LIMIT} characters</span><button type="button" className="post-btn" onClick={handleCreatePost}>Post to Community</button></div></div>
      {publishedNotes.length === 0 ? <div className="workspace-panel"><p>No community posts yet. Be the first to publish.</p></div> : <div className="shared-notes">{publishedNotes.map((post) => <article className="workspace-panel community-card" key={post.id}><div className="card-header"><div><h3>{post.title}</h3><span className="author-tag">By @{post.author || 'Anonymous'} · {post.date}</span></div>{post.author === currentUser && <button type="button" className="delete-btn" onClick={() => handleDeletePost(post.id)}>🗑️ Delete</button>}</div><p>{post.text}</p><small>{post.words || 0} words</small></article>)}</div>}
    </section>
  );
}
