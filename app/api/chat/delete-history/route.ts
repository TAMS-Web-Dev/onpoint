import { createClient } from "@supabase/supabase-js";
import { createClient as createSSRClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE() {
  try {
    const ssrClient = await createSSRClient();
    const { data: { user } } = await ssrClient.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = serviceClient();

    // Step 1 — Get all session IDs for this user
    const { data: sessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", user.id);

    if (sessionsError) throw new Error(sessionsError.message);

    const sessionIds = (sessions ?? []).map((s) => s.id);

    // Step 2 — Delete messages for those sessions
    if (sessionIds.length > 0) {
      const { error: msgsError } = await supabase
        .from("chat_messages")
        .delete()
        .in("session_id", sessionIds);

      if (msgsError) throw new Error(msgsError.message);
    }

    // Step 3 — Delete non-flagged sessions only
    const { count: deletedSessions, error: deleteError } = await supabase
      .from("chat_sessions")
      .delete({ count: "exact" })
      .eq("user_id", user.id)
      .eq("is_flagged", false);

    if (deleteError) throw new Error(deleteError.message);

    // Step 4 — Reset chat consent so banner shows on next visit
    const { error: consentError } = await supabase
      .from("profiles")
      .update({ chat_consent_given: false, chat_consent_at: null })
      .eq("id", user.id);

    if (consentError) throw new Error(consentError.message);

    return NextResponse.json({ success: true, deletedSessions: deletedSessions ?? 0 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
