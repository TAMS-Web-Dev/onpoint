import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  // Security check — must match CRON_SECRET
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = serviceClient();
    const now = new Date().toISOString();

    // Step 1 — Find expired, non-flagged sessions
    const { data: expiredSessions, error: fetchError } = await supabase
      .from("chat_sessions")
      .select("id")
      .lt("delete_at", now)
      .eq("is_flagged", false);

    if (fetchError) throw new Error(fetchError.message);

    if (!expiredSessions || expiredSessions.length === 0) {
      console.log(`[cron] No expired sessions found at ${now}`);
      return NextResponse.json({ success: true, deletedSessions: 0, deletedMessages: 0 });
    }

    const expiredIds = expiredSessions.map((s) => s.id);

    // Step 2 — Delete messages for expired sessions
    const { count: deletedMessages, error: msgError } = await supabase
      .from("chat_messages")
      .delete({ count: "exact" })
      .in("session_id", expiredIds);

    if (msgError) throw new Error(msgError.message);

    // Step 3 — Delete expired sessions (is_flagged guard as second layer of safety)
    const { count: deletedSessions, error: sessionError } = await supabase
      .from("chat_sessions")
      .delete({ count: "exact" })
      .in("id", expiredIds)
      .eq("is_flagged", false);

    if (sessionError) throw new Error(sessionError.message);

    // Step 4 — Log result
    console.log(
      `[cron] Deleted ${deletedSessions ?? 0} sessions and ${deletedMessages ?? 0} messages at ${now}`
    );

    return NextResponse.json({
      success: true,
      deletedSessions: deletedSessions ?? 0,
      deletedMessages: deletedMessages ?? 0,
    });
  } catch (err) {
    console.error("[cron] delete-old-chats failed:", (err as Error).message);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
