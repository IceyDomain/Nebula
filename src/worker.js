const PERSONAL_CATEGORIES = new Set([
  'Quantum Mathematics',
  'Astro Physics',
  'Computer Science',
  'General Discussion',
]);
const ORGANIZATION_CATEGORIES = new Set(['General Discussion']);
const MAX_TITLE_LENGTH = 120;
const MAX_CONTENT_LENGTH = 5000;

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function readScope(url) {
  const scope = url.searchParams.get('scope');
  return scope === 'personal' || /^org:[a-z0-9-]{1,80}$/.test(scope || '') ? scope : null;
}

function requiredText(value, limit) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= limit ? trimmed : null;
}

function topicFromRow(row, replies) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    author: row.author,
    tier: row.tier,
    repliesCount: row.replies_count,
    views: String(row.views),
    lastActivity: row.replies_count ? 'Recently' : 'Just now',
    createdAt: row.created_at,
    content: row.content,
    creditCost: row.credit_cost,
    earnedExp: row.earned_exp,
    replies: replies.get(row.id) || [],
  };
}

async function listTopics(db, scope) {
  const { results: rows } = await db.prepare(
    `SELECT id, title, category, author, tier, content, created_at,
            credit_cost, earned_exp, views, replies_count
     FROM community_topics
     WHERE scope = ?
     ORDER BY created_at DESC
     LIMIT 100`,
  ).bind(scope).all();

  if (!rows.length) return [];

  const placeholders = rows.map(() => '?').join(', ');
  const { results: replyRows } = await db.prepare(
    `SELECT id, topic_id, author, tier, text, likes, created_at
     FROM community_replies
     WHERE topic_id IN (${placeholders})
     ORDER BY created_at ASC`,
  ).bind(...rows.map((row) => row.id)).all();
  const replies = new Map();

  replyRows.forEach((row) => {
    const topicReplies = replies.get(row.topic_id) || [];
    topicReplies.push({
      id: row.id,
      author: row.author,
      tier: row.tier,
      text: row.text,
      likes: row.likes,
      createdAt: row.created_at,
    });
    replies.set(row.topic_id, topicReplies);
  });

  return rows.map((row) => topicFromRow(row, replies));
}

async function createTopic(db, scope, body) {
  const title = requiredText(body?.title, MAX_TITLE_LENGTH);
  const content = requiredText(body?.content, MAX_CONTENT_LENGTH);
  const author = requiredText(body?.author, 40);
  const tier = requiredText(body?.tier, 20) || 'Basic';
  const category = requiredText(body?.category, 60);
  const categories = scope === 'personal' ? PERSONAL_CATEGORIES : ORGANIZATION_CATEGORIES;

  if (!title || !content || !author || !category || !categories.has(category)) {
    return jsonResponse({ error: 'Enter a valid title, message, author, and category.' }, 400);
  }

  const topic = {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    author,
    tier,
    createdAt: Date.now(),
    creditCost: Number.isFinite(body.creditCost) ? Math.max(0, Math.floor(body.creditCost)) : 0,
    earnedExp: Number.isFinite(body.earnedExp) ? Math.max(0, Math.floor(body.earnedExp)) : 0,
  };

  await db.prepare(
    `INSERT INTO community_topics
       (id, scope, title, content, category, author, tier, created_at, credit_cost, earned_exp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    topic.id,
    scope,
    topic.title,
    topic.content,
    topic.category,
    topic.author,
    topic.tier,
    topic.createdAt,
    topic.creditCost,
    topic.earnedExp,
  ).run();

  return jsonResponse({
    ...topic,
    repliesCount: 0,
    views: '1',
    lastActivity: 'Just now',
    replies: [],
  }, 201);
}

async function createReply(db, scope, topicId, body) {
  const text = requiredText(body?.text, MAX_CONTENT_LENGTH);
  const author = requiredText(body?.author, 40);
  const tier = requiredText(body?.tier, 20) || 'Basic';
  if (!text || !author) return jsonResponse({ error: 'Enter a valid reply and author.' }, 400);

  const topic = await db.prepare(
    'SELECT id FROM community_topics WHERE id = ? AND scope = ?',
  ).bind(topicId, scope).first();
  if (!topic) return jsonResponse({ error: 'Topic not found.' }, 404);

  const reply = { id: crypto.randomUUID(), author, tier, text, likes: 0, createdAt: Date.now() };
  await db.batch([
    db.prepare(
      `INSERT INTO community_replies (id, topic_id, author, tier, text, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(reply.id, topicId, reply.author, reply.tier, reply.text, reply.createdAt),
    db.prepare(
      'UPDATE community_topics SET replies_count = replies_count + 1 WHERE id = ? AND scope = ?',
    ).bind(topicId, scope),
  ]);
  return jsonResponse(reply, 201);
}

async function handleApiRequest(request, env, url) {
  const scope = readScope(url);
  if (!scope) return jsonResponse({ error: 'A valid forum scope is required.' }, 400);
  if (!env.COMMUNITY_DB) return jsonResponse({ error: 'The shared community database is not configured.' }, 503);

  if (url.pathname === '/api/community/topics' && request.method === 'GET') {
    return jsonResponse(await listTopics(env.COMMUNITY_DB, scope));
  }

  if (url.pathname === '/api/community/topics' && request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
    }
    return createTopic(env.COMMUNITY_DB, scope, body);
  }

  const replyMatch = /^\/api\/community\/topics\/([a-zA-Z0-9_-]+)\/replies$/.exec(url.pathname);
  if (replyMatch && request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
    }
    return createReply(env.COMMUNITY_DB, scope, replyMatch[1], body);
  }

  return jsonResponse({ error: 'Community endpoint not found.' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApiRequest(request, env, url);
      } catch (error) {
        console.error('Community API error:', error);
        return jsonResponse({ error: 'The shared community service is temporarily unavailable.' }, 503);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
