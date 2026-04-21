import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

// ─── Encryption ──────────────────────────────────────────────────────────────

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;   // 96-bit IV — standard for GCM
const TAG_BYTES = 16;  // 128-bit auth tag

function getKey(): Buffer {
  const hex = process.env.CHAT_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error("CHAT_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Format: iv.authTag.ciphertext  (all base64)
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decrypt(stored: string): string {
  const key = getKey();
  const parts = stored.split(".");
  if (parts.length !== 3) throw new Error("Invalid encrypted payload format.");

  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DecryptedMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ─── Supabase Operations ──────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create chat session.");
  return data.id as string;
}

export async function getOrCreateSession(userId: string): Promise<string> {
  const supabase = await createClient();

  // Fetch the most recent session for this user
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data) return data.id as string;

  return createSession(userId);
}

export async function saveMessage({
  sessionId,
  role,
  content,
}: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
}): Promise<void> {
  const supabase = await createClient();
  const encryptedContent = encrypt(content);

  const { error } = await supabase.from("chat_messages").insert({
    session_id: sessionId,
    role,
    content: encryptedContent,
  });

  if (error) throw new Error(error.message);
}

export interface SessionPreview {
  id: string;
  preview: string;
  created_at: string;
}

export async function getUserSessions(userId: string): Promise<SessionPreview[]> {
  const supabase = await createClient();

  const { data: sessions, error } = await supabase
    .from("chat_sessions")
    .select("id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!sessions || sessions.length === 0) return [];

  // For each session, fetch the first user message as preview
  const previews = await Promise.all(
    sessions.map(async (session) => {
      const { data: msg } = await supabase
        .from("chat_messages")
        .select("content")
        .eq("session_id", session.id)
        .eq("role", "user")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      let preview = "New Chat";
      if (msg?.content) {
        try {
          const decrypted = decrypt(msg.content as string);
          preview = decrypted.length > 35 ? decrypted.slice(0, 35) + "…" : decrypted;
        } catch {
          preview = "New Chat";
        }
      }

      return {
        id: session.id as string,
        preview,
        created_at: session.created_at as string,
      };
    })
  );

  return previews;
}

export async function getChatHistory(sessionId: string): Promise<DecryptedMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, session_id, role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!data) return [];

  return data.map((row) => ({
    id: row.id as string,
    session_id: row.session_id as string,
    role: row.role as "user" | "assistant",
    content: decrypt(row.content as string),
    created_at: row.created_at as string,
  }));
}
