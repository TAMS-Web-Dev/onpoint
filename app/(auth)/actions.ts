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

export async function signIn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = SignInSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
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
    age: formData.get("age") as string,
    postcode: formData.get("postcode") as string,
  };

  const result = SignUpSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  const { fullName, email, password, age, postcode } = result.data;
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, age, postcode: postcode.toUpperCase().trim() },
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
