import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function isPlaceholderKey(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('your-') || value.includes('your_') || value === '';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // DEMO MODE - If Supabase is not configured, allow all routes
  if (isPlaceholderKey(supabaseUrl) || isPlaceholderKey(supabaseAnonKey)) {
    return NextResponse.next();
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/admin'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie handling
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  // Check localStorage-based auth via cookie fallback
  const llAuth = request.cookies.get('ll_auth')?.value;

  if (!session && !llAuth) {
    // Redirect unauthenticated users to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require admin/superadmin role
  if (pathname.startsWith('/admin') && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
