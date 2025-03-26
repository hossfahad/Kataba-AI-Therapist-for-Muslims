import { PronunciationEntry } from './pronunciation';

/**
 * Dictionary of custom word pronunciations for Cartesia TTS
 * 
 * Format:
 * { 
 *   word: "WordToReplace", 
 *   phonemes: ["p", "h", "o", "n", "e", "m", "e", "s"] 
 * }
 */
export const pronunciationDictionary: PronunciationEntry[] = [
  { word: "sabr", phonemes: ["ˈs", "ɑː", "b", "r"] },
  { word: "tawakkul", phonemes: ["t", "ɑː", "ˈw", "ɑː", "k", "k", "ʊ", "l"] },
  { word: "rida", phonemes: ["r", "ɪ", "ˈd", "ɑː"] },
  { word: "huzn", phonemes: ["ˈh", "ʊ", "z", "n"] },
  { word: "shukr", phonemes: ["ˈʃ", "ʊ", "k", "r"] },
  { word: "rahmah", phonemes: ["ˈr", "ɑː", "h", "m", "ɑː"] },
  { word: "maghfirah", phonemes: ["ˈm", "ɑː", "ɣ", "f", "ɪ", "r", "ɑː"] },
  { word: "afiyah", phonemes: ["ˈɑː", "f", "i", "j", "ɑː"] },
  { word: "sakina", phonemes: ["s", "ɑː", "ˈk", "i", "n", "ɑː"] },
  { word: "qalb", phonemes: ["ˈq", "ɑː", "l", "b"] },
  { word: "tazkiyah", phonemes: ["ˈt", "æ", "z", "k", "i", "j", "ɑː"] },
  { word: "nafs", phonemes: ["ˈn", "æ", "f", "s"] },
  { word: "muhasabah", phonemes: ["m", "ʊ", "ˈh", "æ", "s", "ɑː", "b", "ɑː"] },
  { word: "istighfar", phonemes: ["ɪ", "s", "t", "ɪ", "ˈɣ", "f", "ɑː", "r"] },
  { word: "tafakkur", phonemes: ["t", "æ", "ˈf", "æ", "k", "k", "ʊ", "r"] },
  { word: "ikhlas", phonemes: ["ɪ", "ˈk", "h", "l", "ɑː", "s"] },
  { word: "silat al-rahim", phonemes: ["ˈs", "ɪ", "l", "æ", "t", "ɑː", "r", "ˈr", "ɑː", "h", "ɪ", "m"] },
  { word: "nasiha", phonemes: ["n", "æ", "ˈs", "i", "h", "ɑː"] },
  { word: "ukhuwah", phonemes: ["ʊ", "ˈk", "h", "ʊ", "w", "ɑː"] },
  { word: "adl", phonemes: ["ˈʕ", "æ", "d", "l"] },
  { word: "ruqyah", phonemes: ["ˈr", "ʊ", "q", "j", "ɑː"] },
  { word: "istikhara", phonemes: ["ɪ", "s", "t", "ɪ", "ˈk", "h", "ɑː", "r", "ɑː"] },
  { word: "khushu", phonemes: ["k", "h", "ʊ", "ˈʃ", "ʊ", "ʕ"] },
  { word: "tasbih", phonemes: ["t", "æ", "s", "ˈb", "iː", "h"] },
  { word: "taharah", phonemes: ["t", "ɑː", "ˈh", "ɑː", "r", "ɑː"] },
  { word: "hijama", phonemes: ["h", "ɪ", "ˈdʒ", "ɑː", "m", "ɑː"] },
  { word: "muraqabah", phonemes: ["m", "ʊ", "ˈr", "ɑː", "q", "ɑː", "b", "ɑː"] }
];

/**
 * How to add new pronunciations:
 * 
 * 1. Add a new entry to the array above
 * 2. For the phonemes, use proper IPA symbols separated in the array
 * 3. For stress marks, include them as separate elements with the symbol, e.g. ["ˈ"]
 * 
 * Example: For "therapeutic" you might use:
 * { word: "therapeutic", phonemes: ["θ", "ɛ", "r", "ə", "ˈp", "j", "u", "t", "ɪ", "k"] }
 * 
 * Reference: https://mfa-models.readthedocs.io/en/latest/dictionary/index.html
 */ 