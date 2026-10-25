
import { translateText } from '../services/translation/translation.service.js';

export async function translateContent(req, res) {
  const { text } = req.body ?? {};

  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'A non-empty text field is required.',
    });
  }

  if (text.length > 10_000) {
    return res.status(400).json({
      success: false,
      message: 'Text must not exceed 10,000 characters.',
    });
  }

  try {
    const result = await translateText(text);

    return res.status(200).json({
      success: true,
      translation: result.translatedText,
      provider: result.provider,
      model: result.model ?? null,
    });
  } catch (error) {
    console.error('Content translation failed:', {
      provider: error.provider ?? 'unknown',
      status: error.status ?? null,
      message: error.message,
    });

    return res.status(502).json({
      success: false,
      message: 'Translation failed. Please try again later.',
    });
  }
}
