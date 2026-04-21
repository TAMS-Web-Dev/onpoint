import { Phone, MessageSquare } from "lucide-react";

export function CrisisBanner() {
  return (
    <div
      className="flex-shrink-0 px-4 py-2"
      role="region"
      aria-label="Emergency contacts"
    >
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-3 flex-wrap rounded-2xl border border-rose-200/80 bg-rose-50/70 px-5 py-2 shadow-sm backdrop-blur-sm">

          {/* Pulsing indicator + label */}
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-rose-500 select-none">
              Need help now?
            </span>
          </span>

          <span className="text-rose-200 select-none text-xs" aria-hidden="true">|</span>

          {/* 999 */}
          <a
            href="tel:999"
            className="flex items-center gap-1 text-xs text-rose-700 font-bold tracking-wide hover:text-rose-900 transition-colors outline-none focus-visible:underline"
            aria-label="Call 999 emergency services"
          >
            <Phone size={11} aria-hidden="true" className="text-rose-400" />
            999
          </a>

          <span className="text-rose-200 select-none text-xs" aria-hidden="true">·</span>

          {/* Childline */}
          <a
            href="tel:08001111"
            className="flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 transition-colors outline-none focus-visible:underline"
            aria-label="Call Childline on 0800 1111"
          >
            <Phone size={11} aria-hidden="true" className="text-rose-400" />
            <span>Childline <span className="font-semibold">0800 1111</span></span>
          </a>

          <span className="text-rose-200 select-none text-xs" aria-hidden="true">·</span>

          {/* SHOUT */}
          <span
            className="flex items-center gap-1 text-xs text-rose-700"
            aria-label="Text SHOUT on 85258"
          >
            <MessageSquare size={11} aria-hidden="true" className="text-rose-400" />
            <span>SHOUT — Text <span className="font-semibold">85258</span></span>
          </span>

        </div>
      </div>
    </div>
  );
}
