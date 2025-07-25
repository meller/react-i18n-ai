import { useCallback, useState, useEffect } from 'react';
// Language selection is now generic. No app-specific imports.
import { getCachedTranslation, setCachedTranslation } from './translationCache';
import { aiTranslate } from './aiTranslate';
import type { UseTranslationResult } from './types';

function hashText(text: string): string {
  // Simple hash for demo; replace with a better hash in production
  let hash = 0, i, chr;
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString();
}


export function useTranslation(): UseTranslationResult {
  // Use the app's language from settings as the source of truth
  const [language, setLanguage] = useState<string>('en');

  const t = useCallback(async (text: string) => {
    if (language === 'en') return text;
    const hash = hashText(text);
    let cached = getCachedTranslation(language, hash);
    // If cached value looks like a fallback (e.g., [es] Back to ...), ignore and retry AI
    const isFallback = cached && cached.startsWith(`[${language}] `);
    if (cached && !isFallback) return cached;
    const res = await aiTranslate({ text, targetLanguage: language });
    setCachedTranslation(language, hash, res.translatedText);
    return res.translatedText;
  }, [language]);

  return { t, language, setLanguage };
}
