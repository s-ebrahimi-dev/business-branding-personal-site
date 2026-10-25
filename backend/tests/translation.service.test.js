
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  translateWithProviders,
} from '../services/translation/translation.service.js';

test('uses AvalAI when the primary provider succeeds', async () => {
  let fallbackCalled = false;

  const result = await translateWithProviders('سلام دنیا', {
    primary: async ({ text }) => ({
      translatedText: `Translated: ${text}`,
      provider: 'avalai',
      model: 'gpt-4.1-mini',
    }),
    fallback: async () => {
      fallbackCalled = true;
      throw new Error('Fallback should not be called');
    },
  });

  assert.equal(result.provider, 'avalai');
  assert.equal(result.translatedText, 'Translated: سلام دنیا');
  assert.equal(fallbackCalled, false);
});

test('uses LibreTranslate when AvalAI returns a temporary server error', async () => {
  let fallbackInput;

  const result = await translateWithProviders('  سلام دنیا  ', {
    primary: async () => {
      const error = new Error('Simulated AvalAI outage');
      error.status = 503;
      throw error;
    },
    fallback: async (input) => {
      fallbackInput = input;

      return {
        translatedText: 'Hello world',
        provider: 'libretranslate',
      };
    },
  });

  assert.equal(result.provider, 'libretranslate');
  assert.equal(result.translatedText, 'Hello world');
  assert.equal(fallbackInput.text, 'سلام دنیا');
  assert.equal(fallbackInput.sourceLanguage, 'fa');
  assert.equal(fallbackInput.targetLanguage, 'en');
});

test('does not use fallback for an authentication error', async () => {
  let fallbackCalled = false;

  const primaryError = new Error('Invalid API key');
  primaryError.status = 401;

  await assert.rejects(
    translateWithProviders('سلام دنیا', {
      primary: async () => {
        throw primaryError;
      },
      fallback: async () => {
        fallbackCalled = true;
        return { translatedText: 'Hello world' };
      },
    }),
    (error) => error === primaryError,
  );

  assert.equal(fallbackCalled, false);
});

test('rejects empty input before calling a provider', async () => {
  let primaryCalled = false;

  await assert.rejects(
    translateWithProviders('   ', {
      primary: async () => {
        primaryCalled = true;
      },
    }),
    /non-empty string/,
  );

  assert.equal(primaryCalled, false);
});
