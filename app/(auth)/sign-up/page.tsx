"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signUp, signUpPartner, type AuthState } from "../actions";
import { passwordSchema } from "@/lib/validation/password";

// ─── Young Person (unchanged) ────────────────────────────────────────────────

const SignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: passwordSchema,
  dateOfBirth: z.string().refine((val) => {
    const dob = new Date(val);
    if (isNaN(dob.getTime())) return false;
    const today = new Date();
    const minAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    return dob <= minAge;
  }, "You must be at least 13 years old to join."),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+44|0)\d{9,10}$/.test(val.replace(/\s/g, "")), {
      message: "Please enter a valid UK phone number.",
    }),
  postcode: z
    .string()
    .min(5, "Please enter a valid postcode.")
    .max(8, "Please enter a valid postcode.")
    .regex(/^[A-Z0-9\s]+$/i, "Postcode must only contain letters and numbers."),
});

type SignUpValues = z.infer<typeof SignUpSchema>;

function YoungPersonForm() {
  const [state, dispatch, isPending] = useActionState<AuthState, FormData>(signUp, { error: null });
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(SignUpSchema),
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function onSubmit(values: SignUpValues) {
    const formData = new FormData();
    formData.set("fullName", values.fullName);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("dateOfBirth", values.dateOfBirth);
    if (values.phoneNumber) formData.set("phoneNumber", values.phoneNumber);
    formData.set("postcode", values.postcode);
    formData.set("emailNotifications", emailNotifications ? "true" : "false");
    startTransition(() => dispatch(formData));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          {...register("fullName")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.fullName && <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Date of Birth
        </label>
        <input
          id="dateOfBirth"
          type="date"
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
          {...register("dateOfBirth")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.dateOfBirth && <p className="mt-1.5 text-xs text-red-500">{errors.dateOfBirth.message}</p>}
      </div>

      {/* Postcode */}
      <div>
        <label htmlFor="postcode" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Postcode
        </label>
        <input
          id="postcode"
          type="text"
          autoComplete="postal-code"
          placeholder="e.g. B1 1BB"
          {...register("postcode")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition uppercase"
        />
        {errors.postcode && <p className="mt-1.5 text-xs text-red-500">{errors.postcode.message}</p>}
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Phone Number <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="phoneNumber"
          type="tel"
          autoComplete="tel"
          placeholder="e.g. 07700 900000"
          {...register("phoneNumber")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.phoneNumber && <p className="mt-1.5 text-xs text-red-500">{errors.phoneNumber.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 12 characters"
            {...register("password")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Marketing consent */}
      <div className="flex items-start gap-3">
        <input
          id="emailNotifications"
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#FF790E]"
        />
        <label htmlFor="emailNotifications" className="text-sm text-gray-600 leading-snug cursor-pointer">
          I would like to receive updates and news from OnPoint via email (optional)
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FF790E] hover:bg-[#e56d0d] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? "Creating Account…" : "Create Account"}
      </button>
    </form>
  );
}

// ─── Partner Organisation ─────────────────────────────────────────────────────

const ORGANISATION_TYPES = [
  "Private/Limited Company",
  "Faith Organisation",
  "Charity",
  "Local Authority",
  "Combined Authority",
  "Individual",
  "Volunteer",
  "Non Profit",
  "Parent",
  "Other",
] as const;

const PartnerSchema = z.object({
  organisationName: z.string().min(2, "Organisation name must be at least 2 characters."),
  organisationType: z.string().min(1, "Please select an organisation type."),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters."),
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .refine((val) => /^(\+44|0)\d{9,10}$/.test(val.replace(/\s/g, "")), {
      message: "Please enter a valid UK phone number.",
    }),
  email: z.string().email("Please enter a valid email address."),
  password: passwordSchema,
});

type PartnerValues = z.infer<typeof PartnerSchema>;

function PartnerForm() {
  const [state, dispatch, isPending] = useActionState<AuthState, FormData>(signUpPartner, { error: null });
  const [showPassword, setShowPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartnerValues>({
    resolver: zodResolver(PartnerSchema),
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  function onSubmit(values: PartnerValues) {
    const formData = new FormData();
    formData.set("organisationName", values.organisationName);
    formData.set("organisationType", values.organisationType);
    formData.set("jobTitle", values.jobTitle);
    formData.set("phone", values.phone);
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("emailNotifications", emailNotifications ? "true" : "false");
    startTransition(() => dispatch(formData));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Organisation Name */}
      <div>
        <label htmlFor="organisationName" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Organisation Name
        </label>
        <input
          id="organisationName"
          type="text"
          autoComplete="organization"
          placeholder="e.g. Birmingham Youth Trust"
          {...register("organisationName")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.organisationName && <p className="mt-1.5 text-xs text-red-500">{errors.organisationName.message}</p>}
      </div>

      {/* Organisation Type */}
      <div>
        <label htmlFor="organisationType" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Organisation Type
        </label>
        <select
          id="organisationType"
          {...register("organisationType")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
          defaultValue=""
        >
          <option value="" disabled>Select organisation type</option>
          {ORGANISATION_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.organisationType && <p className="mt-1.5 text-xs text-red-500">{errors.organisationType.message}</p>}
      </div>

      {/* Job Title */}
      <div>
        <label htmlFor="jobTitle" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Job Title
        </label>
        <input
          id="jobTitle"
          type="text"
          autoComplete="organization-title"
          placeholder="e.g. Youth Engagement Manager"
          {...register("jobTitle")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.jobTitle && <p className="mt-1.5 text-xs text-red-500">{errors.jobTitle.message}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="partnerPhone" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Phone Number
        </label>
        <input
          id="partnerPhone"
          type="tel"
          autoComplete="tel"
          placeholder="e.g. 07700 900000"
          {...register("phone")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.phone && <p className="mt-1.5 text-xs text-red-500">{errors.phone.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="partnerEmail" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Email Address
        </label>
        <input
          id="partnerEmail"
          type="email"
          autoComplete="email"
          placeholder="you@organisation.com"
          {...register("email")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
        />
        {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="partnerPassword" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="partnerPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 12 characters"
            {...register("password")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Marketing consent */}
      <div className="flex items-start gap-3">
        <input
          id="partnerEmailNotifications"
          type="checkbox"
          checked={emailNotifications}
          onChange={(e) => setEmailNotifications(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#FF790E]"
        />
        <label htmlFor="partnerEmailNotifications" className="text-sm text-gray-600 leading-snug cursor-pointer">
          I would like to receive updates and news from OnPoint via email (optional)
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#FF790E] hover:bg-[#e56d0d] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {isPending && <Loader2 size={16} className="animate-spin" />}
        {isPending ? "Submitting…" : "Request Access"}
      </button>
    </form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type UserType = "young_person" | "partner";

export default function SignUpPage() {
  const [userType, setUserType] = useState<UserType>("young_person");

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/assets/onpoint-logo-icon-orange-with-blue-type.png"
            alt="OnPoint"
            width={160}
            height={48}
            priority
          />
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl border border-gray-200 p-1 mb-8">
          <button
            type="button"
            onClick={() => setUserType("young_person")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              userType === "young_person"
                ? "bg-[#2D1D44] text-white"
                : "text-gray-500 hover:text-[#2D1D44]"
            }`}
          >
            Young Person
          </button>
          <button
            type="button"
            onClick={() => setUserType("partner")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              userType === "partner"
                ? "bg-[#2D1D44] text-white"
                : "text-gray-500 hover:text-[#2D1D44]"
            }`}
          >
            Partner Organisation
          </button>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#2D1D44] leading-snug">
            {userType === "young_person" ? (
              <>Ready to be part of something{' '}<span className="text-[#FF790E]">real?</span></>
            ) : (
              <>Work with us to make a{' '}<span className="text-[#FF790E]">difference.</span></>
            )}
          </h1>
          <p className="mt-1.5 text-sm text-gray-400 font-medium">
            {userType === "young_person" ? "Sign up in 30 seconds." : "Register your organisation."}
          </p>
        </div>

        {/* Form — completely independent components */}
        {userType === "young_person" ? <YoungPersonForm /> : <PartnerForm />}

        {/* Footer link */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#FF790E] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
