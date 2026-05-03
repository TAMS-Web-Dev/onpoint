"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import type { Profile, Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onToggle: (updates: ProfileUpdate) => void;
  isPending: boolean;
}

export function SettingsSheet({
  open,
  onClose,
  profile,
  onToggle,
  isPending,
}: SettingsSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent side="right" className="sm:max-w-md flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-extrabold text-[#2D1D44]">
            Account Settings
          </SheetTitle>
          <SheetDescription>
            Manage your notification, privacy, and accessibility preferences.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">

          {/* ── Notifications ── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Notifications
          </p>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="pr-4">
              <label
                htmlFor="switch-email"
                className="text-sm font-semibold text-[#2D1D44] cursor-pointer"
              >
                Email Notifications
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Receive event updates and announcements via email
              </p>
            </div>
            <Switch
              id="switch-email"
              checked={profile.email_notifications}
              onCheckedChange={(val) => onToggle({ email_notifications: val })}
              disabled={isPending}
            />
          </div>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="pr-4">
              <label
                htmlFor="switch-push"
                className="text-sm font-semibold text-[#2D1D44] cursor-pointer"
              >
                Push Notifications
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Get real-time alerts about events near you
              </p>
            </div>
            <Switch
              id="switch-push"
              checked={profile.push_notifications}
              onCheckedChange={(val) => onToggle({ push_notifications: val })}
              disabled={isPending}
            />
          </div>

          {/* ── Privacy ── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-6 pb-2">
            Privacy
          </p>

          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="pr-4">
              <label
                htmlFor="switch-visibility"
                className="text-sm font-semibold text-[#2D1D44] cursor-pointer"
              >
                Profile Visibility
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                {profile.is_public
                  ? "Public - anyone can view your profile"
                  : "Members Only - only signed-in users can view"}
              </p>
            </div>
            <Switch
              id="switch-visibility"
              checked={profile.is_public}
              onCheckedChange={(val) => onToggle({ is_public: val })}
              disabled={isPending}
            />
          </div>

          {/* ── Accessibility ── */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pt-6 pb-2">
            Accessibility
          </p>

          <div className="flex items-center justify-between py-4">
            <div className="pr-4">
              <label
                htmlFor="switch-contrast"
                className="text-sm font-semibold text-[#2D1D44] cursor-pointer"
              >
                High Contrast Mode
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                Increase colour contrast for better readability
              </p>
            </div>
            <Switch
              id="switch-contrast"
              checked={profile.high_contrast}
              onCheckedChange={(val) => onToggle({ high_contrast: val })}
              disabled={isPending}
            />
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
