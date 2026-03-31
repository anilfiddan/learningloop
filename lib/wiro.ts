/**
 * Wiro AI HTTP Client for LearningLoop
 * 
 * README - Environment Variables Setup
 * =====================================
 * Create a .env.local file in your project root (DO NOT COMMIT THIS FILE).
 * Add the following required variables:
 * 
 * WIRO_BASE_URL=https://api.wiro.ai
 * WIRO_API_KEY=your_api_key_here
 * WIRO_API_SECRET=your_api_secret_here
 * 
 * Optional model IDs (defaults shown):
 * WIRO_LLM_MODEL_ID=google/gemma-2-2b-it
 * WIRO_IMAGE_MODEL_ID=google/nano-banana-pro
 * WIRO_VIDEO_MODEL_ID=veo
 * WIRO_TTS_MODEL_ID=google/gemini-2.5-tts
 * WIRO_STT_MODEL_ID=elevenlabs/speech-to-text
 * ENABLE_STT=true
 */

import crypto from "crypto";

// Default timeout in milliseconds
const REQUEST_TIMEOUT = 60000;

// Environment variable getters
export function getWiroBaseUrl(): string {
  const url = process.env.WIRO_BASE_URL;
  if (!url) {
    throw new Error("WIRO_BASE_URL is not configured");
  }
  return url;
}

export function getWiroApiKey(): string {
  const key = process.env.WIRO_API_KEY;
  if (!key) {
    throw new Error("WIRO_API_KEY is not configured");
  }
  return key;
}

export function getWiroApiSecret(): string {
  const secret = process.env.WIRO_API_SECRET;
  if (!secret) {
    throw new Error("WIRO_API_SECRET is not configured");
  }
  return secret;
}

/**
 * Generate Wiro API headers with HMAC-SHA256 signature
 * Docs: HMAC-SHA256(key=API_KEY, message=API_SECRET + nonce)
 */
export function wiroHeaders(nonce?: string): Record<string, string> {
  const apiKey = getWiroApiKey();
  const apiSecret = getWiroApiSecret();
  const n = nonce ?? String(Date.now());

  const signature = crypto
    .createHmac("sha256", apiKey)
    .update(apiSecret + n)
    .digest("hex");

  return {
    "x-api-key": apiKey,
    "x-nonce": n,
    "x-signature": signature,
  };
}

// Model IDs
export function getLlmModelId(): string {
  return process.env.WIRO_LLM_MODEL_ID || "google/gemma-2-2b-it";
}

export function getImageModelId(): string {
  return process.env.WIRO_IMAGE_MODEL_ID || "google/nano-banana-pro";
}

export function getVideoModelId(): string {
  return process.env.WIRO_VIDEO_MODEL_ID || "veo";
}

export function getTtsModelId(): string {
  return process.env.WIRO_TTS_MODEL_ID || "google/gemini-2.5-tts";
}

export function getSttModelId(): string {
  return process.env.WIRO_STT_MODEL_ID || "elevenlabs/speech-to-text";
}

export function isSttEnabled(): boolean {
  return process.env.ENABLE_STT === "true";
}

// Endpoint paths
export function getChatPath(): string {
  return process.env.WIRO_CHAT_PATH || "/chat/completions";
}

export function getImagePath(): string {
  return process.env.WIRO_IMAGE_PATH || "/images/generations";
}

export function getVideoPath(): string {
  return process.env.WIRO_VIDEO_PATH || "/video/generations";
}

export function getTtsPath(): string {
  return process.env.WIRO_TTS_PATH || "/audio/tts";
}

export function getSttPath(): string {
  return process.env.WIRO_STT_PATH || "/audio/stt";
}

/**
 * Validate required environment variables
 * Throws an error with safe message (no secrets exposed)
 */
export function assertEnv(): void {
  const baseUrl = getWiroBaseUrl();
  const apiKey = getWiroApiKey();
  const apiSecret = getWiroApiSecret();

  if (!baseUrl) {
    throw new Error("WIRO_BASE_URL environment variable is not set");
  }

  if (!apiKey) {
    throw new Error("WIRO_API_KEY environment variable is not set");
  }

  if (!apiSecret) {
    throw new Error("WIRO_API_SECRET environment variable is not set");
  }
}

/**
 * Check if Wiro is configured (for optional fallback behavior)
 */
export function isWiroConfigured(): boolean {
  try {
    assertEnv();
    return true;
  } catch {
    return false;
  }
}

/**
 * Make a JSON POST request to Wiro API
 * @param path - API endpoint path (e.g., "/chat/completions")
 * @param body - Request body object
 * @returns Parsed JSON response
 */
