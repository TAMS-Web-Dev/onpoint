import { create } from "zustand";

export interface SessionPreview {
  id: string;
  preview: string;
  created_at: string;
}

interface ChatState {
  sessionId: string | null;
  sessions: SessionPreview[];
  setSessionId: (id: string) => void;
  setSessions: (sessions: SessionPreview[]) => void;
  addSession: (session: SessionPreview) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  sessions: [],
  setSessionId: (id) => set({ sessionId: id }),
  setSessions: (sessions) => set({ sessions }),
  addSession: (session) =>
    set((state) => ({ sessions: [session, ...state.sessions] })),
}));
