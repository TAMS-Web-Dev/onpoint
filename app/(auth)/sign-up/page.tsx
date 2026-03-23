"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { signUp, type AuthState } from "../actions";

const SignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  age: z.coerce
    .number({ invalid_type_error: "Please enter a valid age." })
    .int()
    .min(13, "You must be at least 13 years old to join.")
    .max(100, "Please enter a valid age."),
  postcode: z
    .string()
    .min(5, "Please enter a valid postcode.")
    .max(8, "Please enter a valid postcode.")
    .regex(/^[A-Z0-9\s]+$/i, "Postcode must only contain letters and numbers."),
});

type SignUpValues = z.infer<typeof SignUpSchema>;

export default function SignUpPage() {
  const [state, dispatch, isPending] = useActionState<AuthState, FormData>(signUp, { error: null });
  const [showPassword, setShowPassword] = useState(false);

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
    formData.set("age", String(values.age));
    formData.set("postcode", values.postcode);
    startTransition(() => dispatch(formData));
  }

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

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-[#2D1D44] leading-snug">
            Ready to be part of something{' '}
            <span className="text-[#FF790E]">real?</span>
          </h1>
          <p className="mt-1.5 text-sm text-gray-400 font-medium">
            Sign up in 30 seconds.
          </p>
        </div>

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

          {/* Age + Postcode — side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="age" className="block text-sm font-semibold text-[#2D1D44] mb-1.5">
                Age
              </label>
              <input
                id="age"
                type="number"
                inputMode="numeric"
                min={13}
                max={100}
                placeholder="e.g. 18"
                {...register("age", { valueAsNumber: true })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF790E] focus:border-transparent transition"
              />
              {errors.age && <p className="mt-1.5 text-xs text-red-500">{errors.age.message}</p>}
            </div>

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
                placeholder="Min. 8 characters"
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
