import { ExternalLink } from "lucide-react";

export interface ResourceCardProps {
  title: string;
  description: string;
  url: string;
  linkLabel?: string;
}

export function ResourceCard({ title, description, url, linkLabel = "Learn More" }: ResourceCardProps) {
  return (
    <div className="flex items-stretch max-w-[75%] rounded-2xl rounded-tl-sm overflow-hidden ring-1 ring-border shadow-sm bg-white">
      {/* Orange accent bar */}
      <div className="w-1 flex-shrink-0 bg-[#FF790E]" aria-hidden="true" />

      <div className="flex flex-col gap-2 px-4 py-3 flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2D1D44] leading-snug">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkLabel} - ${title} (opens in new tab)`}
          className="mt-0.5 self-start inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF790E] hover:underline focus-visible:underline outline-none transition-colors"
        >
          {linkLabel}
          <ExternalLink size={11} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
