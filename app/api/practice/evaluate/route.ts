/**
 * POST /api/practice/evaluate
 *
 * Evaluate a practice attempt using LLM coach
 */

export const runtime = "nodejs";

import { wiroRunMultipart } from "@/lib/wiro";
import { buildEvaluationPrompt, type Lang, type EvaluationInput } from "@/lib/prompts";

type Verdict = "great" | "close" | "retry";

interface SyllableCheck {
  syllable: string;
  ok: boolean;
  hint: string;
}

interface EvaluationResponse {
  verdict: Verdict;
  syllableChecks: SyllableCheck[];
  coachTip: string;
}

function safeExtractJson(data: unknown): EvaluationResponse | null {
  try {
    let text = "";

    if (typeof data === "string") {
      text = data;
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      text = (obj.raw as string) || (obj.text as string) || (obj.output as string) || JSON.stringify(data);
    }

    // Find JSON in text using safe string search (no regex ReDoS)
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    const parsed = JSON.parse(text.slice(start, end + 1));

    const verdict = parsed.verdict as Verdict;
    if (!["great", "close", "retry"].includes(verdict)) return null;

    const syllableChecks: SyllableCheck[] = (parsed.syllable_checks || []).map((sc: Record<string, unknown>) => ({
      syllable: String(sc.syllable || ""),
      ok: Boolean(sc.ok),
      hint: String(sc.hint || ""),
    }));

    return {
      verdict,
      syllableChecks,
      coachTip: String(parsed.coach_tip || ""),
    };
  } catch {
    return null;
  }
}

function generateFallbackResponse(req: EvaluationInput): EvaluationResponse {
  const isTurkish = req.lang === "tr";

  let verdict: Verdict;
  if (req.matchPct >= 90) verdict = "great";
  else if (req.matchPct >= 70) verdict = "close";
  else verdict = "retry";

  const syllableChecks: SyllableCheck[] = req.syllables.map((syllable) => ({
    syllable,
    ok: req.matchPct >= 70,
    hint: req.matchPct < 70
      ? (isTurkish ? "Bu heceyi birlikte tekrar deneyelim" : "Let's try this syllable together")
      : "",
  }));

  const tips = {
    great: {
      tr: "Muhteşem! Her heceyi harika söyledin, devam et!",
      en: "Awesome! You nailed every syllable, keep going!",
    },
    close: {
      tr: "Çok yaklaştın! Bir kez daha dene, başarılacaksın!",
      en: "So close! One more try and you'll have it!",
    },
    retry: {
      tr: "Bu kelime biraz zor, ama birlikte çözeceğiz! Hece hece deneyelim.",
      en: "This one's tricky, but we'll crack it together! Let's go syllable by syllable.",
    },
  };

  return {
    verdict,
    syllableChecks,
    coachTip: tips[verdict][req.lang],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { targetWord, syllables, transcript, matchPct, lang } = body as {
      targetWord?: string;
      syllables?: string[];
      transcript?: string;
      matchPct?: number;
      lang?: Lang;
    };

    if (!targetWord || !syllables || syllables.length === 0) {
      return Response.json(
        { error: { message: "targetWord and syllables are required" } },
        { status: 400 }
      );
    }

    if (typeof transcript !== "string") {
      return Response.json(
        { error: { message: "transcript must be a string" } },
        { status: 400 }
      );
    }

    const pct = Number(matchPct);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return Response.json(
        { error: { message: "matchPct must be between 0 and 100" } },
        { status: 400 }
      );
    }

    if (lang && !["tr", "en"].includes(lang)) {
      return Response.json(
        { error: { message: "Invalid language" } },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedInput: EvaluationInput = {
      targetWord: targetWord.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâêîôûÂÊÎÔÛ0-9\s]/g, '').slice(0, 100),
      syllables,
      transcript: transcript.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜâêîôûÂÊÎÔÛ0-9\s]/g, '').slice(0, 500),
      matchPct: pct,
      lang: (lang as Lang) || "tr",
    };

    const prompt = buildEvaluationPrompt(sanitizedInput);

    try {
      const data = await wiroRunMultipart("google/gemini-2-5-flash", { prompt });
      const evaluation = safeExtractJson(data);
      if (evaluation) return Response.json(evaluation);
    } catch (error) {
      console.error("[Evaluate] Wiro error:", error);
    }

    // Fallback
    return Response.json(generateFallbackResponse(sanitizedInput));
  } catch (error) {
    console.error("[Evaluate] Error:", error);
    return Response.json(
      { error: { message: "Evaluation failed" } },
      { status: 500 }
    );
  }
}
