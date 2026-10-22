async function request(path, options) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const contentType = response.headers?.get('content-type') || '';
  if (contentType && !contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `The community API returned ${contentType || 'a non-JSON response'} (${response.status}). `
      + 'The site host is serving its static page instead of the community Worker. Deploy the Worker and site together with "npm run deploy".',
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The community API returned invalid JSON. Please retry or contact the site administrator.');
  }

  if (!response.ok) {
    throw new Error(result?.error || `Community request failed (${response.status}).`);
  }
  return result;
}

export function getCommunityTopics(scope) {
  return request(`/api/community/topics?scope=${encodeURIComponent(scope)}`).then((topics) => {
    if (!Array.isArray(topics)) {
      throw new Error('The community API did not return a topic list. Please try again later.');
    }
    return topics;
  });
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
