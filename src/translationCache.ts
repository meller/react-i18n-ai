// Handles localStorage and (future) backend cache for translations
// Internal only

import type { UseTranslationResult } from './types';

const CACHE_KEY = 'aiTranslationCache';

// Internal cache type
interface TranslationCache {
  [language: string]: {
    [textHash: string]: string;
  };
}

function loadCache(): TranslationCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: TranslationCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function getCachedTranslation(language: string, hash: string): string | undefined {
  const cache = loadCache();
  return cache[language]?.[hash];
}

export function setCachedTranslation(language: string, hash: string, value: string) {
  const cache = loadCache();
  if (!cache[language]) cache[language] = {};
  cache[language][hash] = value;
  saveCache(cache);
}
