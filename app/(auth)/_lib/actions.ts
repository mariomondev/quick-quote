"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  type SignInInput,
  type SignUpInput,
  type ForgotPasswordInput,
} from "./schemas";

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function signIn(data: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/dashboard");
}

export async function signUp(data: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      }/auth/callback`,
      data: {
        full_name: parsed.data.full_name,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function forgotPassword(
  data: ForgotPasswordInput
): Promise<AuthResult> {
  const parsed = forgotPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      }/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
