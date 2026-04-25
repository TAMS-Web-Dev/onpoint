import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function decryptTranscript(stored: string): { messages: unknown; failed: boolean } {
  if (stored.startsWith("UNENCRYPTED:")) {
    try {
      return { messages: JSON.parse(stored.slice("UNENCRYPTED:".length)), failed: false };
    } catch {
      return { messages: [], failed: false };
    }
  }

  try {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) throw new Error("ENCRYPTION_KEY not set");

    const { iv, authTag, encrypted } = JSON.parse(stored);
    const key = Buffer.from(keyHex, "hex");
    const ivBuf = Buffer.from(iv, "hex");
    const tagBuf = Buffer.from(authTag, "hex");
    const dataBuf = Buffer.from(encrypted, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, ivBuf, {
      authTagLength: 16,
    });
    decipher.setAuthTag(tagBuf);

    const plaintext = Buffer.concat([decipher.update(dataBuf), decipher.final()]).toString("utf8");
    return { messages: JSON.parse(plaintext), failed: false };
  } catch {
    return { messages: [], failed: true };
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = serviceClient();

    const { data: log, error: logError } = await supabase
      .from("crisis_logs")
      .select("*")
      .eq("id", id)
      .single();

    if (logError || !log) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { messages: transcript, failed: decryptionFailed } = decryptTranscript(
      log.transcript_snippet as string
    );

    const { data: session } = await supabase
      .from("chat_sessions")
      .select("is_resolved, is_flagged")
      .eq("id", log.session_id)
      .maybeSingle();

    return NextResponse.json({
      ...log,
      transcript_snippet: decryptionFailed ? "DECRYPTION_FAILED" : transcript,
      is_resolved: session?.is_resolved ?? false,
      is_flagged: session?.is_flagged ?? false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = serviceClient();

    const allowed = ["reviewed_by_dsl", "dsl_assessment", "dsl_notes"] as const;
    const payload: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) payload[key] = body[key];
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("crisis_logs")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
