'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '../supabase/server'

export async function login(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and Password are required' }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required' }
    }

    // Basic validation rules (should also apply on client)
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
        return { error: 'Password does not meet complexity requirements' }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard', 'layout')
    redirect('/dashboard')
}

export async function resetPassword(formData: FormData) {
    const supabase = createClient()

    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: 'Check your email for the reset link' }
}

export async function updatePassword(formData: FormData) {
    const supabase = createClient()

    const password = formData.get('password') as string

    if (!password) {
        return { error: 'Password is required' }
    }

    // Complexity rules check
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password)) {
        return { error: 'Password does not meet complexity requirements' }
    }

    const { error } = await supabase.auth.updateUser({
        password
    })

    if (error) {
        return { error: error.message }
    }

    redirect('/dashboard')
}

export async function logout() {
    const supabase = createClient()
    await supabase.auth.signOut()

    revalidatePath('/', 'layout')
    redirect('/login')
}
