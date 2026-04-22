import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { checkKeywords } from "@/lib/crisis-detection";
import { logCrisis } from "@/lib/crisis-log";

export const runtime = "edge";

interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

interface CrisisInfo {
  isCrisis: boolean;
  tier?: string | null;
  category?: string | null;
  resource?: string | null;
}

export async function POST(req: Request): Promise<Response> {
  const timestamp = new Date().toISOString();
  let sessionId = "unknown";

  try {
    const body = await req.json();
    const messages: MessageParam[] = body.messages ?? [];
    sessionId = body.sessionId ?? "unknown";

    // ── STEP 1: Pre-call keyword check ───────────────────────────────────────
    const lastUserContent =
      [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    if (checkKeywords(lastUserContent)) {
      logCrisis({
        sessionId,
        triggerLayer: "keyword",
        crisisTier: "tier3",
        crisisCategory: "life-risk",
        transcriptSnippet: messages.slice(-10),
      }).catch((err) => console.error("Crisis log failed:", err));

      return Response.json({
        error: "CRISIS_DETECTED",
        tier: "tier3",
        category: "life-risk",
        skipApi: true,
      });
    }

    // ── STEP 2: Mock mode ─────────────────────────────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      const mockText =
        "Mock mode active — API key pending. This is a placeholder response from Ask OnPoint.";
      const encoder = new TextEncoder();
      const mockStream = new ReadableStream({
        async start(controller) {
          for (const char of mockText) {
            controller.enqueue(encoder.encode(char));
            await new Promise((r) => setTimeout(r, 20));
          }
          controller.close();
        },
      });
      return new Response(mockStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    // ── STEP 3: History cap ───────────────────────────────────────────────────
    const cappedMessages: MessageParam[] =
      messages.length > 20
        ? [messages[0], messages[1], ...messages.slice(-18)]
        : messages;

    // ── STEP 4: Call Claude ───────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const anthropicStream = anthropic.messages.stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: cappedMessages,
    });

    // ── STEP 5 + 6: Stream interception ──────────────────────────────────────
    //
    // We need to inspect the JSON prefix before deciding the response type.
    // Strategy: resolve a promise the moment the JSON line is parsed, then
    // return the appropriate Response (JSON error vs. text/plain stream).
    // The ReadableStream's start() runs concurrently, buffering content
    // until the client starts reading.

    const encoder = new TextEncoder();
    let resolveCrisisInfo!: (info: CrisisInfo) => void;

    const crisisInfoPromise = new Promise<CrisisInfo>((resolve) => {
      resolveCrisisInfo = resolve;
    });

    let controllerClosed = false;

    const outputStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const safeClose = () => {
          if (!controllerClosed) {
            controllerClosed = true;
            controller.close();
          }
        };

        let jsonBuffer = "";
        let jsonResolved = false;

        try {
          for await (const event of anthropicStream) {
            if (
              event.type !== "content_block_delta" ||
              event.delta.type !== "text_delta"
            ) {
              continue;
            }

            const text = event.delta.text;

            // After JSON resolved: stream everything straight through
            if (jsonResolved) {
              controller.enqueue(encoder.encode(text));
              continue;
            }

            jsonBuffer += text;
            const braceIdx = jsonBuffer.indexOf("}");

            if (braceIdx !== -1) {
              try {
                const parsed = JSON.parse(jsonBuffer.slice(0, braceIdx + 1));
                jsonResolved = true;

                resolveCrisisInfo({
                  isCrisis: Boolean(parsed.crisis_detected),
                  tier: parsed.crisis_tier ?? null,
                  category: parsed.crisis_category ?? null,
                  resource: parsed.resource_category ?? null,
                });

                if (parsed.crisis_detected) {
                  // Abort Anthropic connection and close stream — no content sent
                  await anthropicStream.abort();
                  safeClose();
                  return;
                }

                // Strip the JSON line (up to and including the \n after })
                const nlIdx = jsonBuffer.indexOf("\n", braceIdx);
                const remainder =
                  nlIdx !== -1
                    ? jsonBuffer.slice(nlIdx + 1)
                    : jsonBuffer.slice(braceIdx + 1);

                if (remainder) {
                  controller.enqueue(encoder.encode(remainder));
                }
                jsonBuffer = "";
                continue;
              } catch {
                // JSON.parse failed — incomplete JSON, keep buffering
              }
            }

            // Fallback: 500-char buffer exceeded without valid JSON
            if (jsonBuffer.length > 500) {
              jsonResolved = true;
              resolveCrisisInfo({ isCrisis: false, resource: null });
              controller.enqueue(encoder.encode(jsonBuffer));
              jsonBuffer = "";
            }
          }

          // Stream ended before JSON was resolved
          if (!jsonResolved) {
            resolveCrisisInfo({ isCrisis: false, resource: null });
            if (jsonBuffer) {
              controller.enqueue(encoder.encode(jsonBuffer));
            }
          }
        } catch (err) {
          // Ensure the promise always resolves so the main function isn't blocked
          if (!jsonResolved) {
            resolveCrisisInfo({ isCrisis: false, resource: null });
          }
          console.error(
            `[${timestamp}] Stream error | session: ${sessionId} |`,
            (err as Error).message
          );
        } finally {
          safeClose();
        }
      },

      cancel() {
        anthropicStream.abort();
      },
    });

    // Wait for the JSON prefix decision — resolves as soon as the first
    // complete JSON line is parsed (typically within the first 1–2 chunks)
    const { isCrisis, tier, category, resource } = await crisisInfoPromise;

    // ── Crisis detected via Claude's stream ───────────────────────────────────
    if (isCrisis) {
      logCrisis({
        sessionId,
        triggerLayer: "semantic",
        crisisTier: (tier ?? "tier2") as "tier1" | "tier2" | "tier3",
        crisisCategory: (category as "life-risk" | "safeguarding" | "jailbreak" | "distress") ?? "distress",
        transcriptSnippet: messages.slice(-10),
      }).catch((err) => console.error("Crisis log failed:", err));

      return Response.json({
        error: "CRISIS_DETECTED",
        tier,
        category,
      });
    }

    // ── STEP 7 (normal path): Return streaming text response ─────────────────
    const responseHeaders: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
    };

    if (resource) {
      responseHeaders["X-Resource-Category"] = resource;
    }

    return new Response(outputStream, { headers: responseHeaders });
  } catch (err) {
    const error = err as Error;
    console.error(
      `[${timestamp}] Chat API error | session: ${sessionId} |`,
      error.message
    );
    return Response.json(
      { error: "INTERNAL_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