export async function wiroJson<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  assertEnv();

  const baseUrl = getWiroBaseUrl();
  const apiKey = getWiroApiKey();
  const url = `${baseUrl}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const headers = wiroHeaders();
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Wiro API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.message) {
          errorMessage = `Wiro API error: ${errorData.error.message}`;
        } else if (errorData.message) {
          errorMessage = `Wiro API error: ${errorData.message}`;
        } else {
          errorMessage = `Wiro API error: ${response.status} - ${errorText}`;
        }
      } catch {
        errorMessage = `Wiro API error: ${response.status} - ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Wiro API request timed out after 60 seconds");
      }
      // Re-throw with safe message (no API key exposure)
      throw new Error(error.message.replace(apiKey, "[REDACTED]"));
    }
    throw new Error("Unknown error during Wiro API request");
  }
}

/**
 * Make a multipart/form-data POST request to Wiro API
 * @param path - API endpoint path
 * @param formData - FormData object
 * @returns Parsed JSON response
 */
export async function wiroMultipart<T = Record<string, unknown>>(
  path: string,
  formData: FormData
): Promise<T> {
  assertEnv();

  const baseUrl = getWiroBaseUrl();
  const apiKey = getWiroApiKey();
  const url = `${baseUrl}${path}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const headers = wiroHeaders();
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Wiro API error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error?.message) {
          errorMessage = `Wiro API error: ${errorData.error.message}`;
        } else if (errorData.message) {
          errorMessage = `Wiro API error: ${errorData.message}`;
        }
      } catch {
        // Ignore JSON parse errors for error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Wiro API request timed out after 60 seconds");
      }
      throw new Error(error.message.replace(apiKey, "[REDACTED]"));
    }
    throw new Error("Unknown error during Wiro API request");
  }
}

// ===========================================
// Wiro Task API
// ===========================================

export type WiroRunResponse = Record<string, unknown>;

export interface WiroTaskResponse {
  taskid?: string;
  socketaccesstoken?: string;
  result?: boolean;
  errors?: Array<{ message: string }>;
}

export interface WiroTaskDetailResponse {
  status?: string;
  output?: string;
  result?: boolean;
  errors?: Array<{ message: string }>;
  [key: string]: unknown;
}

/**
 * Get task detail from Wiro API
 * Used to poll for async task completion
 */
export async function wiroGetTaskDetail(taskToken: string): Promise<WiroTaskDetailResponse> {
  assertEnv();
  
  const base = getWiroBaseUrl().replace(/\/+$/, "");
  const url = `${base}/v1/Task/Detail`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      ...wiroHeaders(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tasktoken: taskToken }),
  });

  const text = await res.text();

  let data: WiroTaskDetailResponse = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text } as WiroTaskDetailResponse;
  }

  if (!res.ok) {
    throw new Error(`Wiro Task Detail failed (${res.status}): ${JSON.stringify(data).slice(0, 500)}`);
  }

  return data;
}

/**
 * Poll for task completion with timeout
 * @param taskToken - The task token from wiroRunMultipart response
 * @param maxWaitMs - Maximum time to wait (default 60 seconds)
 * @param pollIntervalMs - Polling interval (default 2 seconds)
 */
export async function wiroWaitForTask(
  taskToken: string,
  maxWaitMs = 120000,  // 2 minutes for video generation
  pollIntervalMs = 3000
): Promise<WiroTaskDetailResponse> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitMs) {
    const detail = await wiroGetTaskDetail(taskToken);
    
    // Response format: { tasklist: [{ id, status, outputs: [...], ... }] }
    const tasklist = detail.tasklist as Array<Record<string, unknown>> | undefined;
    const task = tasklist?.[0];
    
    const taskStatus = task?.status as string | undefined;
    const outputs = task?.outputs as Array<Record<string, unknown>> | undefined;
    
    // Check if task is completed: status contains "end" or "completed"
    // task_end = processing done, task_postprocess_end = post-processing done
    const isCompleted = taskStatus === "task_postprocess_end" ||
                        taskStatus === "task_end" ||
                        taskStatus?.includes("completed") || 
                        taskStatus?.includes("done");
    
    if (isCompleted) {
      // Extract output URL from outputs array
      const outputUrl = outputs?.[0]?.url as string | undefined;
      
      // For LLM tasks, check multiple possible output locations
      const debugOutput = task?.debugoutput as string | undefined;
      const taskOutput = task?.output as string | undefined;
      const taskResult = task?.result as string | undefined;
      const taskResponse = task?.response as string | undefined;
      
      // Log all task fields to debug
      // Check outputs array for content
      let textOutput = "";
      if (outputs && outputs.length > 0) {
        const firstOutput = outputs[0];
        const contentType = firstOutput.contenttype as string | undefined;
        const outputFileUrl = firstOutput.url as string | undefined;
        const outputName = firstOutput.name as string | undefined;
        
        // Fetch text/json content (for STT, LLM outputs)
        const isTextContent = contentType?.includes("text") || 
                              contentType?.includes("json") ||
                              outputName?.endsWith(".json") ||
                              outputName?.endsWith(".txt");
        
        // Also check if it's NOT an image/video/audio binary
        const isBinaryContent = contentType?.includes("image") || 
                                contentType?.includes("video") ||
                                contentType?.includes("audio") ||
                                outputName?.match(/\.(png|jpg|jpeg|gif|mp4|webm|mp3|wav)$/i);
        
        if (outputFileUrl && (isTextContent || !isBinaryContent)) {
          try {
            const textRes = await fetch(outputFileUrl);
            if (textRes.ok) {
              textOutput = await textRes.text();
            }
          } catch (fetchErr) {
          }
        }
      }
      
      // Use first available output
      const finalOutput = textOutput || taskOutput || taskResult || taskResponse || "";

      return { 
        ...detail, 
        status: taskStatus,
        output: finalOutput,
        raw: finalOutput,
        text: finalOutput,
        url: outputUrl,
        outputs,
        task,
      };
    }
    
    // Check for errors
    if (taskStatus?.includes("failed") || taskStatus?.includes("error") || taskStatus?.includes("cancel")) {
      const debugError = task?.debugerror as string | undefined;
      throw new Error(`Wiro task failed: ${debugError || taskStatus}`);
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }
  
  throw new Error(`Wiro task timed out after ${maxWaitMs}ms`);
}

/**
 * Run a Wiro model with multipart form data
 * This is the main API for all Wiro AI operations
 * 
 * @param modelPath - Model path (e.g., "google/gemma-2-2b-it", "google/nano-banana-pro")
 * @param fields - Form fields to send (prompt, resolution, etc.)
 * @returns Parsed JSON response from Wiro API
 */
export async function wiroRunMultipart(
  modelPath: string,
  fields: Record<string, unknown>
): Promise<WiroRunResponse> {
  assertEnv();
  
  const base = getWiroBaseUrl().replace(/\/+$/, "");
  const url = `${base}/v1/Run/${modelPath}`;

  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;

    // If it's a File/Blob, append as file
    if (typeof File !== "undefined" && v instanceof File) {
      fd.append(k, v);
    } else if (typeof Blob !== "undefined" && v instanceof Blob) {
      fd.append(k, v);
    } else {
      fd.append(k, String(v));
    }
  }

  // Add timeout to multipart requests
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: wiroHeaders(),
      body: fd,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  let data: WiroRunResponse = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`Wiro Run failed (${res.status}): ${JSON.stringify(data).slice(0, 1200)}`);
  }

  // If async task (has socketaccesstoken), poll for completion
  const taskToken = data.socketaccesstoken as string | undefined;
  if (taskToken) {
    const taskResult = await wiroWaitForTask(taskToken);
    
    // Return the output text or fetch from URL
    const output = taskResult.output as string | undefined;
    if (output) {
      return { raw: output, text: output };
    }
    
    // If output URL exists, it's already fetched in wiroWaitForTask
    return taskResult;
  }

  return data;
}

/**
 * Run command request options (legacy interface)
 */
export interface WiroRunOptions {
  kind: "json" | "multipart";
  body: Record<string, unknown>;
  formData?: FormData;
}

/**
 * Wiro run command response (legacy interface)
 */
export interface WiroRunResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  url?: string;
  text?: string;
  transcript?: string;
  content?: string;
}

/**
 * Execute a Wiro run-command and wait for result (uses wiroRunMultipart + polling)
 * 
 * @example
 * const result = await wiroRunAndWait({
 *   kind: "multipart",
 *   body: { model: "google/gemma-2-2b-it", prompt: "Hello" },
 * });
 */
export async function wiroRunAndWait<T = Record<string, unknown>>(
  options: WiroRunOptions
): Promise<WiroRunResult<T>> {
  try {
    const model = options.body.model as string;
    if (!model) {
      throw new Error("Model is required in body");
    }

    // Remove model from fields since it's in the URL path
    const { model: _, ...fields } = options.body;
    
    // Step 1: Submit the task
    const submitResponse = await wiroRunMultipart(model, fields);
    
    // Check if we got a task token (async task)
    const taskToken = submitResponse.socketaccesstoken as string | undefined;
    
    if (!taskToken) {
      // Synchronous response - return directly
      return extractWiroResult<T>(submitResponse);
    }
    
    // Step 2: Poll for task completion
    const taskDetail = await wiroWaitForTask(taskToken);
    
    return extractWiroResult<T>(taskDetail);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Extract common fields from Wiro response
 */
function extractWiroResult<T>(response: Record<string, unknown>): WiroRunResult<T> {
  const result: WiroRunResult<T> = {
    success: true,
    data: response as T,
  };

  // Try to extract URL from various locations
  if (typeof response.url === "string") {
    result.url = response.url;
  } else if (typeof response.outputUrl === "string") {
    result.url = response.outputUrl;
  }
  
  // Check outputs array (Wiro task format)
  const outputs = response.outputs as Array<Record<string, unknown>> | undefined;
  if (outputs && outputs[0]) {
    const firstOutput = outputs[0];
    if (typeof firstOutput.url === "string") {
      result.url = firstOutput.url;
    }
  }
  
  // Check task object for LLM output
  const task = response.task as Record<string, unknown> | undefined;
  if (task) {
    // LLM output might be in debugoutput
    const debugOutput = task.debugoutput as string | undefined;
    if (debugOutput && debugOutput.length > 0) {
      result.text = debugOutput;
      result.content = debugOutput;
    }
    
    // Check outputs inside task
    const taskOutputs = task.outputs as Array<Record<string, unknown>> | undefined;
    if (taskOutputs && taskOutputs[0]) {
      const firstOutput = taskOutputs[0];
      if (typeof firstOutput.url === "string" && !result.url) {
        result.url = firstOutput.url;
      }
    }
  }

  // Try to extract text/output from direct fields
  if (typeof response.text === "string") {
    result.text = response.text;
  } else if (typeof response.transcript === "string") {
    result.transcript = response.transcript;
  } else if (typeof response.output_text === "string") {
    result.text = response.output_text;
  } else if (typeof response.output === "string" && response.output.length > 0) {
    result.text = response.output;
    result.content = response.output;
  }

  // Extract LLM content from OpenAI-style format
  if (response.choices && Array.isArray(response.choices) && response.choices[0]) {
    const choice = response.choices[0] as Record<string, unknown>;
    if (choice.message && typeof choice.message === "object") {
      const message = choice.message as Record<string, unknown>;
      if (typeof message.content === "string") {
        result.content = message.content;
      }
    }
  }

  return result;
}

// ===========================================
// Convenience wrappers for common commands
// ===========================================

/**
 * Generate image using Wiro run-command
 */
export async function wiroGenerateImage(prompt: string, size = "1024x1024"): Promise<WiroRunResult> {
  return wiroRunAndWait({
    kind: "json",
    body: {
      command: "image.generate",
      model: getImageModelId(),
      prompt,
      size,
    },
  });
}

/**
 * Generate video using Wiro run-command
 */
export async function wiroGenerateVideo(prompt: string, durationSeconds = 4): Promise<WiroRunResult> {
  return wiroRunAndWait({
    kind: "json",
    body: {
      command: "video.generate",
      model: getVideoModelId(),
      prompt,
      duration_seconds: durationSeconds,
      loop: true,
    },
  });
}

/**
 * Generate TTS audio using Wiro run-command
 */
export async function wiroGenerateTts(
  text: string,
  language: string,
  speed: "slow" | "normal" = "normal"
): Promise<WiroRunResult> {
  return wiroRunAndWait({
    kind: "json",
    body: {
      command: "tts.generate",
      model: getTtsModelId(),
      text,
      language,
      speed,
      rate: speed === "slow" ? 0.7 : 1.0,
    },
  });
}

/**
 * Run LLM chat completion using Wiro run-command
 */
export async function wiroChat(
  messages: Array<{ role: string; content: string }>,
  temperature = 0.2
): Promise<WiroRunResult> {
  return wiroRunAndWait({
    kind: "json",
    body: {
      command: "llm.chat",
      model: getLlmModelId(),
      messages,
      temperature,
    },
  });
}

/**
 * Run STT transcription using Wiro run-command
 */
export async function wiroTranscribe(audioFile: File, language: string): Promise<WiroRunResult> {
  const formData = new FormData();
  formData.append("command", "stt.transcribe");
  formData.append("model", getSttModelId());
  formData.append("language", language);
  formData.append("file", audioFile);

  return wiroRunAndWait({
    kind: "multipart",
    body: {},
    formData,
  });
}
