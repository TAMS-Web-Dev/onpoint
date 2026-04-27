"use client";

import { format, isToday, isYesterday } from "date-fns";
import { PenSquare, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useChatStore, type SessionPreview } from "@/store/chat-store";
import { startNewSession } from "@/app/(private)/chat/actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "d MMM");
}

interface ChatSidebarProps {
  onNavigate?: () => void; // called on mobile after selecting a session
}

export function ChatSidebar({ onNavigate }: ChatSidebarProps) {
  const { sessionId, sessions, setSessionId, addSession } = useChatStore();

  async function handleNewChat() {
    try {
      const { sessionId: newId, preview } = await startNewSession();
      addSession(preview);
      setSessionId(newId);
      onNavigate?.();
    } catch {
      toast.error("Could not start a new chat. Please try again.");
    }
  }

  function handleSelectSession(session: SessionPreview) {
    setSessionId(session.id);
    onNavigate?.();
  }

  return (
    <aside className="flex flex-col h-full bg-muted border-r border-border w-64 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground select-none">
          Conversations
        </span>
        <button
          onClick={handleNewChat}
          aria-label="New chat"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-border transition-colors"
        >
          <PenSquare size={15} />
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-3 pb-3">
        <Button
          onClick={handleNewChat}
          className="w-full h-9 rounded-xl bg-[#FF790E] hover:bg-[#e56d0d] text-white text-sm font-semibold justify-start gap-2 px-3"
        >
          <PenSquare size={14} />
          New Chat
        </Button>
      </div>

      <div className="mx-3 mb-3 h-px bg-border" />

      {/* Session list */}
      <div className="flex-1 px-2 overflow-y-auto">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
            <MessageSquare size={20} className="text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              No conversations yet. Start a new chat above.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5 pb-4">
            {sessions.map((session) => {
              const isActive = session.id === sessionId;
              return (
                <li key={session.id}>
                  <button
                    onClick={() => handleSelectSession(session)}
                    className={cn(
                      "w-full text-left rounded-lg px-3 py-2.5 transition-all group",
                      isActive
                        ? "bg-background border-l-2 border-[#FF790E] shadow-sm"
                        : "border-l-2 border-transparent hover:bg-background/70",
                    )}
                  >
                    <p
                      className={cn(
                        "text-sm truncate leading-snug",
                        isActive ? "text-[#2D1D44] font-semibold" : "text-foreground/60 group-hover:text-foreground",
                      )}
                    >
                      {session.preview}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatSessionDate(session.created_at)}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
