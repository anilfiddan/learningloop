/**
 * POST /api/generate/visual
 *
 * Generate visual cue image using Wiro Image API (google/nano-banana-pro)
 */

export const runtime = "nodejs";

import { wiroRunMultipart } from "@/lib/wiro";
import { buildImagePrompt, type Lang } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { word, lang = "tr", image_prompt, definition } = body as {
      word?: string;
      lang?: Lang;
      image_prompt?: string;
      definition?: string;
    };

    if (!word || typeof word !== "string") {
      return Response.json({ error: { message: "word is required" } }, { status: 400 });
    }

    // Sanitize inputs
    const cleanWord = word.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâêîôûÂÊÎÔÛ0-9\s]/g, '').trim().slice(0, 100);
    if (!cleanWord) {
      return Response.json({ error: { message: "Invalid word" } }, { status: 400 });
    }

    const validLang: Lang = lang && ["tr", "en"].includes(lang) ? lang : "tr";

    // Build base idea from provided prompt or definition
    const sanitize = (s: string) => s.replace(/[{}"\\]/g, '').slice(0, 500);
    const baseIdea = sanitize(
      image_prompt || definition || `A clear, recognizable representation of "${cleanWord}".`
    );

    const prompt = buildImagePrompt(cleanWord, validLang, baseIdea);

    const data = await wiroRunMultipart("google/nano-banana-pro", {
      prompt,
      resolution: "1K",
    }) as Record<string, unknown>;

    const imageUrl =
      (data?.url as string) ||
      ((data?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string) ||
      ((data?.output as Record<string, unknown>)?.url as string) ||
      ((data?.task as Record<string, unknown>)?.outputs as Array<Record<string, unknown>>)?.[0]?.url as string ||
      "";

    return Response.json({ imageUrl, isFallback: !imageUrl });
  } catch (e: unknown) {
    const error = e as Error;
    console.error("VISUAL_ERR:", error?.message ?? e);
    return Response.json({ error: { message: error?.message ?? "Visual generation failed" } }, { status: 500 });
  }
}
