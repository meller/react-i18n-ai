# AI Translation Library Design Doc

## Overview
This document describes the architecture and features of the in-house AI translation library being developed as part of the MyWebApp project, with the intent to open source it as a standalone package.

## Goals
- Provide dynamic, on-demand AI-powered translation for any string or content
- Support smart caching (local and backend) for performance and cost efficiency
- Seamless integration with React (and other frameworks in the future)
- No need for static translation files
- Scalable to any language, with zero maintenance overhead

## Key Features
*Initial AI Provider: Google Gemini will be used for all translation requests in the first version.*
- **Dynamic Translation**: Uses AI API to translate any string at runtime
- **Local Caching**: Translations are cached in localStorage for instant reuse
- **Backend Caching (Planned)**: Optionally sync cache to backend for cross-device and multi-user efficiency
- **Preloading**: Common UI strings can be pre-translated in the background
- **Language Context**: Global language preference context for the app
- **React Hook**: `useTranslation` hook for easy usage in components
- **Fallbacks**: English as default, with graceful fallback if translation fails
- **Extensible**: Designed to support other frameworks (Vue, Svelte, etc.) in the future

## Main TypeScript Interfaces

```typescript
// Only these are exported from the library:
export interface UseTranslationResult {
  t: (text: string) => Promise<string>;
  language: string;
  setLanguage?: (lang: string) => void;
  // TODO: clearCache?: () => void; // Not yet implemented: clears all cached translations for the current language
}

// The following interfaces are internal and not exported:
interface TranslationCache {
  [language: string]: {
    [textHash: string]: string;
  };
}

interface AITranslationRequest {
  text: string;
  targetLanguage: string;
}

interface AITranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}
```

**Public API Recommendation:**
Only `UseTranslationResult` (and types needed for the hook or provider) should be exported from the library. The other interfaces (`TranslationCache`, `AITranslationRequest`, `AITranslationResponse`) are internal implementation details and should not be exposed to consumers. This keeps the API surface minimal and focused, and allows for easier refactoring in the future.

**Translation Provider Integration:**
You can integrate AI translation in two ways:
- **Frontend (client-side):** Use the Gemini hook (`useGeminiAI`) to call Gemini directly from the browser. This is simple but exposes your API key to the client (not recommended for production).
- **Backend (server-side):** Create a backend API route that calls Gemini or another provider, keeping your API key secure. The frontend translation hook can call this backend endpoint for production use.

**Relationship between interfaces:**
The `UseTranslationResult` interface is returned by the `useTranslation` hook, which internally manages translation caching and API calls. Specifically:
- The hook uses a `TranslationCache` to store and retrieve translations locally.
- When a translation is not found in the cache, it constructs an `AITranslationRequest` and sends it to the AI provider (e.g., Gemini).
- The response from the AI provider is expected to match the `AITranslationResponse` interface, and the result is then cached for future use.

**Example (internal logic):**
```typescript
// Inside useTranslation hook (simplified)
const cache: TranslationCache = ...;
async function t(text: string): Promise<string> {
  const hash = hashText(text);
  if (cache[language]?.[hash]) {
    return cache[language][hash];
  }
  const req: AITranslationRequest = { text, targetLanguage: language };
  const res: AITranslationResponse = await aiTranslate(req);
  cache[language] = cache[language] || {};
  cache[language][hash] = res.translatedText;
  return res.translatedText;
}
```

These interfaces ensure type safety and clarity for cache management, hook usage, and API integration.

## Architecture
- `src/ai-translation/`
  - `useTranslation.ts` — React hook for translation
  - `translationCache.ts` — Handles localStorage and (future) backend cache
  - `aiTranslate.ts` — Handles calls to AI translation API
  - `preload.ts` — Preloads common UI strings
  - `LanguageProvider.tsx` — React context provider for language
  - `types.ts` — TypeScript types for translation cache, options, etc.

## Usage Guide

### 1. Wrap your app with the LanguageProvider
```tsx
import { LanguageProvider } from 'src/ai-translation/LanguageProvider';

function App() {
  return (
    <LanguageProvider>
      {/* ...your app components... */}
    </LanguageProvider>
  );
}
```

### 2. Use the useTranslation hook and setAITranslateProvider in your components

```tsx
import { useTranslation } from 'src/ai-translation/useTranslation';
import { setAITranslateProvider } from 'src/ai-translation/aiTranslate';

function MyComponent() {
  // Wire up your AI provider for translation
  useEffect(() => {
    setAITranslateProvider((text, targetLanguage) => {
      // Call your AI translation API here
      return fetch('/api/translate', {
        method: 'POST',
        body: JSON.stringify({ text, targetLanguage }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(res => res.json())
        .then(data => data.translatedText);
    });
  }, []);

  const { t, language } = useTranslation();
  // State for UI labels
  const [label, setLabel] = useState('My Label');

  useEffect(() => {
    t('My Label').then(setLabel);
  }, [t, language]);

  return <div>{label}</div>;
}
```

### 3. How translation works
- When you call `t('Some text')`, the library:
  1. Checks the local cache for the translation in the current language.
  2. If not found, calls the AI API to translate the text.
  3. Stores the result in the cache for future use.
  4. Returns the translated string (or the original if language is 'en').

### 4. Advanced: Preloading common UI strings
```typescript
import { preloadTranslations } from 'src/ai-translation/preload';
preloadTranslations(['Save', 'Delete', 'Edit'], 'fr');
```

---

## Caching Strategy
- **Phase 1**: LocalStorage per language, hash-based keys
- **Phase 2**: Sync with backend cache (optional)
- **Phase 3**: Predictive preloading based on user patterns

## Integration Plan
1. Develop and test library inside MyWebApp project
2. Refactor to remove app-specific dependencies
3. Publish as open source npm package and GitHub repo
4. Document usage and provide integration guides

## Roadmap
- [x] Dynamic translation via AI API
- [x] LocalStorage caching
- [ ] React context and hook
- [ ] Preloading common UI strings
- [ ] Backend cache sharing
- [ ] Framework-agnostic core
- [ ] Open source release
- [ ] Context-aware translation (context param for t(), context in cache and API)
- [ ] RTL support (auto-detect RTL languages, set dir attribute, RTL-aware UI)
- [ ] Backend translation support for production (API endpoint, secure key, batch/context translation)

## License
MIT 

---
For questions or contributions, contact me on GitHub (@meller).
