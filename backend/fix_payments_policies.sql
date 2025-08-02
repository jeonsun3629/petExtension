-- payments와 user_activations 테이블 정책 추가
-- Supabase SQL Editor에서 실행하세요

-- ========================================
-- payments 테이블 정책 추가
-- ========================================

-- 익명 사용자 SELECT 허용
CREATE POLICY "Allow anon read payments" ON public.payments
  FOR SELECT USING (true);

-- 익명 사용자 INSERT 허용 (결제 정보 저장용) - 401 오류 해결 핵심
CREATE POLICY "Allow anon insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- 익명 사용자 UPDATE 허용
CREATE POLICY "Allow anon update payments" ON public.payments
  FOR UPDATE USING (true) WITH CHECK (true);

-- 익명 사용자 DELETE 허용
CREATE POLICY "Allow anon delete payments" ON public.payments
  FOR DELETE USING (true);

-- ========================================
-- user_activations 테이블 정책 추가
-- ========================================

-- 익명 사용자 SELECT 허용
CREATE POLICY "Allow anon read activations" ON public.user_activations
  FOR SELECT USING (true);

-- 익명 사용자 INSERT 허용 (활성화 로그 저장용) - 401 오류 해결 핵심
CREATE POLICY "Allow anon insert activations" ON public.user_activations
  FOR INSERT WITH CHECK (true);

-- 익명 사용자 UPDATE 허용
CREATE POLICY "Allow anon update activations" ON public.user_activations
  FOR UPDATE USING (true) WITH CHECK (true);

-- 익명 사용자 DELETE 허용
CREATE POLICY "Allow anon delete activations" ON public.user_activations
  FOR DELETE USING (true);

-- ========================================
-- 정책 확인
-- ========================================

-- payments 테이블 정책 확인
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'payments'
ORDER BY policyname;

-- user_activations 테이블 정책 확인
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'user_activations'
ORDER BY policyname;

-- ========================================
-- 테스트
-- ========================================

-- payments 테이블 테스트
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
    '{"test": true, "provider": "paypal"}'::jsonb
) ON CONFLICT (payment_id) DO NOTHING;

-- user_activations 테이블 테스트
INSERT INTO public.user_activations (
    user_email,
    extension_id,
    user_agent
) VALUES (
    'test@example.com',
    'test_extension_id',
    'test_user_agent'
);

-- 테스트 데이터 확인
SELECT 'payments' as table_name, COUNT(*) as count FROM public.payments WHERE payment_id LIKE 'TEST_PAYMENT_%'
UNION ALL
SELECT 'user_activations' as table_name, COUNT(*) as count FROM public.user_activations WHERE user_email = 'test@example.com'; 