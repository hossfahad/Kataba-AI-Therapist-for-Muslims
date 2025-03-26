/**
 * Utility for handling custom pronunciation in Cartesia TTS
 */

// Dictionary of words and their phonetic pronunciations
export interface PronunciationEntry {
  word: string;       // The word to replace
  phonemes: string[]; // Array of phonemes
}

// The pronunciation dictionary is imported from a separate file
// to make it easier to update
import { pronunciationDictionary } from './pronunciation-dictionary';

/**
 * Applies custom pronunciations to text
 * @param text The input text
 * @returns Text with pronunciation markers for Cartesia TTS
 */
export function applyCustomPronunciations(text: string): string {
  if (!text) return text;
  
  let result = text;
  
  // Apply each custom pronunciation
  pronunciationDictionary.forEach(entry => {
    // Create regex to match the word with word boundaries
    // The 'i' flag makes it case-insensitive
    const regex = new RegExp(`\\b${entry.word}\\b`, 'gi');
    
    // Create the phonetic representation with the specified format:
    // <<p|h|o|n|e|m|e|s>>
    const phoneticRepresentation = `<<${entry.phonemes.join('|')}>>`; 
    
    // Replace all occurrences of the word with its phonetic representation
    result = result.replace(regex, phoneticRepresentation);
  });
  
  return result;
} 