-- Supabase 테이블 설계 SQL (401 오류 해결 버전)
-- 실행 순서: 테이블 생성 -> 인덱스 생성 -> RLS 정책 설정

-- 1. 라이선스 테이블
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key VARCHAR(255) UNIQUE NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  payment_provider VARCHAR(50) NOT NULL, -- 'paypal' 또는 'toss'
  payment_id VARCHAR(255) NOT NULL, -- 결제사별 고유 ID
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'revoked'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 결제 내역 테이블
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
  payment_provider VARCHAR(50) NOT NULL,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_data JSONB, -- 결제사별 상세 데이터
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 사용자 활성화 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS public.user_activations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  extension_id VARCHAR(255),
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- 인덱스 생성 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON public.licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_user_email ON public.licenses(user_email);
CREATE INDEX IF NOT EXISTS idx_licenses_payment_id ON public.licenses(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON public.payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_user_activations_license_id ON public.user_activations(license_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 401 오류 해결을 위한 RLS 정책 설정
-- ========================================

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Allow anon read" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon insert" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon update" ON public.licenses;
DROP POLICY IF EXISTS "Allow anon delete" ON public.licenses;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.user_activations;

-- ========================================
-- licenses 테이블 정책 (401 오류 해결 핵심)
-- ========================================

-- 익명 사용자 SELECT 허용 (라이선스 조회용)
CREATE POLICY "Allow anon read licenses" ON public.licenses
  FOR SELECT USING (true);

-- 익명 사용자 INSERT 허용 (라이선스 발급용) - 401 오류 해결 핵심
CREATE POLICY "Allow anon insert licenses" ON public.licenses
  FOR INSERT WITH CHECK (true);

-- 익명 사용자 UPDATE 허용 (라이선스 상태 변경용)
CREATE POLICY "Allow anon update licenses" ON public.licenses
  FOR UPDATE USING (true) WITH CHECK (true);

-- 익명 사용자 DELETE 허용 (관리용)
CREATE POLICY "Allow anon delete licenses" ON public.licenses
  FOR DELETE USING (true);

-- ========================================
-- payments 테이블 정책
-- ========================================

-- 익명 사용자 SELECT 허용
CREATE POLICY "Allow anon read payments" ON public.payments
  FOR SELECT USING (true);

-- 익명 사용자 INSERT 허용 (결제 정보 저장용)
CREATE POLICY "Allow anon insert payments" ON public.payments
  FOR INSERT WITH CHECK (true);

-- 익명 사용자 UPDATE 허용
CREATE POLICY "Allow anon update payments" ON public.payments
  FOR UPDATE USING (true) WITH CHECK (true);

-- 익명 사용자 DELETE 허용
CREATE POLICY "Allow anon delete payments" ON public.payments
  FOR DELETE USING (true);

-- ========================================
-- user_activations 테이블 정책
-- ========================================

-- 익명 사용자 SELECT 허용
CREATE POLICY "Allow anon read activations" ON public.user_activations
  FOR SELECT USING (true);

-- 익명 사용자 INSERT 허용 (활성화 로그 저장용)
CREATE POLICY "Allow anon insert activations" ON public.user_activations
  FOR INSERT WITH CHECK (true);

-- 익명 사용자 UPDATE 허용
CREATE POLICY "Allow anon update activations" ON public.user_activations
  FOR UPDATE USING (true) WITH CHECK (true);

-- 익명 사용자 DELETE 허용
CREATE POLICY "Allow anon delete activations" ON public.user_activations
  FOR DELETE USING (true);

-- ========================================
-- 테스트 데이터 삽입 (개발/테스트용)
-- ========================================

-- 테스트 라이선스 삽입 (선택사항)
-- INSERT INTO public.licenses (license_key, user_email, payment_provider, payment_id, status)
-- VALUES 
--   ('TEST_LICENSE_001', 'test@example.com', 'paypal', 'TEST_PAYMENT_001', 'active'),
--   ('TEST_LICENSE_002', 'test2@example.com', 'toss', 'TEST_PAYMENT_002', 'active');

-- ========================================
-- 정책 확인 쿼리 (실행 후 확인용)
-- ========================================

-- 현재 설정된 정책 확인
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename IN ('licenses', 'payments', 'user_activations')
-- ORDER BY tablename, policyname;

-- ========================================
-- 401 오류 해결 확인 방법
-- ========================================

-- 1. 익명 사용자로 라이선스 삽입 테스트
-- INSERT INTO public.licenses (license_key, user_email, payment_provider, payment_id, status)
-- VALUES ('TEST_401_FIX', 'test@example.com', 'paypal', 'TEST_PAYMENT_401', 'active');

-- 2. 익명 사용자로 라이선스 조회 테스트
-- SELECT * FROM public.licenses WHERE license_key = 'TEST_401_FIX';

-- 3. 익명 사용자로 결제 정보 삽입 테스트
-- INSERT INTO public.payments (payment_provider, payment_id, amount, currency, status)
-- VALUES ('paypal', 'TEST_PAYMENT_401', 9.99, 'USD', 'completed');

-- ========================================
-- 주의사항
-- ========================================

-- 이 정책들은 익명 사용자(anon key)로 모든 작업을 허용합니다.
-- 실제 운영 환경에서는 더 세밀한 권한 설정이 필요할 수 있습니다.
-- 예: 특정 이메일 도메인만 허용, 결제 검증 후에만 INSERT 허용 등

-- 보안 강화를 위한 추가 정책 예시:
-- CREATE POLICY "Allow verified payments only" ON public.licenses
--   FOR INSERT WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM public.payments 
--       WHERE payment_id = licenses.payment_id 
--       AND status = 'completed'
--     )
--   ); 