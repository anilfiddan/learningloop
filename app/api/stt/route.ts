/**
 * POST /api/stt
 * 
 * Speech-to-text using Wiro ElevenLabs model
 * Model: elevenlabs/speech-to-text
 * 
 * API Documentation:
 * - Run Task: POST https://api.wiro.ai/v1/Run/elevenlabs/speech-to-text
 * - Get Task Detail: POST https://api.wiro.ai/v1/Task/Detail
 * - Input: inputAudio (audio file directly)
 * - Completed statuses: task_postprocess_end, task_cancel
 * - Running statuses: task_queue, task_accept, task_assign, task_preprocess_start, 
 *                     task_preprocess_end, task_start, task_output
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const WIRO_BASE_URL = "https://api.wiro.ai";
const STT_MODEL = "elevenlabs/speech-to-text";
const MAX_POLL_TIME_MS = 60000; // 60 seconds
const POLL_INTERVAL_MS = 2000; // 2 seconds

// Completed task statuses (stop polling)
const COMPLETED_STATUSES = ["task_postprocess_end", "task_cancel"];

// Running task statuses (continue polling)
const RUNNING_STATUSES = [
  "task_queue",
  "task_accept", 
  "task_assign",
  "task_preprocess_start",
  "task_preprocess_end",
  "task_start",
  "task_output",
];

/**
 * Generate Wiro API headers with HMAC-SHA256 signature
 * Signature: HMAC-SHA256(API_SECRET + NONCE) with API_KEY
 */
function getWiroHeaders(): Record<string, string> {
  const apiKey = process.env.WIRO_API_KEY || "";
  const apiSecret = process.env.WIRO_API_SECRET || "";
  const nonce = String(Date.now());

  const signature = crypto
    .createHmac("sha256", apiKey)
    .update(apiSecret + nonce)
    .digest("hex");

  return {
    "x-api-key": apiKey,
    "x-nonce": nonce,
    "x-signature": signature,
  };
}

/**
 * Submit STT task to Wiro with audio file directly
 * Uses inputAudio key to send the mp3 binary file
 * Returns socketaccesstoken for polling
 */
