import { useEffect, useMemo, useState } from 'react';
import { calculatePublishingFee } from '../utils/publishingRates';

const NEBULA_CATEGORIES = [
  { name: 'Quantum Mathematics', color: '#a855f7', desc: 'Calculus, Functions, Algebra & Logic problems.', topics: 128 },
  { name: 'Astro Physics', color: '#38bdf8', desc: 'Kinematics, Thermodynamics, and Space Systems.', topics: 94 },
  { name: 'Computer Science', color: '#2dd4bf', desc: 'Algorithms, Web Portals, React & Code Snippets.', topics: 312 },
  { name: 'General Discussion', color: '#facc15', desc: 'Study tips, social hub, and casual study lounge.', topics: 540 },
];
const DEFAULT_TOPICS = [
  { id: 1, title: 'Auburn Rebooted Devlog & Poll', category: 'Computer Science', author: 'Spike', tier: 'Gold', repliesCount: 3, views: '2.1k', lastActivity: '1h', createdAt: 1, content: 'Here is the latest preview of the boss fight mechanics. Vote below on which boss style we should code next.', poll: { question: 'Which boss mechanic should we implement?', options: [{ id: 'opt1', text: 'Bullet Hell', votes: 1 }, { id: 'opt2', text: 'Peyton Chases You', votes: 0 }, { id: 'opt3', text: 'Street Fighter Style', votes: 2 }] }, replies: [] },
  { id: 2, title: 'Tips for mastering 3D Orbital Mechanics', category: 'Astro Physics', author: 'AstraStudent', tier: 'Diamond', repliesCount: 42, views: '1.2k', lastActivity: '12m', createdAt: 2, content: 'Orbital velocity calculations get much simpler when breaking vectors into state matrices.', replies: [] },
  { id: 3, title: 'React Hooks State Leak Solution', category: 'Computer Science', author: 'CosmicCoder', tier: 'Diamond', repliesCount: 19, views: '850', lastActivity: '45m', createdAt: 3, content: 'A discussion about isolating state between signed-in accounts.', replies: [] },
];

function normalizeTopic(topic) {
  return { ...topic, title: topic.title || 'Community Topic', content: topic.content || topic.text || '', category: topic.category || 'General Discussion', author: String(topic.author || 'Anonymous'), tier: topic.tier || 'Basic', repliesCount: Number(topic.repliesCount ?? topic.replies) || 0, views: topic.views || '1', lastActivity: topic.lastActivity || 'Just now', createdAt: topic.createdAt || topic.id || Date.now(), replies: Array.isArray(topic.replies) ? topic.replies : [] };
}

function readTopics(storageKey, publishedNotes, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(saved)) return saved.map(normalizeTopic);
  } catch {
    // Use existing notes when forum storage is invalid.
  }
  return publishedNotes.length ? publishedNotes.map(normalizeTopic) : fallback;
}

