/**
 * Text utilities for LearningLoop
 * - normalizeText: lowercase, trim, remove punctuation
 * - levenshtein: edit distance
 * - matchPct: similarity percentage
 * - safeJsonParseLLM: extract and parse JSON from LLM output
 */

/**
 * Normalize text for comparison
 * - lowercase
 * - trim whitespace
 * - remove punctuation (preserving Turkish chars)
 * - collapse multiple spaces
 */
export function normalizeText(s: string): string {
  if (!s) return "";
  
  return s
    .toLowerCase()
    .trim()
    // Remove punctuation but keep letters (including Turkish chars) and numbers
    .replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\s]/g, "")
    // Collapse multiple spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Levenshtein edit distance between two strings
 */
export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate match percentage between target and transcript
 * Returns 0-100
 */
export function matchPct(target: string, transcript: string): number {
  const normTarget = normalizeText(target);
  const normTranscript = normalizeText(transcript);

  if (!normTarget || !normTranscript) return 0;
  if (normTarget === normTranscript) return 100;

  const distance = levenshtein(normTarget, normTranscript);
  const maxLen = Math.max(normTarget.length, normTranscript.length);

  if (maxLen === 0) return 100;

  const similarity = 1 - distance / maxLen;
  // Clamp to 0-100 range to handle edge cases
  return Math.max(0, Math.min(100, Math.round(similarity * 100)));
}

/**
 * Safely parse JSON from LLM output
 * Extracts the first JSON object found in the text
 * Handles markdown code blocks and extra text
 */
export function safeJsonParseLLM<T = Record<string, unknown>>(text: string): T {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid input: expected non-empty string");
  }

  // Remove markdown code blocks if present
  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // Try to find JSON object boundaries using indexOf (safe, no regex ReDoS)
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No valid JSON object found in LLM response");
  }

  // Limit extracted JSON size to prevent abuse
  const jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  if (jsonStr.length > 50000) {
    throw new Error("JSON response too large");
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    // Try to fix common LLM JSON issues
    const fixed = jsonStr
      // Fix trailing commas
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      // Fix unquoted keys (simple cases)
      .replace(/(\{|,)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

    try {
      return JSON.parse(fixed) as T;
    } catch {
      throw new Error(`Failed to parse JSON from LLM response: ${(e as Error).message}`);
    }
  }
}

/**
 * Extract content from various LLM response shapes
 */
export function extractLLMContent(data: Record<string, unknown>): string {
  // OpenAI-style: choices[0].message.content
  if (data.choices && Array.isArray(data.choices) && data.choices[0]) {
    const choice = data.choices[0] as Record<string, unknown>;
    if (choice.message && typeof choice.message === "object") {
      const message = choice.message as Record<string, unknown>;
      if (typeof message.content === "string") {
        return message.content;
      }
    }
    // Alternative: choices[0].text
    if (typeof choice.text === "string") {
      return choice.text;
    }
  }

  // Direct output_text
  if (typeof data.output_text === "string") {
    return data.output_text;
  }

  // Direct text
  if (typeof data.text === "string") {
    return data.text;
  }

  // Direct content
  if (typeof data.content === "string") {
    return data.content;
  }

  throw new Error("Could not extract content from LLM response");
}

/**
 * Extract URL from various API response shapes
 */
export function extractUrl(data: Record<string, unknown>, fieldNames: string[] = ["url"]): string {
  // Check direct fields
  for (const field of fieldNames) {
    if (typeof data[field] === "string" && data[field]) {
      return data[field] as string;
    }
  }

  // Check data[0].url pattern
  if (data.data && Array.isArray(data.data) && data.data[0]) {
    const first = data.data[0] as Record<string, unknown>;
    for (const field of fieldNames) {
      if (typeof first[field] === "string" && first[field]) {
        return first[field] as string;
      }
    }
  }

  // Check output[0].url pattern
  if (data.output && Array.isArray(data.output) && data.output[0]) {
    const first = data.output[0] as Record<string, unknown>;
    for (const field of fieldNames) {
      if (typeof first[field] === "string" && first[field]) {
        return first[field] as string;
      }
    }
  }

  throw new Error(`Could not extract URL from response. Tried fields: ${fieldNames.join(", ")}`);
}
