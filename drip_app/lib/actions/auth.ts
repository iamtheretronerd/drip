'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignUpSchema, LoginSchema, ResetPasswordSchema, UpdatePasswordSchema } from '@/lib/validations/auth';
import type { ActionResult } from '@/types';

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = SignUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(
      parsed.error.flatten().fieldErrors,
    )) {
      if (messages?.[0]) fieldErrors[field] = messages[0];
    }
    return { success: false, fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) return { success: false, error: 'Database not connected.' };

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect('/onboarding');
}

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(
    _prevState: ActionResult,
    formData: FormData,
): Promise<ActionResult> {
    const raw = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    const parsed = LoginSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(
            parsed.error.flatten().fieldErrors,
        )) {
            if (messages?.[0]) fieldErrors[field] = messages[0];
        }
        return { success: false, fieldErrors };
    }

    const supabase = await createClient();
    if (!supabase) return { success: false, error: 'Database not connected.' };

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Generic message to avoid leaking user existence info
    return {
      success: false,
      error: 'Invalid email or password. Please try again.',
    };
  }

  // Dashboard will handle onboarding check
  redirect('/dashboard');
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    const supabase = await createClient();
    if (supabase) await supabase.auth.signOut();
    redirect('/login');
}

// ─── Reset Password ───────────────────────────────────────────────────────────
export async function resetPassword(
    _prevState: ActionResult,
    formData: FormData,
): Promise<ActionResult> {
    const raw = { email: formData.get('email') as string };

    const parsed = ResetPasswordSchema.safeParse(raw);
    if (!parsed.success) {
        return {
            success: false,
            fieldErrors: { email: parsed.error.flatten().fieldErrors.email?.[0] },
        };
    }

    const supabase = await createClient();
    if (!supabase) return { success: false, error: 'Database not connected.' };

    const { error } = await supabase.auth.resetPasswordForEmail(
        parsed.data.email,
        {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback?next=/update-password`,
        },
    );

  // Always return success to prevent email enumeration
  // Even if there's an error, we don't reveal whether the email exists
  return {
    success: true,
    data: null,
  };
}

// ─── Update Password ──────────────────────────────────────────────────────────
export async function updatePassword(
    _prevState: ActionResult,
    formData: FormData,
): Promise<ActionResult> {
    const raw = {
        password: formData.get('password') as string,
        confirmPassword: formData.get('confirmPassword') as string,
    };

    const parsed = UpdatePasswordSchema.safeParse(raw);
    if (!parsed.success) {
        const fieldErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(
            parsed.error.flatten().fieldErrors,
        )) {
            if (messages?.[0]) fieldErrors[field] = messages[0];
        }
        return { success: false, fieldErrors };
    }

    const supabase = await createClient();
    if (!supabase) return { success: false, error: 'Database not connected.' };

    const { error } = await supabase.auth.updateUser({
        password: parsed.data.password,
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // Dashboard will handle onboarding check
  redirect('/dashboard');
}
