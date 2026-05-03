"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Shield, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Message {
  role: string;
  content: string;
  created_at: string;
}

interface SessionDetail {
  id: string;
  created_at: string;
  is_flagged: boolean;
  is_resolved: boolean;
  message_count: number;
}

interface CrisisLog {
  id: string;
  crisis_tier: string;
  crisis_category: string;
  trigger_layer: string;
  created_at: string;
}

export default function LogDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [confirmed, setConfirmed] = useState(false);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [crisisLog, setCrisisLog] = useState<CrisisLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  async function fetchData(withConfirmation: boolean) {
    const headers: Record<string, string> = {};
    if (withConfirmation) headers["X-Admin-Confirm"] = "confirmed";

    try {
      const res = await fetch(`/api/admin/logs/${id}`, { headers });

      if (res.status === 403) {
        // Gate required — stop loading, show confirmation UI
        setIsLoading(false);
        return;
      }

      if (!res.ok) throw new Error("Failed to load session");

      const data = await res.json();
      setSession(data.session);
      setMessages(data.messages);
      setCrisisLog(data.crisisLog);
      setConfirmed(true);
    } catch {
      toast.error("Could not load this session. Please refresh.");
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  }

  useEffect(() => {
    fetchData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirm() {
    setIsConfirming(true);
    setIsLoading(true);
    await fetchData(true);
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

  // Confirmation gate
  if (!confirmed) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-10 text-center">
          <div className="flex justify-center mb-5">
            <div className="h-16 w-16 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center">
              <Shield size={28} className="text-purple-600" />
            </div>
          </div>

          <h1 className="text-lg font-semibold text-gray-900 mb-3">
            Sensitive Content
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            You are about to view a full conversation transcript. This data is
            encrypted and access is logged. Only proceed if you have a
            legitimate safeguarding reason.
          </p>

          <Button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="mt-6 w-full bg-[#2D1D44] hover:bg-[#2D1D44]/90 text-white"
          >
            {isConfirming ? "Loading…" : "I understand - view transcript"}
          </Button>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 pb-16">
      {/* Back */}
      <Link
        href="/admin/logs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit"
      >
        <ArrowLeft size={15} />
        Back to Chat Logs
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {session.is_flagged && (
            <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
              Flagged
            </span>
          )}
          {session.is_resolved && (
            <span className="inline-flex items-center rounded-full border-2 border-green-200 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5">
              Resolved
            </span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-gray-900 font-mono">
          Session {session.id.slice(0, 8)}…
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>
            Started:{" "}
            <span className="text-gray-900">
              {format(new Date(session.created_at), "d MMM yyyy 'at' HH:mm")}
            </span>
          </span>
          <span>
            Messages:{" "}
            <span className="text-gray-900">{session.message_count}</span>
          </span>
        </div>
      </div>

      {/* Crisis Log */}
      {crisisLog && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-semibold text-amber-900">
              Crisis Detected
            </h2>
            <Link
              href={`/admin/flags/${crisisLog.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              View in Flagged Content
              <ExternalLink size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              {crisisLog.crisis_tier === "tier3" && (
                <span className="inline-flex items-center rounded-full border-2 border-red-200 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-0.5">
                  Tier 3
                </span>
              )}
              {crisisLog.crisis_tier === "tier2" && (
                <span className="inline-flex items-center rounded-full border-2 border-amber-300 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-0.5">
                  Tier 2
                </span>
              )}
              {crisisLog.crisis_tier === "tier1" && (
                <span className="inline-flex items-center rounded-full border-2 border-blue-200 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-0.5">
                  Tier 1
                </span>
              )}
            </div>
            <span className="text-amber-800 capitalize">
              {crisisLog.crisis_category.replace("-", " ")}
            </span>
            <span className="text-amber-700 capitalize">
              via {crisisLog.trigger_layer}
            </span>
            <span className="text-amber-600">
              {format(new Date(crisisLog.created_at), "d MMM yyyy, HH:mm")}
            </span>
          </div>
        </section>
      )}

      {/* Transcript */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            Full Conversation Transcript
          </h2>
        </div>

        {messages.length === 0 ? (
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-6 text-sm text-gray-500 text-center">
            No messages in this session.
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col gap-1 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.content === "[DECRYPTION_FAILED]" ? (
                  <div className="max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed bg-red-100 text-red-700 border border-red-200 flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    Decryption failed — content unavailable
                  </div>
                ) : (
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#2D1D44] text-white rounded-tr-sm"
                        : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
                <span className="text-xs text-gray-400 px-1">
                  {format(new Date(msg.created_at), "HH:mm")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer note */}
      <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-6">
        This transcript is retained for 12 months from session creation per the
        OnPoint Safeguarding Protocol Section 6.2.
      </p>
    </div>
  );
}
