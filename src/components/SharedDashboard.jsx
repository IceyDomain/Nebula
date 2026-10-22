import { useMemo, useState } from 'react';
import { calculatePublishingFee } from '../utils/publishingRates';
import useCommunityForum from '../utils/useCommunityForum';

const NEBULA_CATEGORIES = [
  { name: 'Quantum Mathematics', color: '#a855f7', desc: 'Calculus, Functions, Algebra & Logic problems.', topics: 128 },
  { name: 'Astro Physics', color: '#38bdf8', desc: 'Kinematics, Thermodynamics, and Space Systems.', topics: 94 },
  { name: 'Computer Science', color: '#2dd4bf', desc: 'Algorithms, Web Portals, React & Code Snippets.', topics: 312 },
  { name: 'General Discussion', color: '#facc15', desc: 'Study tips, social hub, and casual study lounge.', topics: 540 },
];
// theme="ardenne" starts with an empty forum (no sample topics, no categories).
export default function SharedDashboard({ user, currentUser, onPublishTransaction, theme = 'nebula' }) {
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
  const organizationId = user?.organization?.id || user?.orgId || 'ardenne-high-school';
  const { topics, setTopics, status, error: forumError, refresh, createTopic: saveTopic, createReply: saveReply } = useCommunityForum(
    isSchool ? `org:${organizationId}` : 'personal',
    [],
  );
  const [pollSelections, setPollSelections] = useState({});
  const [votedPolls, setVotedPolls] = useState({});
  const [likedReplies, setLikedReplies] = useState([]);
  const author = user?.username || currentUser || 'Anonymous';
  const fee = calculatePublishingFee(content, user?.tier);
  const selectedTopic = topics.find((topic) => topic.id === selectedTopicId) || null;

  const filteredTopics = useMemo(() => topics.filter((topic) => `${topic.title} ${topic.category} ${topic.author} ${topic.content}`.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery, topics]);
  const displayedTopics = useMemo(() => {
    if (activeTab === 'Top') return [...filteredTopics].sort((left, right) => right.repliesCount - left.repliesCount);
    if (activeTab === 'Latest') return [...filteredTopics].sort((left, right) => right.createdAt - left.createdAt);
    return filteredTopics;
  }, [activeTab, filteredTopics]);

  const createTopic = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if ((user?.credits || 0) < fee.finalCost) return alert(`You need ${fee.finalCost} Credits to post this topic.`);
    if (status !== 'connected') return;
    try {
      await saveTopic({ title: title.trim(), content: content.trim(), category, author, tier: user?.tier || 'Basic', creditCost: fee.finalCost, earnedExp: fee.earnedExp });
      if (onPublishTransaction && !onPublishTransaction(fee)) return;
      setTitle('');
      setContent('');
      setShowNewTopicModal(false);
    } catch {
      // The shared forum hook exposes the posting error in the community status message.
    }
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
  const addReply = async (event) => {
    event.preventDefault();
    if (!replyText.trim() || status !== 'connected') return;
    try {
      await saveReply(selectedTopic.id, { author, tier: user?.tier || 'Basic', text: replyText.trim() });
      setReplyText('');
    } catch {
      // The shared forum hook exposes the posting error in the community status message.
    }
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div className="nd-crumb">{isSchool ? 'Portal' : 'Nebula'} / <span>Community</span></div>
        <h1 className="nd-ttl">Community Forum</h1>
        <p className="nd-sub">Discuss course concepts, collaborate on projects and share study docs.</p>
      </div>
      <div className="nd-card" role={status === 'offline' ? 'alert' : 'status'}>
        {status === 'connected'
          ? `Connected to the shared ${isSchool ? 'school' : 'personal'} community. Names and organization membership are not verified; do not post private information.`
          : status === 'loading'
            ? 'Connecting to the shared community...'
            : `Shared community unavailable: ${forumError} Locally saved posts may be shown; new posts and replies are disabled.`}
        {status === 'offline' && <button type="button" className="nd-btn sm" onClick={refresh}>Retry connection</button>}
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
              <textarea className="nd-inp" rows="3" aria-label="Reply to topic" placeholder="Join the discussion..." value={replyText} onChange={(event) => setReplyText(event.target.value)} required disabled={status !== 'connected'} />
              <div><button type="submit" className="nd-btn" disabled={status !== 'connected'}>Reply</button></div>
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
            <button type="button" className="nd-btn" onClick={() => setShowNewTopicModal(true)} disabled={status !== 'connected'}>+ New Topic</button>
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
                  <button type="submit" className="nd-btn" disabled={status !== 'connected'}>Post Topic</button>
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
