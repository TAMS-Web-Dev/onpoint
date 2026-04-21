export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      {/* AI badge — matches MessageBubble alignment */}
      <span className="flex-shrink-0 self-end mb-5 inline-flex items-center justify-center rounded-full bg-[#2D1D44]/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-[#2D1D44]">
        AI
      </span>

      <div className="flex flex-col gap-1 items-start">
        <div className="bg-white ring-1 ring-border rounded-2xl rounded-tl-sm shadow-sm px-4 py-3">
          <div className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full bg-[#2D1D44]/40 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-[#2D1D44]/40 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="h-2 w-2 rounded-full bg-[#2D1D44]/40 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
