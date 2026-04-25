import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { decrypt } from "@/lib/chat";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Step 1 — GDPR confirmation gate
  const confirmed = req.headers.get("X-Admin-Confirm");
  if (confirmed !== "confirmed") {
    return NextResponse.json({ error: "CONFIRMATION_REQUIRED" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const supabase = serviceClient();

    // Step 2 — Fetch session
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id, created_at, is_flagged, is_resolved")
      .eq("id", id)
      .maybeSingle();

    if (sessionError) throw new Error(sessionError.message);
    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Step 3 — Fetch messages
    const { data: rawMessages, error: msgsError } = await supabase
      .from("chat_messages")
      .select("role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (msgsError) throw new Error(msgsError.message);

    // Step 4 — Decrypt each message, fail gracefully
    const messages = (rawMessages ?? []).map((msg) => {
      let content: string;
      try {
        content = decrypt(msg.content as string);
      } catch {
        content = "[DECRYPTION_FAILED]";
      }
      return {
        role: msg.role as string,
        content,
        created_at: msg.created_at as string,
      };
    });

    // Step 5 — Check for associated crisis log
    const { data: crisisLog } = await supabase
      .from("crisis_logs")
      .select("id, crisis_tier, crisis_category, trigger_layer, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      session: {
        id: session.id,
        created_at: session.created_at,
        is_flagged: session.is_flagged ?? false,
        is_resolved: session.is_resolved ?? false,
        message_count: messages.length,
      },
      messages,
      crisisLog: crisisLog ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
