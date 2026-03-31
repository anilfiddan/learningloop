/**
 * POST /api/generate/audio
 *
 * Generate TTS audio using Wiro (google/gemini-2-5-tts)
 */

export const runtime = "nodejs";

import { wiroRunMultipart } from "@/lib/wiro";
import { buildTtsSyllablePrompt, buildTtsWordPrompt, type Lang } from "@/lib/prompts";

// Voice options for Gemini TTS
const VOICES: Record<Lang, string> = {
  tr: "Achernar",
  en: "Achernar",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, syllables, lang = "tr" } = body as {
      word?: string;
      syllables?: string[];
      lang?: Lang;
    };

    if (!word || !syllables || syllables.length === 0) {
      return Response.json(
        { error: { message: "Word and syllables are required" } },
        { status: 400 }
      );
    }

    // Input validation & sanitization
    const sanitize = (s: string) => s.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâêîôûÂÊÎÔÛ0-9\s·\-']/g, '').trim().slice(0, 100);
    const cleanWord = sanitize(word);
    const cleanSyllables = syllables.map((s: string) => sanitize(s)).filter(Boolean);

    if (!cleanWord || cleanSyllables.length === 0) {
      return Response.json(
        { error: { message: "Invalid word or syllables" } },
        { status: 400 }
      );
    }

    const validLang: Lang = ["tr", "en"].includes(lang) ? lang : "tr";
    const voice = VOICES[validLang];

    // Generate TTS for each syllable (parallel)
    const syllablePromises = cleanSyllables.map(async (syllable: string) => {
      try {
        const data = await wiroRunMultipart("google/gemini-2-5-tts", {
          prompt: buildTtsSyllablePrompt(syllable, validLang),
          voice,
        }) as Record<string, unknown>;

        const audioUrl =
          (data?.url as string) ||
          ((data?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string) ||
          "";

        return { syllable, audioUrl };
      } catch (err) {
        console.error(`TTS error for syllable "${syllable}":`, err);
        return { syllable, audioUrl: "" };
      }
    });

    // Generate TTS for full word
    const wordPromise = (async () => {
      try {
        const data = await wiroRunMultipart("google/gemini-2-5-tts", {
          prompt: buildTtsWordPrompt(cleanWord, validLang),
          voice,
        }) as Record<string, unknown>;

        return (data?.url as string) ||
          ((data?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string) ||
          "";
      } catch (err) {
        console.error(`TTS error for word "${cleanWord}":`, err);
        return "";
      }
    })();

    // Wait for all TTS generations
    const [syllableResults, wordNormalUrl] = await Promise.all([
      Promise.all(syllablePromises),
      wordPromise,
    ]);

    const syllableAudios = syllableResults.map(r => ({
      syllable: r.syllable,
      audioUrl: r.audioUrl,
    }));

    const isFallback = !wordNormalUrl && syllableAudios.every(s => !s.audioUrl);

    return Response.json({
      syllableAudios,
      wordAudioUrl: wordNormalUrl,
      isFallback,
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("AUDIO_ERR:", error?.message ?? e);
    return Response.json({
      syllableAudios: [],
      wordAudioUrl: "",
      isFallback: true,
      error: { message: error?.message ?? "Audio generation failed" },
    });
  }
}
