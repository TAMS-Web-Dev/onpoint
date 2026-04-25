"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { CrisisBanner } from "@/components/chat/CrisisBanner";
import { ResourceCard, type ResourceCardProps } from "@/components/chat/ResourceCard";
import { CrisisOverlay } from "@/components/crisis/CrisisOverlay";
import { useChatStore } from "@/store/chat-store";
import { initChatSession, loadSession, persistMessage } from "./actions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  resourceCategory?: string | null;
};

const RESOURCE_CARDS: Record<string, ResourceCardProps> = {
  "mental-health": {
    title: "Mental Health Support",
    description: "Free, confidential mental health support for young people. No waiting list — open evenings and weekends.",
    url: "https://www.kooth.com",
    linkLabel: "Visit Kooth",
  },
  "careers": {
    title: "Careers Advice",
    description: "Free careers guidance, CV help, and apprenticeship search from the National Careers Service.",
    url: "https://nationalcareers.service.gov.uk",
    linkLabel: "Explore options",
  },
  "bereavement": {
    title: "Bereavement Support",
    description: "The Mix offers free support for young people dealing with grief and loss.",
    url: "https://www.themix.org.uk/loss-and-bereavement",
    linkLabel: "Get support",
  },
  "send": {
    title: "SEND & Disability Support",
    description: "Information and support for young people with special educational needs and disabilities.",
    url: "https://www.gov.uk/children-with-special-educational-needs",
    linkLabel: "Find out more",
  },
  "early-help": {
    title: "Early Help & Family Support",
    description: "Local early help services in the West Midlands for young people and families.",
    url: "https://www.birmingham.gov.uk/early-help",
    linkLabel: "Find local support",
  },
  "youth-services": {
    title: "Youth Services",
    description: "Find local youth clubs, activities, and services near you in the West Midlands.",
    url: "https://www.wmca.org.uk/what-we-do/wellbeing",
    linkLabel: "Find services",
  },
  "prevention": {
    title: "Health & Wellbeing",
    description: "Advice on healthy lifestyles, substance use, and sexual health for young people.",
    url: "https://www.nhs.uk/live-well",
    linkLabel: "NHS Live Well",
  },
};

export default function ChatPage() {
  const { sessionId, setSessionId, setSessions } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialising, setIsInitialising] = useState(true);
  const [isCrisisLocked, setIsCrisisLocked] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [crisisPayload, setCrisisPayload] = useState<{
    tier: "tier1" | "tier2" | "tier3";
    category: "life-risk" | "safeguarding" | "jailbreak" | "distress" | null;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevSessionRef = useRef<string | null>(null);

  useEffect(() => {
    async function init() {
      let sid: string | undefined;

      try {
        const { sessionId: resolvedSid, history, sessions } = await initChatSession();
        sid = resolvedSid;
        setSessions(sessions);
        setSessionId(sid);
        setMessages(
          history.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      } catch {
        toast.error("Could not load your chat history. Please refresh.");
      } finally {
        setIsInitialising(false); // chat renders here
      }

      // Check session lock status after UI is shown
      if (!sid) return;
      try {
        const res = await fetch(`/api/chat/session-status?sessionId=${sid}`);
        if (res.ok) {
          const { is_flagged, is_resolved } = await res.json();
          if (is_resolved) {
            setIsCrisisLocked(false);
            setIsResolved(true);
          } else if (is_flagged) {
            setIsCrisisLocked(true);
          }
        }
      } catch {
        // silent — chat remains functional if status check fails
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    if (prevSessionRef.current === sessionId) return;
    prevSessionRef.current = sessionId;

    if (isInitialising) return;

    setIsLoading(false);
    setIsCrisisLocked(false);
    setShowOverlay(false);
    setCrisisPayload(null);
    setMessages([]);
    setInput("");
    setIsInitialising(true);

    loadSession(sessionId)
      .then((history) => {
        setMessages(
          history.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: new Date(m.created_at),
          }))
        );
      })
      .catch(() => toast.error("Could not load this conversation."))
      .finally(() => {
        setIsInitialising(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      });
  }, [sessionId, isInitialising]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (isCrisisLocked || isLoading || !content || !sessionId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    persistMessage(sessionId, "user", content).catch(() => {
      toast.error("Your message could not be saved.");
    });

    try {
      // If this session was previously locked and restored by DSL,
      // we intentionally send no history to the Claude API.
      // This prevents the crisis-triggering message from re-triggering
      // detection and gives the user a clean slate.
      // EDGE CASE: Claude will not remember previous conversation context
      // after a restored session. This is a deliberate safeguarding decision —
      // safety takes priority over conversational continuity. The user can
      // still see their message history on screen but Claude starts fresh.
      const history = isResolved
        ? [{ role: userMessage.role, content: userMessage.content }]
        : [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, sessionId }),
      });

      const contentType = response.headers.get("Content-Type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.error === "CRISIS_DETECTED") {
          setIsCrisisLocked(true);
          setShowOverlay(true);
          setCrisisPayload({
            tier: (data.tier ?? "tier2") as "tier1" | "tier2" | "tier3",
            category: (data.category ?? null) as "life-risk" | "safeguarding" | "jailbreak" | "distress" | null,
          });
          setIsLoading(false);
          return;
        }
        throw new Error(data.message ?? "Unexpected error from API.");
      }

      const resourceCategory = response.headers.get("X-Resource-Category");
      const assistantId = crypto.randomUUID();
      console.log("[chat] reached stream reading phase — status:", response.status, "content-type:", response.headers.get("Content-Type"));

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
      ]);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: fullText } : m))
        );
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, resourceCategory } : m
        )
      );

      persistMessage(sessionId, "assistant", fullText).catch(() => {
        toast.error("The AI response could not be saved.");
      });
    } catch (err) {
      console.error("sendMessage error — full error object:", err);
      console.error("sendMessage error — message:", (err as Error).message);
      console.error("sendMessage error — stack:", (err as Error).stack);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (isInitialising) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-1">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="h-2 w-2 rounded-full bg-[#2D1D44]/30 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Loading your conversation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <SuggestedPrompts onSelect={(prompt) => sendMessage(prompt)} />
        ) : (
          <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-2">
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
                {msg.resourceCategory && RESOURCE_CARDS[msg.resourceCategory] && (
                  <ResourceCard {...RESOURCE_CARDS[msg.resourceCategory]} />
                )}
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
        {messages.length === 0 && <div ref={bottomRef} />}
      </div>

      <CrisisBanner />

      {/* Input bar */}
      <div className="border-t border-border bg-background px-4 py-3">
        <form
          className="max-w-2xl mx-auto flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything…"
            disabled={isLoading || isCrisisLocked}
            className="flex-1 h-11 rounded-xl px-4 pl-10 md:pl-4 text-sm disabled:opacity-60"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isLoading || isCrisisLocked || !input.trim()}
            size="icon"
            className="h-11 w-11 rounded-xl bg-[#FF790E] hover:bg-[#e56d0d] text-white flex-shrink-0 disabled:opacity-50"
            aria-label="Send message"
          >
            <SendHorizonal size={18} />
          </Button>
        </form>
      </div>
      {isCrisisLocked && crisisPayload !== null && showOverlay && (
        <CrisisOverlay
          tier={crisisPayload.tier}
          category={crisisPayload.category}
          onAcknowledge={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
