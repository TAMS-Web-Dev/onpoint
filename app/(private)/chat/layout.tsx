"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex h-full">
        <ChatSidebar />
      </div>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar panel */}
          <div className="relative z-50 flex h-full">
            <ChatSidebar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Mobile toggle button */}
        <button
          className="md:hidden absolute top-3 left-3 z-30 flex items-center justify-center w-8 h-8 rounded-lg bg-background border border-border text-foreground hover:bg-muted transition-colors"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {children}
      </div>
    </div>
  );
}
