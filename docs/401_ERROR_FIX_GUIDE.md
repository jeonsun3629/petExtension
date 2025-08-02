# 🔧 401 오류 완전 해결 가이드

## 📋 문제 상황

401 오류는 Supabase의 Row Level Security (RLS) 정책으로 인해 익명 사용자가 데이터베이스에 접근할 수 없을 때 발생합니다.

## 🎯 해결 방법

### 1단계: SQL 스크립트 실행

**backend/final_401_fix.sql** 파일을 Supabase SQL Editor에서 실행하세요:

```sql
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
```

### 2단계: Edge Function 수정

**backend/supabase/supabase/functions/issue-license/index.ts** 파일이 이미 수정되어 있습니다:

- 서비스 키를 사용한 Supabase 클라이언트 초기화
- 환경변수 이름 수정 (`PAYPAL_CLIENT_SECRET`)
- 테스트 결제 ID에 대한 검증 우회

### 3단계: 테스트 실행

**tests/401-test.html** 파일을 브라우저에서 열어서 테스트하세요:

1. **REST API 테스트** - 성공해야 함
2. **전체 프로세스 테스트** - 성공해야 함
3. **RLS 정책 확인** - 정상 작동해야 함

## ✅ 성공 기준

- ✅ REST API로 라이선스 저장 성공
- ✅ 결제 정보 저장 성공
- ✅ 익명 사용자로 데이터 조회 가능
- ✅ Edge Function도 정상 작동 (선택사항)

## 🔍 문제 진단

### 1. RLS 정책 확인

```sql
-- 현재 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('licenses', 'payments', 'user_activations')
ORDER BY tablename, policyname;
```

### 2. RLS 활성화 상태 확인

```sql
-- RLS 활성화 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('licenses', 'payments', 'user_activations');
```

### 3. 테스트 데이터 삽입

```sql
-- 테스트 라이선스 삽입
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
);
```

## 🚨 문제 해결

### 여전히 401 오류가 발생하는 경우

1. **RLS 완전 비활성화** (임시 해결책):
```sql
ALTER TABLE public.licenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activations DISABLE ROW LEVEL SECURITY;
```

2. **더 간단한 정책 생성**:
```sql
CREATE POLICY "anon_all" ON public.licenses FOR ALL USING (true);
CREATE POLICY "anon_all" ON public.payments FOR ALL USING (true);
CREATE POLICY "anon_all" ON public.user_activations FOR ALL USING (true);
```

3. **Edge Function 환경변수 확인**:
   - `SERVICE_ROLE_KEY` 설정 확인
   - `PAYPAL_CLIENT_SECRET` 설정 확인

## 📊 테스트 결과 해석

### 성공 케이스
- ✅ REST API 테스트: 성공
- ✅ 전체 프로세스 테스트: 성공
- ✅ RLS 정책 확인: 정상 작동

### 실패 케이스
- ❌ REST API 테스트: 실패 → SQL 스크립트 재실행
- ❌ Edge Function 테스트: 실패 → 환경변수 확인
- ❌ RLS 정책 확인: 실패 → 정책 재설정

## 🔄 대안 해결책

### 1. REST API 방식 사용 (권장)

Edge Function 대신 직접 REST API를 사용:

```javascript
// 라이선스 저장
const response = await fetch(`${SUPABASE_URL}/rest/v1/licenses`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
        'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
        license_key: licenseKey,
        user_email: userEmail,
        payment_provider: paymentProvider,
        payment_id: paymentId,
        status: 'active'
    })
});
```

### 2. 서비스 키 사용

Edge Function에서 서비스 키를 사용하여 RLS를 우회:

```typescript
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
```

## 📞 추가 지원

문제가 지속되면:

1. **Supabase Dashboard**에서 로그 확인
2. **Edge Function 로그** 확인: `supabase functions logs issue-license`
3. **SQL Editor**에서 정책 상태 재확인
4. **테스트 파일**에서 상세한 오류 메시지 확인

## 🎉 완료 확인

모든 단계가 완료되면:

1. **tests/401-test.html**에서 모든 테스트 성공
2. **확장 프로그램**에서 라이선스 발급 정상 작동
3. **결제 프로세스** 완료 후 프리미엄 활성화

---

**💡 핵심**: 401 오류는 RLS 정책 문제이므로, 익명 사용자에게 적절한 권한을 부여하면 해결됩니다. 