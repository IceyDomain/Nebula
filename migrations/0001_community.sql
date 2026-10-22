CREATE TABLE community_topics (
  id TEXT PRIMARY KEY,
  scope TEXT NOT NULL CHECK (scope = 'personal' OR scope LIKE 'org:%'),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Basic',
  created_at INTEGER NOT NULL,
  credit_cost INTEGER NOT NULL DEFAULT 0,
  earned_exp INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 1,
  replies_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX community_topics_scope_created
  ON community_topics (scope, created_at DESC);

CREATE TABLE community_replies (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES community_topics (id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'Basic',
  text TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX community_replies_topic_created
  ON community_replies (topic_id, created_at ASC);