// theme="ardenne" starts with an empty forum (no sample topics, no categories).
// storageKey keeps each organization's forum separate, e.g. "nebula_forum_topics_ardenne".
export default function SharedDashboard({ publishedNotes = [], user, currentUser, onPublishTransaction, theme = 'nebula', storageKey = 'nebula_forum_topics' }) {
  const isSchool = theme === 'ardenne';
  const categories = isSchool ? [] : NEBULA_CATEGORIES;
  const categoryNames = categories.length ? categories.map((item) => item.name) : ['General Discussion'];

  const [activeTab, setActiveTab] = useState('Categories');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categoryNames[categoryNames.length - 1]);
  const [replyText, setReplyText] = useState('');
  const [topics, setTopics] = useState(() => readTopics(storageKey, publishedNotes, isSchool ? [] : DEFAULT_TOPICS));
  const [pollSelections, setPollSelections] = useState({});
  const [votedPolls, setVotedPolls] = useState({});
  const [likedReplies, setLikedReplies] = useState([]);
  const author = user?.username || currentUser || 'Anonymous';
  const fee = calculatePublishingFee(content, user?.tier);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) || null;

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(topics)); }, [topics, storageKey]);

  const filteredTopics = useMemo(() => topics.filter((topic) => `${topic.title} ${topic.category} ${topic.author} ${topic.content}`.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, topics]);
  const displayedTopics = useMemo(() => {
    if (activeTab === 'Top') return [...filteredTopics].sort((left, right) => right.repliesCount - left.repliesCount);
    if (activeTab === 'Latest') return [...filteredTopics].sort((left, right) => right.createdAt - left.createdAt);
    return filteredTopics;
  }, [activeTab, filteredTopics]);

  const createTopic = (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if ((user?.credits || 0) < fee.finalCost) return alert(`You need ${fee.finalCost} Credits to post this topic.`);
    if (onPublishTransaction && !onPublishTransaction(fee)) return;
    const topic = normalizeTopic({ id: Date.now(), title: title.trim(), content: content.trim(), category, author, tier: user?.tier || 'Basic', createdAt: Date.now(), creditCost: fee.finalCost, earnedExp: fee.earnedExp });
    setTopics([topic, ...topics]); setTitle(''); setContent(''); setShowNewTopicModal(false);
  };

  const openTopic = (topic) => {
    setSelectedTopicId(topic.id);
    const viewCount = Number(topic.views);
    if (Number.isFinite(viewCount)) setTopics(topics.map((item) => item.id === topic.id ? { ...item, views: String(viewCount + 1) } : item));
  };
  const votePoll = () => {
    const optionId = pollSelections[selectedTopic.id];
    if (!optionId || votedPolls[selectedTopic.id]) return;
    setTopics(topics.map((topic) => topic.id === selectedTopic.id ? { ...topic, poll: { ...topic.poll, options: topic.poll.options.map((option) => option.id === optionId ? { ...option, votes: option.votes + 1 } : option) } } : topic));
    setVotedPolls({ ...votedPolls, [selectedTopic.id]: true });
  };
  const likeReply = (replyId) => {
    const key = `${selectedTopic.id}:${replyId}`;
    if (likedReplies.includes(key)) return;
    setLikedReplies([...likedReplies, key]);
    setTopics(topics.map((topic) => topic.id === selectedTopic.id ? { ...topic, replies: topic.replies.map((reply) => reply.id === replyId ? { ...reply, likes: (reply.likes || 0) + 1 } : reply) } : topic));
  };
  const addReply = (event) => {
    event.preventDefault();
    if (!replyText.trim()) return;
    const reply = { id: Date.now(), author, tier: user?.tier || 'Basic', text: replyText.trim(), likes: 0 };
    setTopics(topics.map((topic) => topic.id === selectedTopic.id ? { ...topic, replies: [...topic.replies, reply], repliesCount: topic.repliesCount + 1, lastActivity: 'Just now' } : topic));
    setReplyText('');
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="nd-crumb">{isSchool ? 'Portal' : 'Nebula'} / <span>Community</span></div>
        <h1 className="nd-ttl">Community Forum</h1>
        <p className="nd-sub">Discuss course concepts, collaborate on projects and share study docs.</p>
      </div>

      {selectedTopic ? (
        <div className="nd-card nd-thread">
          <div><button type="button" className="nd-btn sm ghost" onClick={() => setSelectedTopicId(null)}>Back to discussions</button></div>
          <div>
            <h2 style={{ margin: 0, font: '800 24px var(--head)' }}>{selectedTopic.title}</h2>
            <div style={{ marginTop: 8 }}><span className="nd-cat">{selectedTopic.category}</span><small style={{ color: 'var(--muted)' }}>Posted by @{selectedTopic.author}</small></div>
          </div>
          <p style={{ color: 'var(--text)', fontSize: 16 }}>{selectedTopic.content}</p>
          {selectedTopic.poll && (
            <div className="nd-card nd-poll">
              <h3>Poll: {selectedTopic.poll.question}</h3>
              {votedPolls[selectedTopic.id] ? (
                selectedTopic.poll.options.map((option) => <div className="nd-poll-row" key={option.id}><span>{option.text}</span><span>{option.votes} votes</span></div>)
              ) : (
                <>
                  {selectedTopic.poll.options.map((option) => (
                    <label key={option.id}><input type="radio" name={`poll-${selectedTopic.id}`} checked={pollSelections[selectedTopic.id] === option.id} onChange={() => setPollSelections({ ...pollSelections, [selectedTopic.id]: option.id })} />{option.text}</label>
                  ))}
                  <button type="button" className="nd-btn sm" disabled={!pollSelections[selectedTopic.id]} onClick={votePoll}>Vote</button>
                </>
              )}
            </div>
          )}
          <div>
            <h3 style={{ margin: '0 0 6px', font: '700 17px var(--head)' }}>Replies ({selectedTopic.replies.length})</h3>
            {selectedTopic.replies.map((reply) => {
              const key = `${selectedTopic.id}:${reply.id}`;
              return (
                <article className="nd-reply" key={reply.id}>
                  <span className="nd-avatar-s">{String(reply.author || 'U').charAt(0).toUpperCase()}</span>
                  <div>
                    <b>@{reply.author || 'Anonymous'}</b> <span className="nd-cat">{reply.tier || 'Basic'}</span>
                    <p>{reply.text}</p>
                    <button type="button" className="nd-btn sm ghost" disabled={likedReplies.includes(key)} onClick={() => likeReply(reply.id)}>Like ({reply.likes || 0})</button>
                  </div>
                </article>
              );
            })}
            <form onSubmit={addReply} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
              <textarea className="nd-inp" rows="3" aria-label="Reply to topic" placeholder="Join the discussion..." value={replyText} onChange={(event) => setReplyText(event.target.value)} required />
              <div><button type="submit" className="nd-btn">Reply</button></div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="nd-toolbar">
            <input className="nd-inp" style={{ maxWidth: 380 }} aria-label="Search topics, tags, or authors" placeholder="Search topics, tags, or authors" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            <div className="nd-tabs" style={{ flex: 1 }}>
              {['Categories', 'Latest', 'Top'].map((tab) => <button type="button" key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>{tab}</button>)}
            </div>
            <button type="button" className="nd-btn" onClick={() => setShowNewTopicModal(true)}>+ New Topic</button>
          </div>

          <div className="nd-cols">
            <div className="nd-card">
              <h3>Categories</h3>
              {categories.length === 0 ? (
                <p>No categories have been created.</p>
              ) : categories.map((item) => (
                <p key={item.name} style={{ marginTop: 12 }}><span className="nd-dot" style={{ background: item.color }} /><b style={{ color: 'var(--text)' }}>{item.name}</b><br />{item.desc} {item.topics} topics</p>
              ))}
            </div>
            <div className="nd-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px' }}><h3 style={{ margin: 0 }}>Discussions</h3></div>
              <div className="nd-row h"><span>Topic</span><span>Posters</span><span>Replies</span><span>Views</span><span>Activity</span></div>
              {displayedTopics.length === 0 ? (
                <div className="nd-empty" style={{ border: 0, borderTop: '1px solid var(--line)', borderRadius: 0 }}>
                  <b>{topics.length === 0 ? 'No discussions yet' : 'No topics match your search'}</b>
                  {topics.length === 0 ? 'Topics posted by students and staff will appear here.' : 'Try a different search.'}
                </div>
              ) : displayedTopics.map((topic) => (
                <button type="button" className="nd-row" key={topic.id} onClick={() => openTopic(topic)}>
                  <div><h4>{topic.title}</h4><span className="nd-cat">{topic.category}</span><small>@{topic.author}</small></div>
                  <span><span className="nd-avatar-s">{topic.author.charAt(0).toUpperCase()}</span></span>
                  <span>{topic.repliesCount}</span><span>{topic.views}</span><span>{topic.lastActivity}</span>
                </button>
              ))}
              <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', fontSize: 13, color: 'var(--muted)' }}>Showing {displayedTopics.length} of {topics.length} topics</div>
            </div>
          </div>
        </>
      )}

      {showNewTopicModal && (
        <div className="nd-modal-back" onClick={() => setShowNewTopicModal(false)}>
          <div className="nd-modal" role="dialog" aria-modal="true" aria-label="Create a new topic" onClick={(event) => event.stopPropagation()}>
            <h3>Create a New Topic</h3>
            <form onSubmit={createTopic}>
              <input className="nd-inp" placeholder="Topic title" value={title} onChange={(event) => setTitle(event.target.value)} required />
              {categories.length > 0 && (
                <select className="nd-inp" aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
                  {categoryNames.map((name) => <option key={name}>{name}</option>)}
                </select>
              )}
              <textarea className="nd-inp" rows="6" placeholder="Type your post..." value={content} onChange={(event) => setContent(event.target.value)} required />
              <div className="nd-modal-actions" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: '#a8a3bd' }}>Cost: <strong style={{ color: '#f2f0fa' }}>{fee.finalCost} Credits</strong> (+{fee.earnedExp} EXP)</span>
                <span style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="nd-btn ghost" onClick={() => setShowNewTopicModal(false)}>Cancel</button>
                  <button type="submit" className="nd-btn">Post Topic</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
