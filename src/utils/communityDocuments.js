import { postCommunityTopic } from './communityApi';

export function getDocumentCommunityScope(user, theme) {
  if (theme !== 'ardenne') return 'personal';
  const organizationId = user?.organization?.id || user?.orgId || 'ardenne-high-school';
  return `org:${organizationId}`;
}

export function publishDocumentToCommunity({ document, fee, user, theme }) {
  return postCommunityTopic(getDocumentCommunityScope(user, theme), {
    title: document.title,
    content: document.text,
    documentHtml: document.html,
    category: 'General Discussion',
    author: user?.username || user?.email?.split('@')[0] || 'Anonymous',
    tier: user?.tier || 'Basic',
    creditCost: fee.finalCost,
    earnedExp: fee.earnedExp,
  });
}
