"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Square, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FlagDetail {
  id: string;
  session_id: string;
  trigger_layer: string;
  crisis_tier: "tier1" | "tier2" | "tier3";
  crisis_category: string;
  created_at: string;
  reviewed_by_dsl: boolean;
  dsl_assessment: string | null;
  dsl_notes: string | null;
  transcript_snippet: Message[] | "DECRYPTION_FAILED";
  is_resolved: boolean;
}

const PROTOCOL_ITEMS = [
  "Document all actions taken in the case log",
  "Record tier assessment rationale",
  "Note any language, cultural or neurodivergent factors",
  'Select "Restore Access" only after risk assessment confirms no immediate risk',
  "Sign off on the case in the Weekly Clinical Supervision Log",
  "Where a safeguarding referral was made, record the referral number",
  "Where police were contacted, record officer name and badge number",
  "Schedule a follow-up review for Tier 2 and Tier 3 cases at 72 hours",
];

function TierBadge({ tier }: { tier: string }) {
  if (tier === "tier3")
    return (
      <Badge variant="destructive" className=" border-2 font-semibold">
        Tier 3
      </Badge>
    );
  if (tier === "tier2")
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-2 font-semibold">Tier 2</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-2 font-semibold">Tier 1</Badge>;
}

export default function FlagDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [flag, setFlag] = useState<FlagDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assessment, setAssessment] = useState<string>("");
  const [dslNotes, setDslNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [isReviewed, setIsReviewed] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>(Array(PROTOCOL_ITEMS.length).fill(false));

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/flags/${id}`);
        if (!res.ok) throw new Error("Failed to load flag");
        const data: FlagDetail = await res.json();
        setFlag(data);
        setAssessment(data.dsl_assessment ?? "");
        setDslNotes(data.dsl_notes ?? "");
        setIsReviewed(data.reviewed_by_dsl);
        setIsRestored(data.is_resolved);
      } catch {
        toast.error("Could not load this flag. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function saveAssessment() {
    if (!flag) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dsl_assessment: assessment || null,
          dsl_notes: dslNotes || null,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      toast.success("Assessment saved.");
    } catch {
      toast.error("Could not save assessment.");
    } finally {
      setIsSaving(false);
    }
  }

  async function markReviewed() {
    try {
      const res = await fetch(`/api/admin/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed_by_dsl: true }),
      });
      if (!res.ok) throw new Error();
      setIsReviewed(true);
      toast.success("Marked as reviewed.");
    } catch {
      toast.error("Could not update review status.");
    }
  }

  async function restoreAccess() {
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/admin/flags/${id}/restore`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Restore failed");
      setIsRestored(true);
      setShowRestoreDialog(false);
      toast.success("Chat access restored.");
    } catch {
      toast.error("Could not restore access.");
    } finally {
      setIsRestoring(false);
    }
  }

  function toggleChecklist(index: number) {
    setChecklist((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex items-center gap-1">
          {[0, 150, 300].map((delay) => (
            <span
              key={delay}
              className="h-2 w-2 rounded-full bg-[#2D1D44]/30 animate-bounce"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!flag) return null;

  const transcriptFailed = flag.transcript_snippet === "DECRYPTION_FAILED";
  const messages = transcriptFailed ? [] : (flag.transcript_snippet as Message[]);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-16">
      {/* Back */}
      <Link href="/admin/flags" className="inline-flex items-center gap-1.5 text-sm transition-colors w-fit">
        <ArrowLeft size={15} />
        Back to Flagged Content
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TierBadge tier={flag.crisis_tier} />
          <Badge variant="outline" className="capitalize border-2 font-semibold">
            {flag.crisis_category.replace("-", " ")}
          </Badge>
          {isReviewed && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Reviewed</Badge>}
        </div>
        <h1 className="text-xl font-extrabold text-[#2D1D44] font-mono">Session {flag.session_id.slice(0, 8)}…</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>
            Triggered by: <span className="font-medium capitalize text-foreground">{flag.trigger_layer}</span>
          </span>
          <span>{format(new Date(flag.created_at), "d MMM yyyy 'at' HH:mm")}</span>
        </div>
      </div>

      {/* Transcript */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-[#2D1D44]">Transcript Snippet</h2>
          <p className="text-sm">Last 10 exchanges before crisis trigger</p>
        </div>

        {transcriptFailed ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            Transcript could not be decrypted. Contact system administrator.
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            No transcript available.
          </div>
        ) : (
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#2D1D44] text-white rounded-tr-sm"
                      : "bg-white text-gray-800 ring-1 ring-border shadow-sm rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DSL Assessment */}
      <section className="flex flex-col gap-4 rounded-xl border border-border p-5 bg-white">
        <h2 className="font-semibold text-[#2D1D44]">DSL Assessment</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Assessment</label>
          <Select value={assessment} onValueChange={(v) => setAssessment(v ?? "")}>
            <SelectTrigger className="w-full sm:w-64 border-gray-400/50">
              <SelectValue placeholder="Select assessment…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true-crisis">True Crisis</SelectItem>
              <SelectItem value="possible-crisis">Possible Crisis</SelectItem>
              <SelectItem value="false-positive">False Positive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">DSL Notes</label>
          <Textarea
            value={dslNotes}
            onChange={(e) => setDslNotes(e.target.value)}
            placeholder="Record your assessment rationale..."
            rows={4}
            className="resize-none border-gray-400/50"
          />
        </div>

        <Button
          onClick={saveAssessment}
          disabled={isSaving}
          className="w-fit bg-[#2D1D44] hover:bg-[#2D1D44]/90 text-white"
        >
          {isSaving ? "Saving…" : "Save Assessment"}
        </Button>
      </section>

      {/* Actions */}
      <section className="flex flex-col gap-3 rounded-xl border border-border p-5 bg-white">
        <h2 className="font-semibold text-[#2D1D44]">Actions</h2>

        <div className="flex flex-wrap items-center gap-3">
          {!isRestored && (
            <Button
              variant="outline"
              size="sm"
              className="border-[#FF790E] text-[#FF790E] hover:bg-[#FF790E]/5"
              onClick={() => setShowRestoreDialog(true)}
            >
              Restore Chat Access
            </Button>
          )}
          {isRestored && (
            <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 border border-green-200 text-sm px-2.5 py-0.5">
              Access restored
            </span>
          )}

          <Button variant="outline" size="sm" disabled={isReviewed} onClick={markReviewed}>
            {isReviewed ? "Reviewed ✓" : "Mark as Reviewed"}
          </Button>
        </div>
      </section>

      {/* Safeguarding Protocol Checklist */}
      <section className="flex flex-col gap-3 rounded-xl border border-border p-5 bg-white">
        <div>
          <h2 className="font-semibold text-[#2D1D44]">Safeguarding Protocol Checklist</h2>
          <p className="text-sm mt-0.5 text-muted-foreground">Protocol Section 6.1 - tick each step as completed</p>
        </div>

        <ul className="flex flex-col gap-2.5 mt-4">
          {PROTOCOL_ITEMS.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 cursor-pointer select-none"
              onClick={() => toggleChecklist(i)}
            >
              {checklist[i] ? (
                <CheckSquare size={17} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square size={17} className="text-muted-foreground/50 flex-shrink-0 mt-0.5" />
              )}
              <span
                className={`text-sm leading-snug transition-colors ${
                  checklist[i] ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Restore Confirm Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Chat Access</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to restore chat access for this user? Only do this if you have assessed this as a
            false positive or the young person is no longer at risk.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)} disabled={isRestoring}>
              Cancel
            </Button>
            <Button
              onClick={restoreAccess}
              disabled={isRestoring}
              className="bg-[#FF790E] hover:bg-[#e56d0d] text-white"
            >
              {isRestoring ? "Restoring…" : "Confirm Restore"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
