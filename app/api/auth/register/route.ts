import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli (min 6 karakter)' }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin' }, { status: 400 });
    }

    // Name validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'İsim 2-100 karakter arasında olmalı' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json({ error: 'NEXT_PUBLIC_SUPABASE_URL eksik' }, { status: 500 });
    }
    if (!supabaseServiceKey) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY eksik - Vercel env vars kontrol et' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: name,
      }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Insert user into users table
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: email,
          display_name: name,
          role: 'user',
          is_active: true,
        });

      if (dbError) {
        console.error('Error inserting user to database:', dbError);
        // Rollback: delete the auth user since DB insert failed
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (rollbackErr) {
          console.error('Rollback failed:', rollbackErr);
        }
        return NextResponse.json({ error: 'Kullanıcı kaydı oluşturulamadı. Lütfen tekrar deneyin.' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Kayıt işlemi başarısız' }, { status: 500 });
  }
}
