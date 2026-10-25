
import { translateWithAvalAI } from './avalai.provider.js';
import { translateWithLibreTranslate } from './libretranslate.provider.js';

function canUseFallback(error) {
  if ([408, 429].includes(error.status)) {
    return true;
  }

  if (error.status >= 500 && error.status <= 599) {
    return true;
  }

  return (
    error instanceof TypeError ||
    error.name === 'TimeoutError' ||
    error.name === 'AbortError'
  );
}

// This function contains the provider-selection logic.
// Optional dependencies let us replace real providers in tests.
export async function translateWithProviders(
  text,
  {
    primary = translateWithAvalAI,
    fallback = translateWithLibreTranslate,
  } = {},
) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Text to translate must be a non-empty string.');
  }

  const cleanText = text.trim();

  try {
    return await primary({
      text: cleanText,
      sourceLanguage: 'Persian',
      targetLanguage: 'English',
    });
  } catch (error) {
    if (!canUseFallback(error)) {
      throw error;
    }

    console.warn(
      'Primary translation provider is temporarily unavailable. Trying fallback.',
    );

    return fallback({
      text: cleanText,
      sourceLanguage: 'fa',
      targetLanguage: 'en',
    });
  }
}

export function translateText(text) {
  return translateWithProviders(text);
}
