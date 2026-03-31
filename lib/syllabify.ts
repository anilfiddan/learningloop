const TURKISH_VOWELS = new Set(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'A', 'E', 'I', 'İ', 'O', 'Ö', 'U', 'Ü']);

function isVowel(char: string): boolean {
  return TURKISH_VOWELS.has(char);
}

function isConsonant(char: string): boolean {
  return /[a-zA-ZçğşÇĞŞ]/.test(char) && !isVowel(char);
}

export function syllabifyTurkish(word: string): string[] {
  if (!word || word.length === 0) return [];
  
  const chars = word.toLowerCase().split('');
  const syllables: string[] = [];
  let currentSyllable = '';
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];
    const nextNextChar = chars[i + 2];
    
    currentSyllable += char;
    
    if (isVowel(char)) {
      // Check what comes after the vowel
      if (i === chars.length - 1) {
        // Last character, end syllable
        syllables.push(currentSyllable);
        currentSyllable = '';
      } else if (isVowel(nextChar)) {
        // Two vowels in a row, split here
        syllables.push(currentSyllable);
        currentSyllable = '';
      } else if (isConsonant(nextChar)) {
        if (!nextNextChar) {
          // Consonant is last char, include it
          currentSyllable += nextChar;
          i++;
          syllables.push(currentSyllable);
          currentSyllable = '';
        } else if (isVowel(nextNextChar)) {
          // CV pattern ahead, split here
          syllables.push(currentSyllable);
          currentSyllable = '';
        } else if (isConsonant(nextNextChar)) {
          // Two consonants ahead, take first consonant
          currentSyllable += nextChar;
          i++;
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
      }
    }
  }
  
  // Add any remaining characters
  if (currentSyllable) {
    if (syllables.length > 0 && !currentSyllable.split('').some(c => isVowel(c))) {
      // No vowel in remaining, attach to last syllable
      syllables[syllables.length - 1] += currentSyllable;
    } else if (syllables.length === 0) {
      // Word with no vowels or starts with consonants only - push as single syllable
      syllables.push(currentSyllable);
    } else {
      syllables.push(currentSyllable);
    }
  }
  
  return syllables.filter(s => s.length > 0);
}

export function formatSyllables(syllables: string[]): string {
  return syllables.join(' · ');
}
