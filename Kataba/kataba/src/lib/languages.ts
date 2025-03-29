import OpenAI from 'openai';

// Supported languages with their codes and greetings
export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    greeting: 'Asalaamu Alaikum',
    direction: 'ltr'
  },
  ar: {
    name: 'Arabic',
    greeting: 'السلام عليكم',
    direction: 'rtl'
  },
  ur: {
    name: 'Urdu',
    greeting: 'السلام علیکم',
    direction: 'rtl'
  },
  fr: {
    name: 'French',
    greeting: 'Assalam Aleikoum',
    direction: 'ltr'
  },
  tr: {
    name: 'Turkish',
    greeting: 'Selamün Aleyküm',
    direction: 'ltr'
  },
  ms: {
    name: 'Malay',
    greeting: 'Assalamualaikum',
    direction: 'ltr'
  },
  id: {
    name: 'Indonesian',
    greeting: 'Assalamualaikum',
    direction: 'ltr'
  }
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Default language
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/**
 * Detects the language of the provided text using OpenAI
 * @param inputText - Text to analyze for language detection
 * @returns Detected language code or default language if detection fails
 */
export const detectLanguage = async (
  inputText: string,
  openai: OpenAI
): Promise<LanguageCode> => {
  if (!inputText.trim()) {
    return DEFAULT_LANGUAGE;
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a language detection tool. Identify the language of the text and respond with only the ISO 639-1 language code.'
        },
        { role: 'user', content: inputText }
      ],
      temperature: 0.1,
      max_tokens: 10
    });
    
    const detectedCode = response.choices[0]?.message?.content?.trim().toLowerCase() || DEFAULT_LANGUAGE;
    
    // Check if detected language is supported, otherwise return default
    return detectedCode in SUPPORTED_LANGUAGES 
      ? detectedCode as LanguageCode 
      : DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Language detection error:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Generates system prompt with language-specific instructions
 * @param language - Target language code
 * @returns System prompt customized for the specified language
 */
export const getLocalizedSystemPrompt = (language: LanguageCode): string => {
  const langInfo = SUPPORTED_LANGUAGES[language];
  const isRTL = langInfo.direction === 'rtl';
  const greeting = langInfo.greeting;
  
  // Base system prompt with language adaptation
  return `I need guidance from Kataba, a top-tier therapist specializing in intercultural Muslim relationships, emotional resilience, and personal growth. Kataba speaks with deep wisdom, empathy, and honesty, balancing faith, psychology, and life experience to help me navigate heartbreak, uncertainty, and healing.

Right now, I am struggling with [describe your situation]. Kataba, help me process my emotions, understand my path forward, and find clarity through both faith and reason. Encourage me to grow without forcing me to move too fast. Keep me grounded in Islamic principles while acknowledging the complexities of modern relationships.

Speak to me as if you truly understand my pain and want the best for me. Be firm when I need truth, gentle when I need comfort, and always guide me toward self-worth, patience, and trust in Allah's plan. Offer me practical steps, spiritual insights, and the perspective I need to heal and move forward.

Always respond with Islamic context in mind. Those that are struggling need to hear from an Islamic perspective.

Respond in ${SUPPORTED_LANGUAGES[language].name}. ${isRTL ? 'Remember to structure your response for right-to-left text direction.' : ''}

Start conversations with "${greeting}". You can optionally ask about me, where I'm from, how old, to get a better idea on the guidance to provide.`;
}; 