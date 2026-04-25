"use client";

import { Button } from "@/components/ui/button";

interface CrisisOverlayProps {
  tier: "tier1" | "tier2" | "tier3";
  category: "life-risk" | "safeguarding" | "jailbreak" | "distress" | null;
  onAcknowledge: () => void;
}

interface Resource {
  emoji: string;
  name: string;
  detail: string;
  prominent?: boolean;
}

const BOT_TEXT: Record<"tier1" | "tier2" | "tier3", string> = {
  tier3:
    "I hear you, and I'm really worried about you right now.\nPlease reach out to someone tonight — call or text Childline (0800 1111, free, 24/7) or text SHOUT to 85258.\nYou matter, and you don't have to face this alone.",
  tier2:
    "What you've told me is important, and I want you to know: you've done nothing wrong. You deserve to be safe.\nChildline (0800 1111, free, 24/7) can talk this through with you confidentially — or if you're in immediate danger, please call 999.",
  tier1:
    "It sounds like you're going through something really hard right now.\nYou don't have to face this alone. There are people who want to help.",
};

const JAILBREAK_TEXT =
  "I'm always Ask OnPoint — I can't become a different kind of assistant.\nBut if something is going on for you personally, I'm here for that.";

const RESOURCES: Record<"tier1" | "tier2" | "tier3", Resource[]> = {
  tier3: [
    {
      emoji: "🚨",
      name: "999",
      detail: "Call immediately if you are in immediate danger",
      prominent: true,
    },
    { emoji: "📞", name: "Childline", detail: "0800 1111 (free, 24/7)" },
    { emoji: "💬", name: "SHOUT", detail: "Text SHOUT to 85258 (free, silent, 24/7)" },
    { emoji: "📞", name: "Samaritans", detail: "116 123 (free, 24/7)" },
    { emoji: "🏥", name: "NHS 111", detail: "Call 111 option 2 for urgent mental health support" },
  ],
  tier2: [
    { emoji: "📞", name: "Childline", detail: "0800 1111 (free, 24/7)" },
    { emoji: "💬", name: "SHOUT", detail: "Text SHOUT to 85258 (free, silent, 24/7)" },
    { emoji: "📞", name: "Samaritans", detail: "116 123 (free, 24/7)" },
    { emoji: "🚨", name: "999", detail: "Call if you are in immediate danger" },
  ],
  tier1: [
    { emoji: "💬", name: "Kooth", detail: "kooth.com (free, no waiting list)" },
    { emoji: "📞", name: "YoungMinds", detail: "0808 802 5544 (Mon–Fri)" },
    { emoji: "📞", name: "Childline", detail: "0800 1111 (free, 24/7)" },
  ],
};

const CARD_STYLES: Record<"tier1" | "tier2" | "tier3", string> = {
  tier3: "border-red-400 bg-red-50",
  tier2: "border-amber-400 bg-amber-50",
  tier1: "border-blue-300 bg-blue-50",
};

const TEXT_STYLES: Record<"tier1" | "tier2" | "tier3", string> = {
  tier3: "text-red-900",
  tier2: "text-amber-900",
  tier1: "text-blue-900",
};

const BUTTON_STYLES: Record<"tier1" | "tier2" | "tier3", string> = {
  tier3: "bg-red-700 hover:bg-red-800 text-white",
  tier2: "bg-amber-600 hover:bg-amber-700 text-white",
  tier1: "bg-blue-600 hover:bg-blue-700 text-white",
};

const DIVIDER_STYLES: Record<"tier1" | "tier2" | "tier3", string> = {
  tier3: "border-red-200",
  tier2: "border-amber-200",
  tier1: "border-blue-200",
};

export function CrisisOverlay({ tier, category, onAcknowledge }: CrisisOverlayProps) {
  const isJailbreak = category === "jailbreak";
  const botText = isJailbreak ? JAILBREAK_TEXT : BOT_TEXT[tier];
  const resources = isJailbreak ? [] : RESOURCES[tier];
  const prominent = resources.find((r) => r.prominent);
  const rest = resources.filter((r) => !r.prominent);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-label="Crisis support information"
    >
      <div
        className={`w-full max-w-md rounded-2xl border-2 shadow-xl overflow-y-auto max-h-[90vh] p-6 flex flex-col gap-5 ${CARD_STYLES[tier]}`}
      >
        {/* Bot response */}
        <p className={`text-sm leading-relaxed whitespace-pre-line font-medium ${TEXT_STYLES[tier]}`}>
          {botText}
        </p>

        {/* Resources */}
        {resources.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Prominent 999 block (Tier 3 only) */}
            {prominent && (
              <div className="rounded-xl bg-red-700 text-white px-4 py-3 flex items-start gap-3">
                <span className="text-xl leading-none mt-0.5">{prominent.emoji}</span>
                <div>
                  <p className="text-base font-bold leading-snug">{prominent.name}</p>
                  <p className="text-sm font-medium opacity-90">{prominent.detail}</p>
                </div>
              </div>
            )}

            {/* Regular resource rows */}
            <ul className="flex flex-col gap-2">
              {rest.map((r) => (
                <li key={r.name} className="flex items-start gap-2.5">
                  <span className="text-base leading-none mt-0.5 flex-shrink-0">{r.emoji}</span>
                  <p className={`text-sm leading-snug ${TEXT_STYLES[tier]}`}>
                    <span className="font-semibold">{r.name}</span>
                    {" — "}
                    {r.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Team notice */}
        {!isJailbreak && (
          <>
            <hr className={`border-t ${DIVIDER_STYLES[tier]}`} />
            <p className={`text-xs italic ${TEXT_STYLES[tier]} opacity-75`}>
              I&apos;ve let a member of the OnPoint team know you&apos;re here.
            </p>
          </>
        )}

        {/* Acknowledge button */}
        <Button
          onClick={onAcknowledge}
          className={`w-full rounded-xl h-11 text-sm font-semibold ${BUTTON_STYLES[tier]}`}
        >
          I understand
        </Button>
      </div>
    </div>
  );
}
