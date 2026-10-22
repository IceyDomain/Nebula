const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'hr', 'i', 'li', 'ol', 'p', 'pre', 's', 'span', 'strike', 'strong', 'sub', 'sup', 'table',
  'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]);

const STYLE_VALIDATORS = {
  'background-color': /^(#[\da-f]{3,8}|[a-z]{1,20}|rgba?\([\d.,%\s]+\))$/i,
  color: /^(#[\da-f]{3,8}|[a-z]{1,20}|rgba?\([\d.,%\s]+\))$/i,
  'font-family': /^[\w\s,"'-]{1,80}$/i,
  'font-size': /^\d{1,3}(?:\.\d+)?(?:px|pt|em|rem|%)$/i,
  'font-style': /^(normal|italic|oblique)$/i,
  'font-weight': /^(normal|bold|[1-9]00)$/i,
  'text-align': /^(left|right|center|justify|start|end)$/i,
  'text-decoration': /^(none|underline|line-through|overline)$/i,
};

function sanitizeStyle(style) {
  return style.split(';').flatMap((declaration) => {
    const separator = declaration.indexOf(':');
    if (separator < 0) return [];

    const property = declaration.slice(0, separator).trim().toLowerCase();
    const value = declaration.slice(separator + 1).trim();
    const validator = STYLE_VALIDATORS[property];
    return validator?.test(value) ? [`${property}: ${value}`] : [];
  }).join('; ');
}

function copySafeNode(source, targetDocument) {
  if (source.nodeType === Node.TEXT_NODE) return targetDocument.createTextNode(source.textContent || '');
  if (source.nodeType !== Node.ELEMENT_NODE) return null;

  const sourceElement = source;
  if (!ALLOWED_TAGS.has(sourceElement.tagName.toLowerCase())) {
    const fragment = targetDocument.createDocumentFragment();
    sourceElement.childNodes.forEach((child) => {
      const safeChild = copySafeNode(child, targetDocument);
      if (safeChild) fragment.appendChild(safeChild);
    });
    return fragment;
  }

  const safeElement = targetDocument.createElement(sourceElement.tagName.toLowerCase());
  if (sourceElement.hasAttribute('style')) {
    const style = sanitizeStyle(sourceElement.getAttribute('style') || '');
    if (style) safeElement.setAttribute('style', style);
  }
  if (sourceElement.tagName.toLowerCase() === 'a') {
    const href = sourceElement.getAttribute('href') || '';
    if (/^(https?:|mailto:|\/|#)/i.test(href) && !/^\/\//.test(href)) {
      safeElement.setAttribute('href', href);
      safeElement.setAttribute('rel', 'noopener noreferrer');
    }
  }
  if (['td', 'th'].includes(sourceElement.tagName.toLowerCase())) {
    for (const attribute of ['colspan', 'rowspan']) {
      const value = sourceElement.getAttribute(attribute);
      if (value && /^\d{1,2}$/.test(value)) safeElement.setAttribute(attribute, value);
    }
  }

  sourceElement.childNodes.forEach((child) => {
    const safeChild = copySafeNode(child, targetDocument);
    if (safeChild) safeElement.appendChild(safeChild);
  });
  return safeElement;
}

export function sanitizeDocumentHtml(html = '') {
  if (typeof html !== 'string' || !html) return '';
  const parsedDocument = new DOMParser().parseFromString(html, 'text/html');
  const safeContainer = document.createElement('div');

  parsedDocument.body.childNodes.forEach((child) => {
    const safeChild = copySafeNode(child, document);
    if (safeChild) safeContainer.appendChild(safeChild);
  });

  return safeContainer.innerHTML;
}
