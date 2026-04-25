import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = serviceClient();
    const now = new Date();
    const todayStart = startOfDay(now).toISOString();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }).toISOString();
    const monthStart = startOfMonth(now).toISOString();
    const sevenDaysAgo = subDays(now, 7).toISOString();

    const [
      totalMsgs,
      todayMsgs,
      weekMsgs,
      monthMsgs,
      usersRes,
      activeSessionsRes,
      crisisLogsRes,
      peakHoursRes,
    ] = await Promise.all([
      supabase.from("chat_messages").select("*", { count: "exact", head: true }),
      supabase.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("chat_messages").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from("chat_sessions").select("user_id").gte("created_at", sevenDaysAgo),
      supabase.from("crisis_logs").select("crisis_tier, reviewed_by_dsl"),
      supabase.from("chat_messages").select("created_at"),
    ]);

    const activeUsers = new Set((activeSessionsRes.data ?? []).map((s) => s.user_id)).size;

    const crisisRows = crisisLogsRes.data ?? [];
    const crisis = {
      tier1: crisisRows.filter((r) => r.crisis_tier === "tier1").length,
      tier2: crisisRows.filter((r) => r.crisis_tier === "tier2").length,
      tier3: crisisRows.filter((r) => r.crisis_tier === "tier3").length,
      reviewed: crisisRows.filter((r) => r.reviewed_by_dsl === true).length,
      unreviewed: crisisRows.filter((r) => r.reviewed_by_dsl === false).length,
    };

    const hourCounts: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourCounts[h] = 0;
    for (const row of peakHoursRes.data ?? []) {
      const hour = new Date(row.created_at).getUTCHours();
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    }
    const peakHours = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      count: hourCounts[h] ?? 0,
    }));

    return NextResponse.json({
      messages: {
        total: totalMsgs.count ?? 0,
        today: todayMsgs.count ?? 0,
        thisWeek: weekMsgs.count ?? 0,
        thisMonth: monthMsgs.count ?? 0,
      },
      users: {
        total: usersRes.data?.users?.length ?? 0,
        activeLast7Days: activeUsers,
      },
      crisis,
      peakHours,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
