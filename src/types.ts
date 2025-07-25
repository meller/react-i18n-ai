// Only this interface is exported
export interface UseTranslationResult {
  t: (text: string) => Promise<string>;
  language: string;
  setLanguage?: (lang: string) => void;
}

// Internal types (not exported)
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
