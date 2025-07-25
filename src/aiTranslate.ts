// Handles calls to AI translation API (generic)
// Internal only
/**
 * Function to perform translation. Must be set by the consumer (e.g., in app setup).
 */
let aiProviderTranslate: ((text: string, targetLanguage: string) => Promise<string>) | null = null;

/**
 * Set the translation provider function. Call this at app startup or in a React effect.
 * @param fn Function that takes (text, targetLanguage) and returns a Promise<string> with the translation.
 */
export function setAITranslateProvider(fn: (text: string, targetLanguage: string) => Promise<string>) {
  aiProviderTranslate = fn;
}

interface AITranslationRequest {
  text: string;
  targetLanguage: string;
}

interface AITranslationResponse {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// This function must be called from a React component or hook
export async function aiTranslate(req: AITranslationRequest): Promise<AITranslationResponse> {
  if (aiProviderTranslate) {
    try {
      const translated = await aiProviderTranslate(req.text, req.targetLanguage);
      return {
        translatedText: translated,
        detectedSourceLanguage: 'en', // Optionally allow provider to return this
      };
    } catch (e) {
      console.warn('[aiTranslate] Provider threw error, falling back to mock:', e);
    }
  }
  // Fallback: return mock
  console.warn('[aiTranslate] Fallback to mock translation');
  return {
    translatedText: `[${req.targetLanguage}] ${req.text}`,
    detectedSourceLanguage: 'en',
  };
}
