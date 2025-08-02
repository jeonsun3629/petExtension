-- 401 오류 해결 확인 스크립트
-- Supabase SQL Editor에서 실행하여 401 오류 해결 상태를 확인하세요

-- ========================================
-- 1. 현재 RLS 정책 상태 확인
-- ========================================

-- licenses 테이블의 현재 정책 확인
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'licenses'
ORDER BY policyname;

-- payments 테이블의 현재 정책 확인
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

-- ========================================
-- 2. RLS 활성화 상태 확인
-- ========================================

-- RLS가 활성화되어 있는지 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('licenses', 'payments', 'user_activations');

-- ========================================
-- 3. 익명 사용자 권한 테스트
-- ========================================

-- 익명 사용자로 라이선스 삽입 테스트
-- 이 쿼리가 성공하면 401 오류가 해결된 것입니다
INSERT INTO public.licenses (
    license_key, 
    user_email, 
    payment_provider, 
    payment_id, 
    status
) VALUES (
    'TEST_401_FIX_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'test@example.com',
    'paypal',
    'TEST_PAYMENT_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'active'
) ON CONFLICT (license_key) DO NOTHING;

-- 방금 삽입한 테스트 데이터 확인
SELECT 
    license_key,
    user_email,
    payment_provider,
    status,
    created_at
FROM public.licenses 
WHERE license_key LIKE 'TEST_401_FIX_%'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 4. 결제 정보 삽입 테스트
-- ========================================

-- 익명 사용자로 결제 정보 삽입 테스트
INSERT INTO public.payments (
    payment_provider,
    payment_id,
    amount,
    currency,
    status,
    payment_data
) VALUES (
    'paypal',
    'TEST_PAYMENT_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    9.99,
    'USD',
    'completed',
    '{"test": true, "timestamp": "2024-12-02T10:30:00Z"}'::jsonb
) ON CONFLICT (payment_id) DO NOTHING;

-- 방금 삽입한 결제 데이터 확인
SELECT 
    payment_provider,
    payment_id,
    amount,
    currency,
    status,
    created_at
FROM public.payments 
WHERE payment_id LIKE 'TEST_PAYMENT_%'
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 5. 정책 재설정 (필요시)
-- ========================================

-- 만약 위 테스트가 실패한다면, 아래 정책을 다시 설정하세요

-- 기존 정책 삭제
-- DROP POLICY IF EXISTS "Allow anon read licenses" ON public.licenses;
-- DROP POLICY IF EXISTS "Allow anon insert licenses" ON public.licenses;
-- DROP POLICY IF EXISTS "Allow anon update licenses" ON public.licenses;
-- DROP POLICY IF EXISTS "Allow anon delete licenses" ON public.licenses;

-- 새로운 정책 생성
-- CREATE POLICY "Allow anon read licenses" ON public.licenses FOR SELECT USING (true);
-- CREATE POLICY "Allow anon insert licenses" ON public.licenses FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow anon update licenses" ON public.licenses FOR UPDATE USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow anon delete licenses" ON public.licenses FOR DELETE USING (true);

-- ========================================
-- 6. 테스트 데이터 정리 (선택사항)
-- ========================================

-- 테스트 데이터 삭제 (필요시)
-- DELETE FROM public.licenses WHERE license_key LIKE 'TEST_401_FIX_%';
-- DELETE FROM public.payments WHERE payment_id LIKE 'TEST_PAYMENT_%';

-- ========================================
-- 7. 최종 확인
-- ========================================

-- 모든 정책이 올바르게 설정되었는지 최종 확인
SELECT 
    'licenses' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'licenses'
UNION ALL
SELECT 
    'payments' as table_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'payments';

-- ========================================
-- 성공 기준
-- ========================================

-- ✅ 성공: 위의 INSERT 쿼리들이 오류 없이 실행되고, SELECT로 데이터가 조회됨
-- ❌ 실패: INSERT 시 "new row violates row-level security policy" 오류 발생

-- ========================================
-- 문제 해결 방법
-- ========================================

-- 1. RLS가 비활성화되어 있다면:
--    ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- 2. 정책이 없다면:
--    CREATE POLICY "Allow anon insert licenses" ON public.licenses FOR INSERT WITH CHECK (true);

-- 3. 정책이 잘못되어 있다면:
--    DROP POLICY IF EXISTS "정책명" ON public.licenses;
--    CREATE POLICY "Allow anon insert licenses" ON public.licenses FOR INSERT WITH CHECK (true); 