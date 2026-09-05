import { useEffect, useMemo, useState } from 'react';
import { calculatePublishingFee } from '../utils/publishingRates';

const CATEGORIES = [
  { name: 'Quantum Mathematics', color: '#a855f7', desc: 'Calculus, Functions, Algebra & Logic problems.', topics: 128 },
  { name: 'Astro Physics', color: '#38bdf8', desc: 'Kinematics, Thermodynamics, and Space Systems.', topics: 94 },
  { name: 'Computer Science', color: '#2dd4bf', desc: 'Algorithms, Web Portals, React & Code Snippets.', topics: 312 },
  { name: 'General Discussion', color: '#f59e0b', desc: 'Study tips, social hub, and casual study lounge.', topics: 540 },
];
const DEFAULT_TOPICS = [
  { id: 1, title: 'Auburn Rebooted Devlog & Poll', category: 'Computer Science', author: 'Spike', tier: 'Gold', repliesCount: 3, views: '2.1k', lastActivity: '1h', createdAt: 1, content: 'Here is the latest preview of the boss fight mechanics. Vote below on which boss style we should code next.', poll: { question: 'Which boss mechanic should we implement?', options: [{ id: 'opt1', text: 'Bullet Hell', votes: 1 }, { id: 'opt2', text: 'Peyton Chases You', votes: 0 }, { id: 'opt3', text: 'Street Fighter Style', votes: 2 }] }, replies: [] },
  { id: 2, title: 'Tips for mastering 3D Orbital Mechanics', category: 'Astro Physics', author: 'AstraStudent', tier: 'Diamond', repliesCount: 42, views: '1.2k', lastActivity: '12m', createdAt: 2, content: 'Orbital velocity calculations get much simpler when breaking vectors into state matrices.', replies: [] },
  { id: 3, title: 'React Hooks State Leak Solution', category: 'Computer Science', author: 'CosmicCoder', tier: 'Diamond', repliesCount: 19, views: '850', lastActivity: '45m', createdAt: 3, content: 'A discussion about isolating state between signed-in accounts.', replies: [] },
];

function normalizeTopic(topic) {
  return { ...topic, title: topic.title || 'Community Topic', content: topic.content || topic.text || '', category: topic.category || 'General Discussion', author: String(topic.author || 'Anonymous'), tier: topic.tier || 'Basic', repliesCount: Number(topic.repliesCount ?? topic.replies) || 0, views: topic.views || '1', lastActivity: topic.lastActivity || 'Just now', createdAt: topic.createdAt || topic.id || Date.now(), replies: Array.isArray(topic.replies) ? topic.replies : [] };
}

function readTopics(publishedNotes) {
  try {
    const saved = JSON.parse(localStorage.getItem('nebula_forum_topics') || 'null');
    if (Array.isArray(saved)) return saved.map(normalizeTopic);
  } catch {
    // Use existing notes when forum storage is invalid.
  }
  return publishedNotes.length ? publishedNotes.map(normalizeTopic) : DEFAULT_TOPICS;
}

