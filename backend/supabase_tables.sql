-- Supabase 테이블 설계 SQL
-- 실행 순서: licenses -> payments -> users (외래키 관계 고려)

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

-- RLS (Row Level Security) 정책 설정
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activations ENABLE ROW LEVEL SECURITY;

-- 기본적으로 모든 사용자가 읽기/쓰기 가능 (API Key 기반 접근)
-- 실제 운영에서는 더 세밀한 권한 설정 필요
-- 라이선스 테이블에 대해 익명 SELECT 허용
CREATE POLICY "Allow anon read" ON public.licenses
  FOR SELECT USING (true);

-- 필요시 INSERT도 허용
CREATE POLICY "Allow anon insert" ON public.licenses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON public.payments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON public.user_activations
  FOR ALL USING (true) WITH CHECK (true);

-- 테스트 데이터 삽입 (개발/테스트용)
-- INSERT INTO public.licenses (license_key, user_email, payment_provider, payment_id, status)
-- VALUES ('TEST_LICENSE_123', 'test@example.com', 'test', 'test_payment_123', 'active'); 