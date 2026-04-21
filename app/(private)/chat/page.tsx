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
import { useChatStore } from "@/store/chat-store";
import { initChatSession, loadSession, persistMessage } from "./actions";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  resources?: ResourceCardProps[];
};

export default function ChatPage() {
  const { sessionId, setSessionId, setSessions } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialising, setIsInitialising] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevSessionRef = useRef<string | null>(null);

  // Bootstrap: run once on mount to get session + sessions list + initial history
  useEffect(() => {
    async function init() {
      try {
        const { sessionId: sid, history, sessions } = await initChatSession();
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
        setIsInitialising(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to session switches from the sidebar
  useEffect(() => {
    if (!sessionId) return;
    if (prevSessionRef.current === sessionId) return;
    prevSessionRef.current = sessionId;

    // Skip reload on initial mount (messages already set above)
    if (isInitialising) return;

    setIsLoading(false);
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

  // Auto-scroll to bottom on new messages or loading state
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isLoading || !sessionId) return;

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
      // Placeholder: replaced by real Anthropic streaming in Task 2.4
      await new Promise((resolve) => setTimeout(resolve, 1800));

      const aiContent =
        "Thanks for sharing that with me. I'm here to help — could you tell me a little more so I can point you to the right support?";

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      persistMessage(sessionId, "assistant", aiContent).catch(() => {
        toast.error("The AI response could not be saved.");
      });
    } catch {
      toast.error("Something went wrong. Please try again.");
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
                {msg.resources?.map((resource) => (
                  <ResourceCard key={resource.url} {...resource} />
                ))}
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
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl px-4 pl-10 md:pl-4 text-sm disabled:opacity-60"
            autoComplete="off"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-11 w-11 rounded-xl bg-[#FF790E] hover:bg-[#e56d0d] text-white flex-shrink-0 disabled:opacity-50"
            aria-label="Send message"
          >
            <SendHorizonal size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}
