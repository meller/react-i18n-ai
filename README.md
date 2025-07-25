# react-i18n-ai

A simple Node package for AI-powered translation in React apps.

## Installation

```bash
npm install react-i18n-ai
```

## Usage

First, set your AI translation provider (e.g., call your backend or AI API):

```js
import { setAITranslateProvider } from 'react-i18n-ai';

setAITranslateProvider((text, targetLanguage) => {
  // Example: call your backend API
  return fetch('/api/translate', {
    method: 'POST',
    body: JSON.stringify({ text, targetLanguage }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(data => data.translatedText);
});
```

Then use the hook in your components:

```js
import { useTranslation } from 'react-i18n-ai';

const { t, language, setLanguage } = useTranslation();

// Example usage
t('Hello world').then(console.log);
setLanguage('es'); // Switch to Spanish
```


## Gemini Integration Example

You can use Google Gemini as your AI provider. For example, using the [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) package:

```js
import { setAITranslateProvider } from 'react-i18n-ai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('YOUR_GEMINI_API_KEY');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

setAITranslateProvider(async (text, targetLanguage) => {
  const prompt = `Translate the following text to ${targetLanguage}: ${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
});
```

## Design & Architecture

See [ai-translation-design.md](./ai-translation-design.md) for full design, API, and integration details.

## License

MIT
