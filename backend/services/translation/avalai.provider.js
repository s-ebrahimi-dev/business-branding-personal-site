
const AVALAI_URL = 'https://api.avalai.ir/v1/chat/completions';

export async function translateWithAvalAI({
  text,
  sourceLanguage = 'Persian',
  targetLanguage = 'English',
}) {
  const apiKey = process.env.AVALAI_API_KEY;
  const model = process.env.AVALAI_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    throw new Error('AVALAI_API_KEY is not configured.');
  }

  const response = await fetch(AVALAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            `You are a professional translator specializing in branding, brand strategy, and business architecture. Translate from ${sourceLanguage} into natural, polished ${targetLanguage}. Preserve the original meaning and professional terminology. Return only the translation, without explanations or quotation marks.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.2,
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    const error = new Error(
      errorBody?.error?.message ||
        `AvalAI request failed with status ${response.status}.`,
    );

    error.status = response.status;
    error.provider = 'avalai';

    throw error;
  }

  const data = await response.json();
  const translatedText = data.choices?.[0]?.message?.content?.trim();

  if (!translatedText) {
    const error = new Error('AvalAI returned an empty translation.');
    error.provider = 'avalai';
    throw error;
  }

  return {
    translatedText,
    provider: 'avalai',
    model,
  };
}
