import { createClient } from "@supabase/supabase-js";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface LogCrisisParams {
  sessionId: string;
  triggerLayer: "keyword" | "semantic" | "context";
  crisisTier: "tier1" | "tier2" | "tier3";
  crisisCategory: "life-risk" | "safeguarding" | "jailbreak" | "distress";
  transcriptSnippet: Message[];
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function encryptTranscript(plaintext: string): Promise<string> {
  const keyHex = process.env.ENCRYPTION_KEY;

  if (!keyHex) {
    console.warn(
      "[crisis-log] ENCRYPTION_KEY missing — storing transcript unencrypted"
    );
    return "UNENCRYPTED:" + plaintext;
  }

  const keyBytes = new Uint8Array(
    keyHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  // Web Crypto AES-GCM appends the 16-byte auth tag to the end of the result
  const result = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      new TextEncoder().encode(plaintext)
    )
  );

  return JSON.stringify({
    iv: toHex(iv),
    authTag: toHex(result.slice(-16)),
    encrypted: toHex(result.slice(0, -16)),
  });
}

export async function logCrisis(params: LogCrisisParams): Promise<void> {
  try {
    const encryptedTranscript = await encryptTranscript(
      JSON.stringify(params.transcriptSnippet)
    );

    const retainUntil = new Date(
      Date.now() + 7 * 365.25 * 24 * 60 * 60 * 1000
    ).toISOString();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("crisis_logs").insert({
      id: crypto.randomUUID(),
      session_id: params.sessionId,
      trigger_layer: params.triggerLayer,
      crisis_tier: params.crisisTier,
      crisis_category: params.crisisCategory,
      transcript_snippet: encryptedTranscript,
      reviewed_by_dsl: false,
      dsl_assessment: null,
      retain_until: retainUntil,
    });

    if (error) {
      console.error(
        `[crisis-log] [${new Date().toISOString()}] session: ${params.sessionId} | Supabase insert error: ${error.message}`
      );
    }
  } catch (err) {
    console.error(
      `[crisis-log] [${new Date().toISOString()}] session: ${params.sessionId} | ${(err as Error).message}`
    );
  }
}
