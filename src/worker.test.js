import { expect, test } from 'vitest';
import worker from './worker';

function createDatabase() {
  const topics = [];
  const replies = [];

  return {
    prepare(query) {
      return {
        bind(...values) {
          return {
            async all() {
              if (query.includes('FROM community_topics')) {
                return { results: topics.filter((topic) => topic.scope === values[0]).sort((left, right) => right.created_at - left.created_at) };
              }
              if (query.includes('FROM community_replies')) {
                return { results: replies.filter((reply) => values.includes(reply.topic_id)) };
              }
              throw new Error(`Unexpected query: ${query}`);
            },
            async first() {
              return topics.find((topic) => topic.id === values[0] && topic.scope === values[1]) || null;
            },
            async run() {
              if (query.includes('INSERT INTO community_topics')) {
                const [id, scope, title, content, category, author, tier, created_at, credit_cost, earned_exp, document_html] = values;
                topics.push({ id, scope, title, content, category, author, tier, created_at, credit_cost, earned_exp, document_html, views: 1, replies_count: 0 });
              } else if (query.includes('INSERT INTO community_replies')) {
                const [id, topic_id, author, tier, text, created_at] = values;
                replies.push({ id, topic_id, author, tier, text, created_at, likes: 0 });
              } else if (query.includes('UPDATE community_topics')) {
                const topic = topics.find((item) => item.id === values[0] && item.scope === values[1]);
                if (topic) topic.replies_count += 1;
              } else {
                throw new Error(`Unexpected query: ${query}`);
              }
            },
          };
        },
      };
    },
    async batch(statements) {
      await Promise.all(statements.map((statement) => statement.run()));
    },
  };
}

function apiRequest(path, method = 'GET', body) {
  return new Request(`https://nebula.example${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('community topics and replies are shared within their forum scope', async () => {
  const env = { COMMUNITY_DB: createDatabase(), ASSETS: { fetch: () => new Response('asset') } };
  const topicResponse = await worker.fetch(
    apiRequest('/api/community/topics?scope=org%3Aardenne-high-school', 'POST', {
      title: 'Study group',
      content: 'Meet after class?',
      category: 'General Discussion',
      author: 'student-one',
      tier: 'Basic',
    }),
    env,
  );
  expect(topicResponse.status).toBe(201);
  const createdTopic = await topicResponse.json();

  const replyResponse = await worker.fetch(
    apiRequest(`/api/community/topics/${createdTopic.id}/replies?scope=org%3Aardenne-high-school`, 'POST', {
      author: 'student-two',
      tier: 'Basic',
      text: 'I will be there.',
    }),
    env,
  );
  expect(replyResponse.status).toBe(201);

  const sharedResponse = await worker.fetch(apiRequest('/api/community/topics?scope=org%3Aardenne-high-school'), env);
  const sharedTopics = await sharedResponse.json();
  expect(sharedTopics[0].title).toBe('Study group');
  expect(sharedTopics[0].replies[0].text).toBe('I will be there.');

  const personalResponse = await worker.fetch(apiRequest('/api/community/topics?scope=personal'), env);
  expect(await personalResponse.json()).toEqual([]);
});

test('community stores and returns published document HTML', async () => {
  const env = { COMMUNITY_DB: createDatabase(), ASSETS: { fetch: () => new Response('asset') } };
  const documentHtml = '<h1>My document</h1><p><strong>Formatted content</strong></p>';
  const createdResponse = await worker.fetch(
    apiRequest('/api/community/topics?scope=personal', 'POST', {
      title: 'My document',
      content: 'Formatted content',
      documentHtml,
      category: 'General Discussion',
      author: 'student-one',
      tier: 'Basic',
      creditCost: 10,
      earnedExp: 20,
    }),
    env,
  );

  expect(createdResponse.status).toBe(201);
  expect((await createdResponse.json()).documentHtml).toBe(documentHtml);

  const topicsResponse = await worker.fetch(apiRequest('/api/community/topics?scope=personal'), env);
  const [topic] = await topicsResponse.json();
  expect(topic.content).toBe('Formatted content');
  expect(topic.documentHtml).toBe(documentHtml);
});

test('community API rejects invalid scopes and invalid topics', async () => {
  const env = { COMMUNITY_DB: createDatabase(), ASSETS: { fetch: () => new Response('asset') } };
  const invalidScope = await worker.fetch(apiRequest('/api/community/topics?scope=other'), env);
  expect(invalidScope.status).toBe(400);

  const invalidTopic = await worker.fetch(
    apiRequest('/api/community/topics?scope=personal', 'POST', {
      title: 'Invalid category topic',
      content: 'Test',
      category: 'Not a category',
      author: 'user',
    }),
    env,
  );
  expect(invalidTopic.status).toBe(400);
});
