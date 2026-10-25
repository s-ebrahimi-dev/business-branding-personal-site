
const LIBRETRANSLATE_URL =
  process.env.LIBRETRANSLATE_URL ||
  'http://127.0.0.1:5000/translate';

export async function translateWithLibreTranslate({
  text,
  sourceLanguage = 'fa',
  targetLanguage = 'en',
}) {
  const response = await fetch(LIBRETRANSLATE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text',
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const error = new Error(
      `LibreTranslate request failed with status ${response.status}.`,
    );

    error.status = response.status;
    error.provider = 'libretranslate';

    throw error;
  }

  const data = await response.json();
  const translatedText = data.translatedText?.trim();

  if (!translatedText) {
    const error = new Error(
      'LibreTranslate returned an empty translation.',
    );

    error.provider = 'libretranslate';

    throw error;
  }

  return {
    translatedText,
    provider: 'libretranslate',
  };
}
