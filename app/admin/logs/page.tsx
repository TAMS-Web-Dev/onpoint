import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 20;

function serviceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

interface SessionRow {
  id: string;
  created_at: string;
  last_message_at: string | null;
  is_flagged: boolean;
  is_resolved: boolean;
  message_count: number;
}

async function getSessions(page: number): Promise<{
  sessions: SessionRow[];
  total: number;
  totalPages: number;
}> {
  const supabase = serviceClient();
  const offset = (page - 1) * PAGE_SIZE;

  const [countRes, sessionsRes] = await Promise.all([
    supabase.from("chat_sessions").select("*", { count: "exact", head: true }),
    supabase
      .from("chat_sessions")
      .select("id, created_at, is_flagged, is_resolved")
      .order("is_flagged", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1),
  ]);

  const sessions = sessionsRes.data ?? [];
  const total = countRes.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (sessions.length === 0) {
    return { sessions: [], total, totalPages };
  }

  const sessionIds = sessions.map((s) => s.id);

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("session_id, created_at")
    .in("session_id", sessionIds);

  const msgMap = new Map<string, { count: number; lastAt: string | null }>();
  for (const sid of sessionIds) msgMap.set(sid, { count: 0, lastAt: null });
  for (const msg of messages ?? []) {
    const entry = msgMap.get(msg.session_id);
    if (!entry) continue;
    entry.count++;
    if (!entry.lastAt || msg.created_at > entry.lastAt) entry.lastAt = msg.created_at;
  }

  const result: SessionRow[] = sessions.map((s) => {
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

  return { sessions: result, total, totalPages };
}

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1"));
  const { sessions, total, totalPages } = await getSessions(page);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Chat Logs</h1>
          <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 ml-2">
            {total}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">All platform conversations — anonymised</p>
        <hr className="mt-4 border-border" />
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 px-6 py-20 text-center">
          <MessageSquare size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No sessions yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Conversations will appear here once users start chatting.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Flagged</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id} className={session.is_flagged ? "border-l-4 border-l-red-400" : undefined}>
                    <TableCell className="font-mono">{session.id.slice(0, 8)}…</TableCell>
                    <TableCell className="">{format(new Date(session.created_at), "d MMM yyyy, HH:mm")}</TableCell>
                    <TableCell className="">
                      {session.last_message_at ? format(new Date(session.last_message_at), "d MMM yyyy, HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">{session.message_count}</TableCell>
                    <TableCell>
                      {session.is_flagged ? (
                        <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-0.5">
                          No
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {session.is_flagged ? (
                        session.is_resolved ? (
                          <span className="inline-flex items-center rounded-full border-2 border-green-200 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-0.5">
                            No
                          </span>
                        )
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/logs/${session.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="inline-flex items-center gap-1.5 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                          View
                          <ArrowRight size={14} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href={`?page=${page - 1}`}
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : undefined}
                  className={page === 1 ? "pointer-events-none" : undefined}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Previous
                  </Button>
                </Link>
                <Link
                  href={`?page=${page + 1}`}
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : undefined}
                  className={page === totalPages ? "pointer-events-none" : undefined}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    Next
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
