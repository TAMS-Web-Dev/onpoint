"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getOrCreateSession,
  createSession,
  saveMessage,
  getChatHistory,
  getUserSessions,
  type DecryptedMessage,
  type SessionPreview,
} from "@/lib/chat";

export async function initChatSession(): Promise<{
  sessionId: string;
  history: DecryptedMessage[];
  sessions: SessionPreview[];
}> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated.");

  const [sessionId, sessions] = await Promise.all([
    getOrCreateSession(user.id),
    getUserSessions(user.id),
  ]);

  const history = await getChatHistory(sessionId);

  return { sessionId, history, sessions };
}

export async function loadSession(sessionId: string): Promise<DecryptedMessage[]> {
  return getChatHistory(sessionId);
}

export async function startNewSession(): Promise<{
  sessionId: string;
  preview: SessionPreview;
}> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated.");

  const sessionId = await createSession(user.id);

  const { data: session } = await supabase
    .from("chat_sessions")
    .select("created_at")
    .eq("id", sessionId)
    .single();

  return {
    sessionId,
    preview: {
      id: sessionId,
      preview: "New Chat",
      created_at: (session?.created_at as string) ?? new Date().toISOString(),
    },
  };
}

export async function persistMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  await saveMessage({ sessionId, role, content });
}
