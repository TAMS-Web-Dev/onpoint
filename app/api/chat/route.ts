import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { checkKeywords } from "@/lib/crisis-detection";
import { logCrisis } from "@/lib/crisis-log";
import { sendCrisisAlert } from "@/lib/twilio";

export const runtime = "edge";

function flagSession(sessionId: string): Promise<void> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`;
  return fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY!,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ is_flagged: true }),
  }).then(() => undefined);
}

interface MessageParam {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request): Promise<Response> {
  const timestamp = new Date().toISOString();
  let sessionId = "unknown";

  try {
    const body = await req.json();
    const messages: MessageParam[] = body.messages ?? [];
    sessionId = body.sessionId ?? "unknown";

    // ── STEP 1: Pre-call keyword check ───────────────────────────────────────
    const lastUserContent = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    if (checkKeywords(lastUserContent)) {
      logCrisis({
        sessionId,
        triggerLayer: "keyword",
        crisisTier: "tier3",
        crisisCategory: "life-risk",
        transcriptSnippet: messages.slice(-10),
      }).catch((err) => console.error("Crisis log failed:", err));

      flagSession(sessionId).catch((err) => console.error("Flag session failed:", err));

      sendCrisisAlert({
        tier: "tier3",
        category: "life-risk",
        sessionId,
        timestamp: new Date().toISOString(),
      }).catch((err) => console.error("Alert failed:", err));

      return Response.json({
        error: "CRISIS_DETECTED",
        tier: "tier3",
        category: "life-risk",
        skipApi: true,
      });
    }

    // ── STEP 2: Mock mode ─────────────────────────────────────────────────────
    if (!process.env.ANTHROPIC_API_KEY) {
      const mockText = "Mock mode active — API key pending. This is a placeholder response from Ask OnPoint.";
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
      messages.length > 20 ? [messages[0], messages[1], ...messages.slice(-18)] : messages;

    // ── STEP 4: Call Claude ───────────────────────────────────────────────────
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const anthropicStream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: cappedMessages,
    });

    // ── STEP 5: Parse JSON prefix sequentially ────────────────────────────────
    //
    // Read events one at a time in the main async function — no concurrency.
    // By the time we decide the response type, the Anthropic stream is still
    // open, so the Response is always returned before the stream is closed.
    // This eliminates the race condition in the previous ReadableStream design.

    const encoder = new TextEncoder();
    const iter = anthropicStream[Symbol.asyncIterator]();

    let jsonBuffer = "";
    let jsonResolved = false;
    let isCrisis = false;
    let crisisTier: string | null = null;
    let crisisCategory: string | null = null;
    let resourceCategory: string | null = null;
    let remainder = "";

    while (!jsonResolved) {
      const { done, value: event } = await iter.next();

      if (done) {
        remainder = jsonBuffer;
        break;
      }

      if (event.type !== "content_block_delta" || event.delta.type !== "text_delta") {
        continue;
      }

      jsonBuffer += event.delta.text;
      const braceIdx = jsonBuffer.indexOf("}");

      if (braceIdx !== -1) {
        try {
          const parsed = JSON.parse(jsonBuffer.slice(0, braceIdx + 1));
          jsonResolved = true;
          isCrisis = Boolean(parsed.crisis_detected);
          crisisTier = parsed.crisis_tier ?? null;
          crisisCategory = parsed.crisis_category ?? null;
          resourceCategory = parsed.resource_category ?? null;

          const nlIdx = jsonBuffer.indexOf("\n", braceIdx);
          remainder = nlIdx !== -1 ? jsonBuffer.slice(nlIdx + 1) : jsonBuffer.slice(braceIdx + 1);
          jsonBuffer = "";
        } catch {
          // Incomplete JSON — keep buffering
        }
      }

      // Fallback: 500-char buffer exceeded without valid JSON
      if (!jsonResolved && jsonBuffer.length > 500) {
        jsonResolved = true;
        remainder = jsonBuffer;
        jsonBuffer = "";
      }
    }

    // ── STEP 6: Crisis detected ───────────────────────────────────────────────
    if (isCrisis) {
      anthropicStream.abort();

      logCrisis({
        sessionId,
        triggerLayer: "semantic",
        crisisTier: (crisisTier ?? "tier2") as "tier1" | "tier2" | "tier3",
        crisisCategory: (crisisCategory as "life-risk" | "safeguarding" | "jailbreak" | "distress") ?? "distress",
        transcriptSnippet: messages.slice(-10),
      }).catch((err) => console.error("Crisis log failed:", err));

      flagSession(sessionId).catch((err) => console.error("Flag session failed:", err));

      if (crisisTier === "tier2" || crisisTier === "tier3") {
        sendCrisisAlert({
          tier: crisisTier as "tier2" | "tier3",
          category: ((crisisCategory ?? "distress") as "life-risk" | "safeguarding" | "jailbreak" | "distress"),
          sessionId,
          timestamp: new Date().toISOString(),
        }).catch((err) => console.error("Alert failed:", err));
      }

      return Response.json({
        error: "CRISIS_DETECTED",
        tier: crisisTier,
        category: crisisCategory,
      });
    }

    // ── STEP 7: Stream remaining content ─────────────────────────────────────
    //
    // TransformStream separates the write side from the read side.
    // We return the Response with the readable side immediately, then write
    // remaining content in a background task. The writer only closes after
    // all content is written — the stream is never closed before the Response
    // is returned.

    const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
    const writer = writable.getWriter();

    const writeTask = (async () => {
      try {
        if (remainder) {
          await writer.write(encoder.encode(remainder));
        }

        while (true) {
          const { done, value: event } = await iter.next();
          if (done) break;
          if (event.type !== "content_block_delta" || event.delta.type !== "text_delta") {
            continue;
          }
          await writer.write(encoder.encode(event.delta.text));
        }

        await writer.close();
      } catch (err) {
        console.error(`[${timestamp}] Stream write error | session: ${sessionId} |`, (err as Error).message);
        try {
          await writer.abort(err);
        } catch {
          // ignore if already closed
        }
      }
    })();

    void writeTask;

    const responseHeaders: Record<string, string> = {
      "Content-Type": "text/plain; charset=utf-8",
    };
    if (resourceCategory) {
      responseHeaders["X-Resource-Category"] = resourceCategory;
    }

    return new Response(readable, { headers: responseHeaders });
  } catch (err) {
    const error = err as Error;
    console.error(`[${timestamp}] Chat API error | session: ${sessionId} |`, error.message);
    return Response.json({ error: "INTERNAL_ERROR", message: error.message }, { status: 500 });
  }
}
