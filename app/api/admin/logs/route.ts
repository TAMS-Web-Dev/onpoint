import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") ?? "20")));
    const offset = (page - 1) * limit;

    const supabase = serviceClient();

    const [countRes, sessionsRes] = await Promise.all([
      supabase
        .from("chat_sessions")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("chat_sessions")
        .select("id, created_at, is_flagged, is_resolved")
        .order("is_flagged", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1),
    ]);

    if (sessionsRes.error) throw new Error(sessionsRes.error.message);

    const sessions = sessionsRes.data ?? [];
    const total = countRes.count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    if (sessions.length === 0) {
      return NextResponse.json({ sessions: [], total, page, totalPages });
    }

    const sessionIds = sessions.map((s) => s.id);

    const { data: messages } = await supabase
      .from("chat_messages")
      .select("session_id, created_at")
      .in("session_id", sessionIds);

    const msgMap = new Map<string, { count: number; lastAt: string | null }>();
    for (const sid of sessionIds) {
      msgMap.set(sid, { count: 0, lastAt: null });
    }
    for (const msg of messages ?? []) {
      const entry = msgMap.get(msg.session_id);
      if (!entry) continue;
      entry.count++;
      if (!entry.lastAt || msg.created_at > entry.lastAt) {
        entry.lastAt = msg.created_at;
      }
    }

    const result = sessions.map((s) => {
      const msgs = msgMap.get(s.id) ?? { count: 0, lastAt: null };
      return {
        id: s.id,
        created_at: s.created_at,
        last_message_at: msgs.lastAt,
        is_flagged: s.is_flagged ?? false,
        is_resolved: s.is_resolved ?? false,
        message_count: msgs.count,
      };
    });

    return NextResponse.json({ sessions: result, total, page, totalPages });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
