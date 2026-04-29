import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* AI badge — ICO transparency requirement */}
      {!isUser && (
        <span className="flex-shrink-0 self-end mb-5 inline-flex items-center justify-center rounded-full bg-[#2D1D44]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#2D1D44]">
          AO
        </span>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
            isUser
              ? "bg-[#2D1D44] text-white rounded-2xl rounded-tr-sm whitespace-pre-wrap"
              : "bg-white text-gray-800 ring-1 ring-border rounded-2xl rounded-tl-sm shadow-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1"
          }`}
        >
          {isUser ? content : <ReactMarkdown>{content}</ReactMarkdown>}
        </div>
        <span className="text-[11px] text-muted-foreground px-1">{format(timestamp, "HH:mm")}</span>
      </div>
    </div>
  );
}
