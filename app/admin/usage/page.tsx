import { createClient } from "@supabase/supabase-js";
import { startOfDay, startOfWeek, startOfMonth, subDays } from "date-fns";
import { MessageSquare, Clock, TrendingUp, Calendar, Users, Activity } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface TierStats {
  total: number;
  reviewed: number;
  unreviewed: number;
}

async function getStats() {
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
  const tierStats: Record<"tier1" | "tier2" | "tier3", TierStats> = {
    tier1: { total: 0, reviewed: 0, unreviewed: 0 },
    tier2: { total: 0, reviewed: 0, unreviewed: 0 },
    tier3: { total: 0, reviewed: 0, unreviewed: 0 },
  };
  for (const row of crisisRows) {
    const t = row.crisis_tier as "tier1" | "tier2" | "tier3";
    if (tierStats[t]) {
      tierStats[t].total++;
      if (row.reviewed_by_dsl) tierStats[t].reviewed++;
      else tierStats[t].unreviewed++;
    }
  }

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

  return {
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
    tierStats,
    peakHours,
  };
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <Icon size={20} className="text-purple-600 mb-3" />
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}

function TierBadge({ tier }: { tier: string }) {
  if (tier === "tier3")
    return (
      <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
        Tier 3
      </span>
    );
  if (tier === "tier2")
    return (
      <span className="inline-flex items-center rounded-full border-2 border-amber-200 bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5">
        Tier 2
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5">
      Tier 1
    </span>
  );
}

function ActivityBadge({ count }: { count: number }) {
  if (count >= 51)
    return (
      <span className="inline-flex items-center rounded-full border-2 border-purple-200 bg-purple-50 text-purple-600 text-xs font-semibold px-2.5 py-0.5">
        High
      </span>
    );
  if (count >= 11)
    return (
      <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5">
        Medium
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-0.5">
      Low
    </span>
  );
}

function formatHour(hour: number): string {
  const suffix = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(h).padStart(2, "0")}:00 ${suffix}`;
}

export default async function UsagePage() {
  const { messages, users, tierStats, peakHours } = await getStats();

  const crisisRows = [
    { tier: "tier1", label: "Distress", stats: tierStats.tier1 },
    { tier: "tier2", label: "Safeguarding", stats: tierStats.tier2 },
    { tier: "tier3", label: "Life Risk", stats: tierStats.tier3 },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Usage Statistics</h1>
        <p className="text-sm text-gray-500 mt-1">Platform activity and engagement overview</p>
        <hr className="mt-4 border-border" />
      </div>

      {/* Message Stats */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-700">Messages</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={MessageSquare} label="Total Messages" value={messages.total} />
          <StatCard icon={Clock} label="Today" value={messages.today} />
          <StatCard icon={TrendingUp} label="This Week" value={messages.thisWeek} />
          <StatCard icon={Calendar} label="This Month" value={messages.thisMonth} />
        </div>
      </section>

      {/* User Stats */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-700">Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard icon={Users} label="Total Users" value={users.total} />
          <StatCard icon={Activity} label="Active Last 7 Days" value={users.activeLast7Days} />
        </div>
      </section>

      {/* Crisis Overview */}
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-gray-700">Crisis Events by Tier</h2>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Count</TableHead>
                <TableHead>Reviewed</TableHead>
                <TableHead>Pending Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {crisisRows.map((row) => (
                <TableRow key={row.tier}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TierBadge tier={row.tier} />
                      <span className="text-gray-500">{row.label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{row.stats.total}</TableCell>
                  <TableCell className="text-green-600">{row.stats.reviewed}</TableCell>
                  <TableCell className="text-amber-600">{row.stats.unreviewed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Peak Usage Hours */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700">Activity by Hour of Day</h2>
          <p className="text-xs text-gray-500 mt-0.5">All time, UTC</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hour</TableHead>
                <TableHead>Message Count</TableHead>
                <TableHead>Activity Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {peakHours.map(({ hour, count }) => (
                <TableRow key={hour}>
                  <TableCell className="font-medium tabular-nums">{formatHour(hour)}</TableCell>
                  <TableCell>{count.toLocaleString()}</TableCell>
                  <TableCell>
                    <ActivityBadge count={count} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
