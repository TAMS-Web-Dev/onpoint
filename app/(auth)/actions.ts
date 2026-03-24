"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export type AuthState = { error: string | null };

const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const SignUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
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

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = SignInSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    phoneNumber: (formData.get("phoneNumber") as string) || undefined,
    postcode: formData.get("postcode") as string,
  };

  const result = SignUpSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { fullName, email, password, dateOfBirth, phoneNumber, postcode } = result.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        date_of_birth: dateOfBirth,
        phone_number: phoneNumber ?? null,
        postcode: postcode.toUpperCase().trim(),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // No session means Supabase email confirmation is enabled
  if (!data.session) {
    redirect("/sign-in?message=check-email");
  }

  redirect("/");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
