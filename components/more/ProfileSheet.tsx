"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import type { Profile, Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const INTERESTS = ["Mental Health", "Music", "Careers", "Gaming", "Art & Design", "Sport", "Tech", "Cooking"];

const ProfileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  bio: z.string().max(300, "Bio must be 300 characters or less"),
  location: z.string(),
  date_of_birth: z.string().nullable().optional(),
  interests: z.array(z.string()),
  next_of_kin_name: z.string().optional(),
  next_of_kin_contact: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

interface ProfileSheetProps {
  open: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (updates: ProfileUpdate) => void;
  isPending: boolean;
}

export function ProfileSheet({ open, onClose, profile, onSave, isPending }: ProfileSheetProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: profile.full_name ?? "",
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      date_of_birth: profile.date_of_birth ?? undefined,
      interests: profile.interests ?? [],
      next_of_kin_name: profile.next_of_kin_name ?? "",
      next_of_kin_contact: profile.next_of_kin_contact ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        full_name: profile.full_name ?? "",
        bio: profile.bio ?? "",
        location: profile.location ?? "",
        date_of_birth: profile.date_of_birth ?? undefined,
        interests: profile.interests ?? [],
        next_of_kin_name: profile.next_of_kin_name ?? "",
        next_of_kin_contact: profile.next_of_kin_contact ?? "",
      });
    }
  }, [open, profile, reset]);

  const bioValue = watch("bio");

  function onSubmit(values: ProfileFormValues) {
    onSave({
      full_name: values.full_name,
      bio: values.bio || null,
      location: values.location || null,
      date_of_birth: values.date_of_birth ?? null,
      interests: values.interests,
      next_of_kin_name: values.next_of_kin_name || null,
      next_of_kin_contact: values.next_of_kin_contact || null,
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <SheetContent side="right" className="sm:max-w-md flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-lg font-extrabold text-[#2D1D44]">Edit Profile</SheetTitle>
          <SheetDescription>Update your name, bio, location and interests.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
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
              <input
                id="location"
                type="text"
                placeholder="Birmingham, West Midlands"
                {...register("location")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
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
              <input
                id="next_of_kin_contact"
                type="text"
                placeholder="e.g. +44 7700 900000"
                {...register("next_of_kin_contact")}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                placeholder="Tell the community a little about yourself..."
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

        {/* Footer — lives outside the scroll area */}
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
