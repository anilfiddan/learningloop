-- =====================================================
-- STORAGE BUCKET POLICIES
-- Resimler için kalıcı depolama - SİLİNMEZ
-- =====================================================

-- NOT: Bu SQL'ler Supabase Dashboard > Storage > Policies'den
-- veya Supabase CLI ile çalıştırılmalıdır.

-- =====================================================
-- VISUALS BUCKET - Kelime görselleri (KALICI)
-- =====================================================

-- Bucket oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'visuals',
    'visuals',
    true,  -- Public erişim (URL ile görüntülenebilir)
    5242880,  -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- SELECT policy - Herkes görebilir (public bucket)
CREATE POLICY "Public visuals are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'visuals');

-- INSERT policy - Authenticated users kendi klasörlerine yükleyebilir
CREATE POLICY "Users can upload visuals to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'visuals' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE policy - Kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Users can update own visuals"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'visuals' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE policy - SİLME YOK! Görseller kalıcı
-- Sadece superadmin silebilir (service role ile)
CREATE POLICY "Only service role can delete visuals"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'visuals' 
    AND auth.role() = 'service_role'
);

-- =====================================================
-- RECORDINGS BUCKET - Ses kayıtları
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'recordings',
    'recordings',
    false,  -- Private - sadece sahibi erişebilir
    10485760,  -- 10MB limit
    ARRAY['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg']
);

-- SELECT policy - Kullanıcılar kendi kayıtlarını görebilir
CREATE POLICY "Users can view own recordings"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'recordings' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT policy - Kullanıcılar kendi klasörlerine yükleyebilir
CREATE POLICY "Users can upload recordings to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'recordings' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE policy - Kullanıcılar kendi kayıtlarını silebilir
CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'recordings' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- AVATARS BUCKET - Kullanıcı avatarları
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,  -- Public
    2097152,  -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- SELECT policy - Herkes görebilir
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- INSERT policy - Kullanıcılar kendi avatarlarını yükleyebilir
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE policy - Kullanıcılar kendi avatarlarını güncelleyebilir
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE policy - Kullanıcılar kendi avatarlarını silebilir
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- AUDIO BUCKET - TTS ses dosyaları (sistem tarafından oluşturulan)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio',
    'audio',
    true,  -- Public - URL ile erişilebilir
    5242880,  -- 5MB limit
    ARRAY['audio/mpeg', 'audio/mp3', 'audio/wav']
);

-- SELECT policy - Herkes dinleyebilir
CREATE POLICY "Public audio is accessible by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

-- INSERT policy - Authenticated users (sistem) yükleyebilir
CREATE POLICY "System can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'audio' 
    AND auth.role() = 'authenticated'
);

-- DELETE policy - Sadece service role silebilir
CREATE POLICY "Only service role can delete audio"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'audio' 
    AND auth.role() = 'service_role'
);
