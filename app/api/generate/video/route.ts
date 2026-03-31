/**
 * POST /api/generate/video
 *
 * Generate video using Wiro (google/veo3-1-fast)
 */

export const runtime = "nodejs";

import { wiroRunMultipart } from "@/lib/wiro";
import { buildVideoPrompt, type Lang } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, lang = "tr", video_prompt, definition, seed } = body as {
      word?: string;
      lang?: Lang;
      video_prompt?: string;
      definition?: string;
      seed?: number;
    };

    if (!word || typeof word !== "string") {
      return Response.json({ error: { message: "word is required" } }, { status: 400 });
    }

    // Sanitize
    const cleanWord = word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâêîôûÂÊÎÔÛ0-9\s]/g, '').trim().slice(0, 100);
    if (!cleanWord) {
      return Response.json({ error: { message: "Invalid word" } }, { status: 400 });
    }

    const validLang: Lang = lang && ["tr", "en"].includes(lang) ? lang : "tr";

    const sanitize = (s: string) => s.replace(/[{}"\\]/g, '').slice(0, 500);
    const baseIdea = sanitize(
      video_prompt || definition || `A simple calm visual cue for "${cleanWord}".`
    );

    const prompt = buildVideoPrompt(cleanWord, validLang, baseIdea);

    const data = await wiroRunMultipart("google/veo3-1-fast", {
      prompt,
      generateAudio: "false",
      aspectRatio: "match_input_image",
      resolution: "720p",
      enhancePrompt: "true",
      personGeneration: "allow_adult",
      durationSeconds: "4",
      ...(seed ? { seed: String(seed) } : {}),
    }) as Record<string, unknown>;

    const videoUrl =
      (data?.url as string) ||
      ((data?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string) ||
      ((data?.output as Record<string, unknown>)?.url as string) ||
      ((data?.task as Record<string, unknown>)?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string ||
      "";

    return Response.json({ videoUrl, isFallback: !videoUrl });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("VIDEO_ERR:", error?.message ?? e);
    return Response.json({ error: { message: error?.message ?? "Video generation failed" } }, { status: 500 });
  }
}
