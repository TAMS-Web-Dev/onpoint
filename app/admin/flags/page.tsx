import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FlagRow {
  id: string;
  session_id: string;
  trigger_layer: string;
  crisis_tier: string;
  crisis_category: string;
  created_at: string;
  reviewed_by_dsl: boolean;
  dsl_assessment: string | null;
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

function StatusBadge({ reviewed }: { reviewed: boolean }) {
  if (reviewed)
    return (
      <span className="inline-flex items-center rounded-full border-2 border-green-200 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5">
        Reviewed
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border-2 border-gray-200 bg-gray-50 text-gray-500 text-xs font-semibold px-2.5 py-0.5">
      Unreviewed
    </span>
  );
}

function AssessmentBadge({ value }: { value: string | null }) {
  if (!value) return <span className="text-gray-400">-</span>;
  if (value === "true-crisis")
    return (
      <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
        True Crisis
      </span>
    );
  if (value === "possible-crisis")
    return (
      <span className="inline-flex items-center rounded-full border-2 border-amber-200 bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-0.5">
        Possible Crisis
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border-2 border-green-200 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5">
      False Positive
    </span>
  );
}

async function getFlags(): Promise<FlagRow[]> {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase
    .from("crisis_logs")
    .select("id, session_id, trigger_layer, crisis_tier, crisis_category, created_at, reviewed_by_dsl, dsl_assessment")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as FlagRow[];
}

export default async function FlagsPage() {
  const flags = await getFlags();

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">Flagged Content</h1>
          <span className="text-xs text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 ml-2">
            {flags.length}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Crisis events requiring DSL review</p>
        <hr className="mt-4 border-border" />
      </div>

      {flags.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/20 px-6 py-20 text-center">
          <Shield size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No flagged sessions</p>
          <p className="text-xs text-muted-foreground/60 mt-1">The platform is clear.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-300/70 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray/100 border-b border-gray-300 hover:bg-gray-50">
                <TableHead>Time</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag, index) => (
                <TableRow
                  key={flag.id}
                  className={`bg-white hover:bg-gray-50 transition-colors ${index < flags.length - 1 ? "border-b border-gray-300" : ""}`}
                >
                  <TableCell className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-semibold">
                    {format(new Date(flag.created_at), "d MMM yyyy, HH:mm")}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <TierBadge tier={flag.crisis_tier} />
                  </TableCell>
                  <TableCell className="px-4 py-3 capitalize text-sm text-gray-900">
                    {flag.crisis_category.replace("-", " ")}
                  </TableCell>
                  <TableCell className="px-4 py-3 capitalize text-sm text-gray-900">{flag.trigger_layer}</TableCell>
                  <TableCell className="px-4 py-3">
                    <StatusBadge reviewed={flag.reviewed_by_dsl} />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <AssessmentBadge value={flag.dsl_assessment} />
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Link href={`/admin/flags/${flag.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="inline-flex items-center gap-1.5 border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                      >
                        Review
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