async function submitSttTask(audioFile: File): Promise<string> {
  const url = `${WIRO_BASE_URL}/v1/Run/${STT_MODEL}`;
  
  // Convert audio to mp3 binary format
  const audioBuffer = await audioFile.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });
  const mp3File = new File([audioBlob], "audio.mp3", { type: "audio/mpeg" });
  
  const formData = new FormData();
  formData.append("inputAudio", mp3File);

  const response = await fetch(url, {
    method: "POST",
    headers: getWiroHeaders(),
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`Task submit failed: ${response.status} - ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  // Response: { errors: [], taskid: "2221", socketaccesstoken: "xxx", result: true }
  if (!data.result) {
    throw new Error(`Task submit failed: ${JSON.stringify(data.errors)}`);
  }

  const taskToken = data.socketaccesstoken;
  if (!taskToken) {
    throw new Error("No socketaccesstoken in response");
  }

  return taskToken;
}

interface TaskDetail {
  status: string;
  outputs?: Array<{ url?: string; name?: string; contenttype?: string }>;
  debugoutput?: string;
  debugerror?: string;
}

/**
 * Get task detail from Wiro
 */
async function getTaskDetail(taskToken: string): Promise<TaskDetail> {
  const url = `${WIRO_BASE_URL}/v1/Task/Detail`;

  const formData = new FormData();
  formData.append("tasktoken", taskToken);

  const response = await fetch(url, {
    method: "POST",
    headers: getWiroHeaders(),
    body: formData,
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    throw new Error(`Task detail failed: ${response.status} - ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText}`);
  }

  // Response: { tasklist: [{ status, outputs, ... }], result: true }
  const task = data.tasklist?.[0];
  if (!task) {
    throw new Error("No task in response");
  }

  return {
    status: task.status || "",
    outputs: task.outputs || [],
    debugoutput: task.debugoutput || "",
    debugerror: task.debugerror || "",
  };
}

/**
 * Poll for task completion
 */
async function pollForCompletion(taskToken: string): Promise<TaskDetail> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_TIME_MS) {
    const detail = await getTaskDetail(taskToken);
    const status = detail.status;

    // Check if completed
    if (COMPLETED_STATUSES.includes(status)) {
      if (status === "task_cancel") {
        throw new Error("Task was cancelled");
      }
      return detail;
    }

    // Check for error statuses
    if (status.includes("error") || status.includes("fail")) {
      throw new Error(`Task failed: ${detail.debugerror || status}`);
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw new Error(`Task timed out after ${MAX_POLL_TIME_MS}ms`);
}

/**
 * Extract transcript from task outputs
 * ElevenLabs returns: { language_code: 'eng', text: 'A dha ba.', words: [...] }
 * Wiro wraps this in debugoutput which may contain additional text
 */
async function extractTranscript(detail: TaskDetail): Promise<string> {
  // Check debugoutput first - ElevenLabs returns JSON here
  if (detail.debugoutput && detail.debugoutput.trim()) {
    // Try to extract JSON from the debugoutput
    // It might be wrapped in other text like "ElevenLabs_SpeechToText response: {...}"
    const debugStr = detail.debugoutput;
    
    // Method 1: Try to find JSON object with "text" field using regex
    const jsonMatch = debugStr.match(/\{[^{}]*"text"\s*:\s*"([^"]*)"[^{}]*\}/);
    if (jsonMatch && jsonMatch[1]) {
      return jsonMatch[1].trim();
    }
    
    // Method 2: Try to find text field directly with regex
    const textMatch = debugStr.match(/text:\s*'([^']+)'/);
    if (textMatch && textMatch[1]) {
      return textMatch[1].trim();
    }
    
    // Method 3: Try to parse as JSON directly
    try {
      const json = JSON.parse(debugStr);
      if (json.text && typeof json.text === "string") {
        return json.text.trim();
      }
      if (json.transcript && typeof json.transcript === "string") {
        return json.transcript.trim();
      }
    } catch {
      // Not valid JSON
    }
    
    // Method 4: Try to find any JSON object in the string
    const jsonObjMatch = debugStr.match(/\{[\s\S]*\}/);
    if (jsonObjMatch) {
      try {
        const json = JSON.parse(jsonObjMatch[0]);
        if (json.text && typeof json.text === "string") {
          return json.text.trim();
        }
      } catch {
        // Ignore parse errors
      }
    }
    
  }

  // Check outputs array for text/json file
  if (detail.outputs && detail.outputs.length > 0) {
    for (const output of detail.outputs) {
      const url = output.url;
      const contentType = output.contenttype || "";

      // Skip binary files
      if (contentType.includes("image") || contentType.includes("video") || contentType.includes("audio")) {
        continue;
      }

      // Fetch text content
      if (url) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const text = await response.text();

            // Try to parse as JSON
            try {
              const json = JSON.parse(text);
              if (json.text && typeof json.text === "string") return json.text.trim();
              if (json.transcript && typeof json.transcript === "string") return json.transcript.trim();
            } catch {
              // Not JSON, return as-is
              return text.trim();
            }
          }
        } catch (err) {
          console.error("[STT] Failed to fetch output:", err);
        }
      }
    }
  }

  return "";
}

export async function POST(request: NextRequest) {
  try {
    // Check if Wiro is configured
    if (!process.env.WIRO_API_KEY || !process.env.WIRO_API_SECRET) {
      console.error("[STT] Wiro API not configured");
      return NextResponse.json(
        { error: { message: "Wiro API not configured" } },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;
    const lang = (formData.get("lang") as string) || "tr";

    if (!audioFile) {
      return NextResponse.json(
        { error: { message: "Audio file is required" } },
        { status: 400 }
      );
    }

    // File size validation (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (audioFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { message: "Audio file too large. Maximum 10MB allowed." } },
        { status: 400 }
      );
    }

    // Validate audio type
    const validTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/mp4'];
    if (audioFile.type && !validTypes.some(t => audioFile.type.includes(t))) {
      return NextResponse.json(
        { error: { message: "Invalid audio format" } },
        { status: 400 }
      );
    }

    // Validate lang
    if (!["tr", "en"].includes(lang)) {
      return NextResponse.json(
        { error: { message: "Invalid language" } },
        { status: 400 }
      );
    }

    // Step 1: Submit STT task with audio file directly (using inputAudio key)
    const taskToken = await submitSttTask(audioFile);

    // Step 2: Poll for completion
    const taskDetail = await pollForCompletion(taskToken);

    // Step 3: Extract transcript
    const transcript = await extractTranscript(taskDetail);

    return NextResponse.json({
      transcript,
      success: true,
    });
  } catch (error) {
    console.error("[STT] Error:", error);
    
    // Return empty transcript on error - frontend will use fallback
    return NextResponse.json({
      transcript: "",
      fallback: true,
      error: error instanceof Error ? error.message : "STT failed",
    });
  }
}
