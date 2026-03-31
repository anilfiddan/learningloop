/**
 * POST /api/generate/strategy
 *
 * Generate pronunciation strategy using Wiro LLM (google/gemini-2-5-flash)
 */

export const runtime = "nodejs";

import { wiroRunMultipart } from "@/lib/wiro";
import { buildStrategyPrompt, type Lang, type Mode, type Level } from "@/lib/prompts";

function safeExtractJson(anyData: unknown): Record<string, unknown> {
  const text = typeof anyData === "string"
    ? anyData
    : ((anyData as Record<string, unknown>)?.raw as string)
      ?? ((anyData as Record<string, unknown>)?.text as string)
      ?? JSON.stringify(anyData);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("LLM did not return JSON");
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, lang, mode, level } = body as {
      word?: string;
      lang?: Lang;
      mode?: Mode;
      level?: Level;
    };

    if (!word || typeof word !== "string") {
      return Response.json({ error: { message: "word is required" } }, { status: 400 });
    }

    // Sanitize word
    const cleanWord = word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâêîôûÂÊÎÔÛ0-9\s]/g, '').trim().toLowerCase().slice(0, 100);
    if (!cleanWord) {
      return Response.json({ error: { message: "Invalid word" } }, { status: 400 });
    }

    // Validate params
    const validLang: Lang = lang && ["tr", "en"].includes(lang) ? lang : "tr";
    const validMode: Mode = mode && ["speech", "language"].includes(mode) ? mode : "speech";
    const validLevel: Level = level && ["beginner", "intermediate"].includes(level) ? level : "beginner";

    const prompt = buildStrategyPrompt({ word: cleanWord, lang: validLang, mode: validMode, level: validLevel });

    const data = await wiroRunMultipart("google/gemini-2-5-flash", { prompt });
    const out = safeExtractJson(data);

    return Response.json({
      word: cleanWord,
      syllables: out.syllables,
      definition: out.short_definition,
      coachingTip: out.coach_tip,
      level: validLevel,
      lang: validLang,
      mode: validMode,
      image_prompt: out.image_prompt,
      video_prompt: out.video_prompt,
      tts_syllable_texts: out.tts_syllable_texts,
      tts_word_text: out.tts_word_text,
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("STRATEGY_ERR:", error?.message ?? e);
    return Response.json(
      { error: { message: error?.message ?? "Strategy generation failed" } },
      { status: 500 }
    );
  }
}
