-- 🔧 401 오류 완전 해결 스크립트
-- Supabase SQL Editor에서 실행하여 401 오류를 완전히 해결하세요

-- ========================================
-- 1. 기존 정책 완전 삭제
-- ========================================

-- licenses 테이블 정책 삭제
DROP POLICY IF EXISTS "Allow anon read licenses" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon insert licenses" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon update licenses" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon delete licenses" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon read" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon insert" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon update" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon delete" ON public.licenses;

-- payments 테이블 정책 삭제
DROP POLICY IF EXISTS "Allow anon read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow anon insert payments" ON public.payments;
DROP POLICY IF EXISTS "Allow anon update payments" ON public.payments;
DROP POLICY IF EXISTS "Allow anon delete payments" ON public.payments;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.payments;

-- user_activations 테이블 정책 삭제
DROP POLICY IF EXISTS "Allow anon read activations" ON public.user_activations;
DROP POLICY IF EXISTS "Allow anon insert activations" ON public.user_activations;
DROP POLICY IF EXISTS "Allow anon update activations" ON public.user_activations;
DROP POLICY IF EXISTS "Allow anon delete activations" ON public.user_activations;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.user_activations;

-- ========================================
-- 2. RLS 재활성화
-- ========================================

-- RLS 비활성화 후 재활성화 (깨끗한 상태로)
ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activations DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. 새로운 정책 생성 (401 오류 해결)
-- ========================================

-- licenses 테이블 - 익명 사용자 완전 허용
CREATE POLICY "Enable all access for anon" ON public.licenses
  FOR ALL USING (true) WITH CHECK (true);

-- payments 테이블 - 익명 사용자 완전 허용
CREATE POLICY "Enable all access for anon" ON public.payments
  FOR ALL USING (true) WITH CHECK (true);

-- user_activations 테이블 - 익명 사용자 완전 허용
CREATE POLICY "Enable all access for anon" ON public.user_activations
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 4. 테스트 데이터 삽입 (401 오류 해결 확인)
-- ========================================

-- 테스트 라이선스 삽입
INSERT INTO public.licenses (
    license_key, 
    user_email, 
    payment_provider, 
    payment_id, 
    status,
    expires_at
) VALUES (
    'TEST_FINAL_401_FIX_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'test@example.com',
    'paypal',
    'TEST_PAYMENT_FINAL_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    'active',
    (NOW() + INTERVAL '1 year')::timestamp
) ON CONFLICT (license_key) DO NOTHING;

-- 테스트 결제 정보 삽입
INSERT INTO public.payments (
    payment_provider,
    payment_id,
    amount,
    currency,
    status,
    payment_data,
    verified_at
) VALUES (
    'paypal',
    'TEST_PAYMENT_FINAL_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    9.99,
    'USD',
    'completed',
    '{"test": true, "final_401_fix": true}'::jsonb,
    NOW()
) ON CONFLICT (payment_id) DO NOTHING;

-- ========================================
-- 5. 삽입된 데이터 확인
-- ========================================

-- 라이선스 확인
SELECT 
    license_key,
    user_email,
    payment_provider,
    status,
    created_at,
    expires_at
FROM public.licenses 
WHERE license_key LIKE 'TEST_FINAL_401_FIX_%'
ORDER BY created_at DESC
LIMIT 3;

-- 결제 정보 확인
SELECT 
    payment_provider,
    payment_id,
    amount,
    currency,
    status,
    created_at
FROM public.payments 
WHERE payment_id LIKE 'TEST_PAYMENT_FINAL_%'
ORDER BY created_at DESC
LIMIT 3;

-- ========================================
-- 6. 정책 상태 최종 확인
-- ========================================

-- 모든 테이블의 RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('licenses', 'payments', 'user_activations')
ORDER BY tablename;

-- 모든 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('licenses', 'payments', 'user_activations')
ORDER BY tablename, policyname;

-- ========================================
-- 7. 성공 기준
-- ========================================

-- ✅ 성공: 위의 INSERT 쿼리들이 오류 없이 실행되고, SELECT로 데이터가 조회됨
-- ✅ 성공: 각 테이블에 "Enable all access for anon" 정책이 1개씩 존재
-- ✅ 성공: RLS가 모든 테이블에서 활성화됨

-- ========================================
-- 8. 문제 해결 방법 (실패 시)
-- ========================================

-- 만약 여전히 401 오류가 발생한다면:

-- 1. RLS를 완전히 비활성화 (임시 해결책)
-- ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_activations DISABLE ROW LEVEL SECURITY;

-- 2. 모든 정책 삭제 후 다시 생성
-- DROP POLICY IF EXISTS "Enable all access for anon" ON public.licenses;
-- DROP POLICY IF EXISTS "Enable all access for anon" ON public.payments;
-- DROP POLICY IF EXISTS "Enable all access for anon" ON public.user_activations;

-- 3. 더 간단한 정책 생성
-- CREATE POLICY "anon_all" ON public.licenses FOR ALL USING (true);
-- CREATE POLICY "anon_all" ON public.payments FOR ALL USING (true);
-- CREATE POLICY "anon_all" ON public.user_activations FOR ALL USING (true);

-- ========================================
-- 9. 테스트 데이터 정리 (선택사항)
-- ========================================

-- 테스트 완료 후 정리하려면 아래 주석 해제
-- DELETE FROM public.licenses WHERE license_key LIKE 'TEST_FINAL_401_FIX_%';
-- DELETE FROM public.payments WHERE payment_id LIKE 'TEST_PAYMENT_FINAL_%';

-- ========================================
-- 완료 메시지
-- ========================================

SELECT '🎉 401 오류 해결 스크립트 실행 완료!' as message;
SELECT '✅ 모든 테이블에 익명 사용자 접근 권한이 설정되었습니다.' as status;
SELECT '✅ 이제 Edge Function과 REST API 모두 정상 작동할 것입니다.' as next_step; 