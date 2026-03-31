import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function isPlaceholderKey(value: string | undefined): boolean {
  if (!value) return true;
  return value.includes('your-') || value.includes('your_') || value === '';
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli (min 6 karakter)' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // DEMO MODE: If Supabase is not configured, allow login with any credentials
    if (isPlaceholderKey(supabaseUrl) || isPlaceholderKey(supabaseAnonKey)) {
      console.log('[DEMO MODE] Login successful for:', email);
      return NextResponse.json({ 
        success: true, 
        user: { id: 'demo-user', email },
        session: { access_token: 'demo-token' }
      });
    }

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: data.user,
      session: data.session
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Giriş işlemi başarısız' }, { status: 500 });
  }
}
