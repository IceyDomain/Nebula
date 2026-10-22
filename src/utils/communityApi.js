async function request(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.error || `Community request failed (${response.status}).`);
  }
  return result;
}

export function getCommunityTopics(scope) {
  return request(`/api/community/topics?scope=${encodeURIComponent(scope)}`);
}

export function postCommunityTopic(scope, topic) {
  return request(`/api/community/topics?scope=${encodeURIComponent(scope)}`, {
    method: 'POST',
    body: JSON.stringify(topic),
  });
}

export function postCommunityReply(scope, topicId, reply) {
  return request(`/api/community/topics/${encodeURIComponent(topicId)}/replies?scope=${encodeURIComponent(scope)}`, {
    method: 'POST',
    body: JSON.stringify(reply),
  });
}
