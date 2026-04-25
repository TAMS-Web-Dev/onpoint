"use client";

import { Shield } from "lucide-react";

interface ConsentBannerProps {
  onAccept: () => void;
}

export function ConsentBanner({ onAccept }: ConsentBannerProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Chat consent"
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl p-8 flex flex-col gap-5">
        <div className="flex justify-center">
          <Shield size={40} className="text-purple-600" />
        </div>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Before we chat</h2>
        </div>

        <ul className="flex flex-col gap-2.5">
          {[
            "Your conversations are stored securely for up to 90 days.",
            "Our safeguarding team may review them if a concern is raised.",
            "You can delete your conversation history at any time in Settings.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-700">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <p className="text-sm text-gray-500 text-center">
          By continuing, you agree to these terms.
        </p>

        <button
          onClick={onAccept}
          className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg py-3 text-sm transition-colors"
        >
          I understand — let&apos;s chat
        </button>
      </div>
    </div>
  );
}