export default function SharedDashboard({ publishedNotes = [], user, currentUser, onPublishTransaction }) {
  const [activeTab, setActiveTab] = useState('Categories');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showForumMenu, setShowForumMenu] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General Discussion');
  const [replyText, setReplyText] = useState('');
  const [topics, setTopics] = useState(() => readTopics(publishedNotes));
  const [pollSelections, setPollSelections] = useState({});
  const [votedPolls, setVotedPolls] = useState({});
  const [likedReplies, setLikedReplies] = useState([]);
  const author = user?.username || currentUser || 'Anonymous';
  const fee = calculatePublishingFee(content, user?.tier);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) || null;

  useEffect(() => { localStorage.setItem('nebula_forum_topics', JSON.stringify(topics)); }, [topics]);

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
    setTopics([topic, ...topics]); setTitle(''); setContent(''); setCategory('General Discussion'); setShowNewTopicModal(false);
  };

  const openTopic = (topic) => { setSelectedTopicId(topic.id); setTopics(topics.map((item) => item.id === topic.id ? { ...item, views: String(Number.parseFloat(item.views) + 1) } : item)); };
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
    <section className="forum-container">
      {showWelcome && <div className="forum-welcome-banner"><button type="button" className="close-banner-btn" aria-label="Close welcome banner" onClick={() => setShowWelcome(false)}>X</button><h2>Welcome to the Nebula Community Forum</h2><p>Discuss course concepts, collaborate on projects, share study docs, and connect with fellow Nebulites.</p></div>}
      <div className="forum-header-bar"><button type="button" className="forum-menu-btn" aria-label="Open forum navigation" aria-expanded={showForumMenu} onClick={() => setShowForumMenu(!showForumMenu)}>Menu</button><div className="forum-search-box"><span aria-hidden="true">Search</span><input aria-label="Search topics, tags, or authors" placeholder="Search topics, tags, or authors..." value={searchQuery} onFocus={() => setShowSearchModal(true)} onChange={(event) => setSearchQuery(event.target.value)} /></div><button type="button" className="new-topic-btn" onClick={() => setShowNewTopicModal(true)}>New Topic</button></div>
      {showForumMenu && <nav className="forum-menu-drawer" aria-label="Forum navigation"><button type="button" onClick={() => { setActiveTab('Latest'); setShowForumMenu(false); }}>Topics</button><button type="button" onClick={() => { setActiveTab('Categories'); setShowForumMenu(false); }}>Categories</button><button type="button" onClick={() => { setActiveTab('Top'); setShowForumMenu(false); }}>Badges & Tags</button></nav>}
      {showSearchModal && <div className="forum-search-popover"><strong>Search Forum</strong><span>{filteredTopics.length} matching topics</span><button type="button" onClick={() => setShowSearchModal(false)}>Close</button></div>}
      {selectedTopic ? <div className="thread-view-card"><button type="button" className="back-to-forum-btn" onClick={() => setSelectedTopicId(null)}>Back to Discussions</button><div className="thread-header"><h2>{selectedTopic.title}</h2><div className="topic-sub-meta"><span className="topic-cat-tag">{selectedTopic.category}</span><span>Posted by @{selectedTopic.author}</span></div></div><div className="thread-main-post"><div className="post-author-avatar">{selectedTopic.author.charAt(0).toUpperCase()}</div><div className="post-content-body"><p>{selectedTopic.content}</p>{selectedTopic.poll && <div className="forum-poll-box"><h4>Poll: {selectedTopic.poll.question}</h4>{votedPolls[selectedTopic.id] ? <div className="poll-results">{selectedTopic.poll.options.map((option) => <div className="poll-result-row" key={option.id}><span>{option.text}</span><span>{option.votes} votes</span></div>)}</div> : <div className="poll-options">{selectedTopic.poll.options.map((option) => <label className="poll-option-label" key={option.id}><input type="radio" name={`poll-${selectedTopic.id}`} checked={pollSelections[selectedTopic.id] === option.id} onChange={() => setPollSelections({ ...pollSelections, [selectedTopic.id]: option.id })} />{option.text}</label>)}<button type="button" className="vote-btn" disabled={!pollSelections[selectedTopic.id]} onClick={votePoll}>Vote</button></div>}</div>}</div></div><div className="thread-replies-list"><h3>Replies ({selectedTopic.replies.length})</h3>{selectedTopic.replies.map((reply) => { const key = `${selectedTopic.id}:${reply.id}`; return <article className="reply-card" key={reply.id}><div className="reply-avatar">{String(reply.author || 'U').charAt(0).toUpperCase()}</div><div className="reply-body"><div className="reply-header"><strong>@{reply.author || 'Anonymous'}</strong><span className="community-tier-badge">{reply.tier || 'Basic'}</span></div><p>{reply.text}</p><button type="button" className={`like-btn ${likedReplies.includes(key) ? 'liked' : ''}`} onClick={() => likeReply(reply.id)}>Like ({reply.likes || 0})</button></div></article>; })}<form className="reply-composer" onSubmit={addReply}><textarea aria-label="Reply to topic" placeholder="Join the discussion..." value={replyText} onChange={(event) => setReplyText(event.target.value)} required /><button type="submit" className="publish-topic-btn">Reply</button></form></div></div> : <><div className="forum-nav-bar"><div className="forum-tabs">{['Categories', 'Latest', 'Top'].map((tab) => <button type="button" key={tab} className={`forum-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div></div><div className="forum-main-grid"><div className="forum-categories-column"><h3 className="column-title">Categories</h3><div className="categories-list">{CATEGORIES.map((item) => <article className="category-card" key={item.name}><div className="category-header"><span className="cat-color-badge" style={{ backgroundColor: item.color }} /><h4>{item.name}</h4></div><p className="cat-desc">{item.desc}</p><div className="cat-meta"><span>{item.topics} Topics</span></div></article>)}</div></div><div className="forum-topics-column"><h3 className="column-title">Discussions</h3><div className="topics-table-header"><span className="col-topic">Topic</span><span className="col-users">Posters</span><span className="col-replies">Replies</span><span className="col-views">Views</span><span className="col-activity">Activity</span></div><div className="topics-list">{displayedTopics.map((topic) => <button type="button" className="topic-row-discourse clickable" key={topic.id} onClick={() => openTopic(topic)}><div className="topic-main-cell"><h4 className="topic-title-truncated" title={topic.title}>{topic.title}</h4><div className="topic-badges"><span className="cat-pill">{topic.category}</span><span className="author-tag">@{topic.author}</span></div></div><div className="topic-cell col-users"><div className="avatar-small">{topic.author.charAt(0).toUpperCase()}</div></div><div className="topic-cell col-replies">{topic.repliesCount}</div><div className="topic-cell col-views">{topic.views}</div><div className="topic-cell col-activity">{topic.lastActivity}</div></button>)}</div></div></div></>}
      {showNewTopicModal && <div className="modal-overlay" onClick={() => setShowNewTopicModal(false)}><div className="topic-modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="modal-header"><h3>Create a New Topic</h3><button type="button" onClick={() => setShowNewTopicModal(false)}>X</button></div><form onSubmit={createTopic}><input className="modal-title-input" placeholder="Topic Title..." value={title} onChange={(event) => setTitle(event.target.value)} required /><select className="modal-select" value={category} onChange={(event) => setCategory(event.target.value)}>{CATEGORIES.map((item) => <option key={item.name}>{item.name}</option>)}</select><textarea className="modal-textarea" placeholder="Type your post..." value={content} onChange={(event) => setContent(event.target.value)} required /><div className="modal-footer"><span>Cost: <strong>{fee.finalCost} Credits</strong> (+{fee.earnedExp} EXP)</span><button type="submit" className="publish-topic-btn">Post Topic</button></div></form></div></div>}
    </section>
  );
}
