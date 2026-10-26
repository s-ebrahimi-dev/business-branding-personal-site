const originalTextNodes = new WeakMap();
const originalAttributes = new WeakMap();

function normalizeText(value) {
  return value.normalize('NFC').replace(/\s+/g, ' ').trim();
}

function preserveWhitespace(original, translated, language) {
  if (language === 'fa' || translated === original.trim()) return original;

  const leading = original.match(/^\s*/)?.[0] ?? '';
  const trailing = original.match(/\s*$/)?.[0] ?? '';
  // A Persian sentence may put a space before a final word/punctuation fragment.
  // Do not carry that space into an English punctuation-only fragment (" .").
  const safeLeading = /^[.,!?;:)]/.test(translated) ? '' : leading;
  return `${safeLeading}${translated}${trailing}`;
}

function translateTextNodes(language, bundle) {
  if (!document.body || !bundle.pageText) return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || parent.closest('script, style, noscript, [data-i18n]')) continue;

    if (!originalTextNodes.has(node)) originalTextNodes.set(node, node.nodeValue ?? '');
    const original = originalTextNodes.get(node) ?? '';
    const source = normalizeText(original);
    if (!source) continue;

    const translated = bundle.pageText[source];
    if (typeof translated === 'string') {
      node.nodeValue = preserveWhitespace(original, translated, language);
    } else if (language === 'en' && /[\u0600-\u06FF]/.test(source)) {
      console.warn(`[i18n] Missing English pageText translation: ${JSON.stringify(source)}`);
    }
  }
}

function translateAttributes(language, bundle) {
  if (!bundle.ariaText) return;

  const elements = document.querySelectorAll('[aria-label], [title], [alt], [placeholder]');
  for (const element of elements) {
    let saved = originalAttributes.get(element);
    if (!saved) {
      saved = {};
      originalAttributes.set(element, saved);
    }

    for (const attribute of ['aria-label', 'title', 'alt', 'placeholder']) {
      if (!element.hasAttribute(attribute)) continue;
      if (!(attribute in saved)) saved[attribute] = element.getAttribute(attribute) ?? '';

      const original = saved[attribute];
      const translated = bundle.ariaText[normalizeText(original)];
      if (typeof translated === 'string') element.setAttribute(attribute, translated);
    }
  }
}

function translateSpecialHeadings(language) {
  // This heading is split across a plain text node and <em>. English word order is
  // "Business Mansion", while Persian is "عمارت کسب‌وکار"; keep the original styling.
  const heading = document.querySelector('#mansion h2');
  const emphasized = heading?.querySelector('em');
  const firstText = heading?.firstChild;
  if (!heading || !emphasized || firstText?.nodeType !== Node.TEXT_NODE) return;

  if (!originalTextNodes.has(firstText)) originalTextNodes.set(firstText, firstText.nodeValue ?? '');
  if (!originalTextNodes.has(emphasized.firstChild) && emphasized.firstChild?.nodeType === Node.TEXT_NODE) {
    originalTextNodes.set(emphasized.firstChild, emphasized.firstChild.nodeValue ?? '');
  }

  if (language === 'en') {
    firstText.nodeValue = 'Business ';
    if (emphasized.firstChild?.nodeType === Node.TEXT_NODE) {
      emphasized.firstChild.nodeValue = 'Mansion';
    }
  }
}

export function translatePage(i18next, language) {
  const bundle = i18next.getResourceBundle(language, 'translation');
  if (!bundle) {
    console.error(`[i18n] Translation bundle not found for language: ${language}`);
    return;
  }

  translateTextNodes(language, bundle);
  translateAttributes(language, bundle);
  translateSpecialHeadings(language);

  if (bundle.pageMeta) {
    if (typeof bundle.pageMeta.title === 'string') document.title = bundle.pageMeta.title;
    const description = document.querySelector('meta[name="description"]');
    if (description && typeof bundle.pageMeta.description === 'string') {
      description.setAttribute('content', bundle.pageMeta.description);
    }
  }
}
