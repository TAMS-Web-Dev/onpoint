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
    const search = searchParams.get("search")?.trim().toLowerCase() ?? "";

    const supabase = serviceClient();

    // Fetch all users — client-side search + pagination for MVP scale
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({
      perPage: 1000,
      page: 1,
    });

    if (usersError) throw new Error(usersError.message);

    let allUsers = usersData.users;

    if (search) {
      allUsers = allUsers.filter((u) =>
        u.email?.toLowerCase().includes(search)
      );
    }

    allUsers.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const total = allUsers.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const pageUsers = allUsers.slice((page - 1) * limit, page * limit);

    if (pageUsers.length === 0) {
      return NextResponse.json({ users: [], total, page, totalPages });
    }

    const userIds = pageUsers.map((u) => u.id);

    const [profilesRes, sessionsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, suspended")
        .in("id", userIds),
      supabase
        .from("chat_sessions")
        .select("id, user_id")
        .in("user_id", userIds),
    ]);

    const profileMap = new Map(
      (profilesRes.data ?? []).map((p) => [p.id, p])
    );

    const sessions = sessionsRes.data ?? [];
    const sessionIds = sessions.map((s) => s.id);
    const sessionUserMap = new Map(sessions.map((s) => [s.id, s.user_id]));

    const crisisCountMap = new Map<string, number>();
    if (sessionIds.length > 0) {
      const { data: crisisLogs } = await supabase
        .from("crisis_logs")
        .select("session_id")
        .in("session_id", sessionIds);

      for (const log of crisisLogs ?? []) {
        const userId = sessionUserMap.get(log.session_id);
        if (userId) {
          crisisCountMap.set(userId, (crisisCountMap.get(userId) ?? 0) + 1);
        }
      }
    }

    const users = pageUsers.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: profileMap.get(u.id)?.full_name ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
      crisis_flags: crisisCountMap.get(u.id) ?? 0,
      suspended: profileMap.get(u.id)?.suspended ?? false,
    }));

    return NextResponse.json({ users, total, page, totalPages });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
