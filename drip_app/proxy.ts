import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Routes that require an active session
const PROTECTED_ROUTES = ['/', '/dashboard', '/closet', '/outfit', '/history', '/forecast', '/profile', '/onboarding', '/update-password'];
// Routes that should redirect authenticated users away
const AUTH_ROUTES = ['/login', '/signup', '/reset-password'];

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}

function isAuthRoute(pathname: string): boolean {
    return AUTH_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
    );
}

export async function proxy(request: NextRequest) {
    const isConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-');

    if (!isConfigured) {
        // Fallback to allowing access to login pages if not configured
        return NextResponse.next();
    }

    const { supabaseResponse, user } = await updateSession(request);
    const { pathname } = request.nextUrl;

    // Unauthenticated user trying to access a protected route → redirect to /login
    if (!user && isProtectedRoute(pathname)) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated user trying to access an auth page or index → redirect to /dashboard
    if (user && (isAuthRoute(pathname) || pathname === '/')) {
        const dashboardUrl = request.nextUrl.clone();
        dashboardUrl.pathname = '/dashboard';
        dashboardUrl.searchParams.delete('next');
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths EXCEPT:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         * - /auth/callback (Supabase auth callback must always be accessible)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth/callback).*)',
    ],
};
