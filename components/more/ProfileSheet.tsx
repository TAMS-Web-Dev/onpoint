"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const LOCATION_OPTIONS = [
  "Birmingham", "Coventry", "Sandwell", "Solihull",
  "Walsall", "Wolverhampton", "Other",
];

const INTERESTS = [
  "Art & Design", "Careers", "Cooking", "Entrepreneurship", "Fashion",
  "Film & TV", "Fitness", "Gaming", "Mental Health", "Mental Health & Wellbeing",
  "Music", "Photography", "Sport", "Sports", "Tech", "Technology",
  "Travel", "Volunteering", "Writing",
];

const ProfileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  bio: z.string().max(300, "Bio must be 300 characters or less"),
  date_of_birth: z.string().nullable().optional(),
  interests: z.array(z.string()),
  next_of_kin_name: z.string().optional(),
  next_of_kin_contact: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (updates: ProfileUpdate) => void;
  isPending: boolean;
  userId: string;
  onAvatarUpdate: (url: string) => void;
}

export function ProfileSheet({ open, onClose, profile, onSave, isPending, userId, onAvatarUpdate }: ProfileSheetProps) {
  const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      bio: profile.bio ?? "",
      date_of_birth: profile.date_of_birth ?? undefined,
      interests: profile.interests ?? [],
      next_of_kin_name: profile.next_of_kin_name ?? "",
      next_of_kin_contact: profile.next_of_kin_contact ?? "",
    },
  });

  const [locationSelect, setLocationSelect] = useState("Other");
  const [locationOther, setLocationOther] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const loc = profile.location ?? "";
      const isKnown = LOCATION_OPTIONS.slice(0, -1).includes(loc);
      setLocationSelect(isKnown ? loc : "Other");
      setLocationOther(isKnown ? "" : loc);
      setAvatarUrl(profile.avatar_url ?? null);
      reset({
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
        date_of_birth: profile.date_of_birth ?? undefined,
        interests: profile.interests ?? [],
        next_of_kin_name: profile.next_of_kin_name ?? "",
        next_of_kin_contact: profile.next_of_kin_contact ?? "",
      });
    }
  }, [open, profile, reset]);

  const bioValue = watch("bio");

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      setAvatarUrl(publicUrl);
      onAvatarUpdate(publicUrl);
      toast.success("Profile picture updated!");
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function onSubmit(values: ProfileFormValues) {
    const finalLocation = locationSelect === "Other" ? locationOther : locationSelect;
    onSave({
      full_name: values.full_name,
      bio: values.bio || null,
      location: finalLocation || null,
      date_of_birth: values.date_of_birth ?? null,
      interests: values.interests,
      next_of_kin_name: values.next_of_kin_name || null,
      next_of_kin_contact: values.next_of_kin_contact || null,
    });
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="right" className="sm:max-w-md flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-extrabold text-[#2D1D44]">Edit Profile</SheetTitle>
          <SheetDescription>Update your name, bio, location and interests.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Avatar upload */}
          <div className="flex justify-center mb-6">
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="relative group cursor-pointer"
              aria-label="Change profile picture"
            >
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarUrl ?? undefined} />
                <AvatarFallback className="bg-primary text-white font-extrabold text-2xl">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              {/* Hover / uploading overlay */}
              <div className={`absolute inset-0 rounded-full bg-black/40 flex items-center justify-center transition-opacity ${uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                {uploading
                  ? <Loader2 size={20} className="text-white animate-spin" />
                  : <Camera size={20} className="text-white" />
                }
              </div>
              {/* Camera badge — always visible indicator */}
              {!uploading && (
                <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#FF790E] flex items-center justify-center border-2 border-white">
                  <Camera size={11} className="text-white" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <form id="profile-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                {...register("full_name")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
              {errors.full_name && <p className="mt-1.5 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Location
              </label>
              <select
                id="location"
                value={locationSelect}
                onChange={(e) => setLocationSelect(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              >
                <option value="" disabled>Select your area</option>
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {locationSelect === "Other" && (
                <input
                  type="text"
                  value={locationOther}
                  onChange={(e) => setLocationOther(e.target.value)}
                  placeholder="Enter your location"
                  className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
                />
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                type="date"
                {...register("date_of_birth")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
              {errors.date_of_birth && <p className="mt-1.5 text-xs text-red-500">{errors.date_of_birth.message}</p>}
            </div>

            {/* Next of Kin Name */}
            <div>
              <label htmlFor="next_of_kin_name" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Next of Kin Name
              </label>
              <input
                id="next_of_kin_name"
                type="text"
                placeholder="e.g. Sarah Smith"
                {...register("next_of_kin_name")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
            </div>

            {/* Next of Kin Contact */}
            <div>
              <label htmlFor="next_of_kin_contact" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Next of Kin Contact
              </label>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#FF790E] focus-within:border-transparent transition">
                <span className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-200 select-none flex-shrink-0">
                  +44
                </span>
                <input
                  id="next_of_kin_contact"
                  type="tel"
                  autoComplete="tel"
                  placeholder="7700 900000"
                  {...register("next_of_kin_contact")}
                  className="flex-1 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="e.g. I'm interested in photography and music. I'm looking to build a career in creative arts. My skills include video editing and design."
                {...register("bio")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition resize-none"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio ? <p className="text-xs text-red-500">{errors.bio.message}</p> : <span />}
                <p className="text-xs text-gray-400 ml-auto">{(bioValue ?? "").length}/300</p>
              </div>
            </div>

            {/* Interests */}
            <div>
              <p className="block text-sm font-semibold text-[#2D1D44] mb-3">My Interests</p>
              <Controller
                name="interests"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => {
                      const selected = field.value.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              field.onChange(field.value.filter((i) => i !== interest));
                            } else {
                              field.onChange([...field.value, interest]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
                            selected
                              ? "bg-[#FF790E] text-white border-[#FF790E]"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#FF790E] hover:text-[#FF790E]"
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0">
          <button
            type="submit"
            form="profile-form"
            disabled={isPending}
            className="w-full bg-[#FF790E] hover:bg-[#e56d0d] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
