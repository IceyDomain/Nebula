import { useCallback, useEffect, useState } from 'react';
import { getCommunityTopics, postCommunityReply, postCommunityTopic } from './communityApi';

function readCache(scope, fallback) {
  try {
    const cached = JSON.parse(localStorage.getItem(`nebula_community_cache_${scope}`) || 'null');
    return Array.isArray(cached) ? cached : fallback;
  } catch {
    return fallback;
  }
}

function writeCache(scope, topics) {
  try {
    localStorage.setItem(`nebula_community_cache_${scope}`, JSON.stringify(topics));
  } catch {
    // The shared API remains the source of truth when browser caching is unavailable.
  }
}

export default function useCommunityForum(scope, fallbackTopics) {
  const [topics, setTopics] = useState(() => readCache(scope, fallbackTopics));
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const sharedTopics = await getCommunityTopics(scope);
      setTopics(sharedTopics);
      writeCache(scope, sharedTopics);
      setStatus('connected');
      setError('');
      return sharedTopics;
    } catch (requestError) {
      setStatus('offline');
      setError(requestError.message || 'Unable to connect to the shared community.');
      return null;
    }
  }, [scope]);

  useEffect(() => {
    let active = true;
    setTopics(readCache(scope, []));
    setStatus('loading');
    const sync = async () => {
      try {
        const sharedTopics = await getCommunityTopics(scope);
        if (!active) return;
        setTopics(sharedTopics);
        writeCache(scope, sharedTopics);
        setStatus('connected');
        setError('');
      } catch (requestError) {
        if (!active) return;
        setStatus('offline');
        setError(requestError.message || 'Unable to connect to the shared community.');
      }
    };

    sync();
    const interval = window.setInterval(sync, 10000);
    window.addEventListener('focus', sync);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', sync);
    };
  }, [scope]);

  const createTopic = useCallback(async (topic) => {
    try {
      const createdTopic = await postCommunityTopic(scope, topic);
      setTopics((currentTopics) => {
        const updatedTopics = [createdTopic, ...currentTopics.filter((item) => item.id !== createdTopic.id)];
        writeCache(scope, updatedTopics);
        return updatedTopics;
      });
      setError('');
      return createdTopic;
    } catch (requestError) {
      setStatus('offline');
      setError(requestError.message || 'Unable to post to the shared community.');
      throw requestError;
    }
  }, [scope]);

  const createReply = useCallback(async (topicId, reply) => {
    try {
      const createdReply = await postCommunityReply(scope, topicId, reply);
      setTopics((currentTopics) => {
        const updatedTopics = currentTopics.map((topic) => topic.id === topicId
          ? { ...topic, replies: [...topic.replies, createdReply], repliesCount: topic.repliesCount + 1, lastActivity: 'Just now' }
          : topic);
        writeCache(scope, updatedTopics);
        return updatedTopics;
      });
      setError('');
      return createdReply;
    } catch (requestError) {
      setStatus('offline');
      setError(requestError.message || 'Unable to post a reply to the shared community.');
      throw requestError;
    }
  }, [scope]);

  return { topics, setTopics, status, error, refresh, createTopic, createReply };
}
