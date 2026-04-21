const PROMPTS = [
  "I'm feeling anxious about something",
  "What careers suit creative people?",
  "Are there any events near me this week?",
  "How do I talk to my GP about my mental health?",
  "I need help with something personal",
  "What support is there for young people in my area?",
];

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-8 text-center">
      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#2D1D44]/10">
        <span className="text-xl">👋</span>
      </div>
      <h2 className="text-lg font-extrabold text-[#2D1D44] mb-1">Hi, I&apos;m OnPoint AI</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Here to help with careers, mental health, events, and more. What&apos;s on your mind?
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-md">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => onSelect(prompt)}
            className="rounded-full border border-border bg-white px-4 py-2 text-sm text-gray-700 transition-all hover:border-[#FF790E] hover:text-[#FF790E] hover:shadow-sm active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
