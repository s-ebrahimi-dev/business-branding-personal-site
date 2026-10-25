
import 'dotenv/config';
import { translateText } from './services/translation/translation.service.js';

try {
  const result = await translateText(
    'برندسازی فقط طراحی لوگو یا انتخاب رنگ نیست؛ بلکه فرایندی راهبردی برای ایجاد هویتی متمایز است.'
  );

  console.log('Provider:', result.provider);
  console.log('Model:', result.model ?? 'Not applicable');
  console.log('Translation:', result.translatedText);
} catch (error) {
  console.error('Translation test failed:', error.message);
}
