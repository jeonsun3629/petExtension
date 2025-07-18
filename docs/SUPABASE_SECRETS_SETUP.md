# 🔐 Supabase Functions 비밀 키 설정 가이드

## 📋 필요한 비밀 키들

Supabase Functions에서 결제 검증을 위해 다음 비밀 키들을 설정해야 합니다:

### 1. PayPal 비밀 키
```bash
PAYPAL_CLIENT_SECRET=EMuJ4OA8n3eg_WUBdWNS23gl40tcqLR_MPsBeaoAewwCQRhx1Gqe6hIkkEfUupRXVJj6SdD1VZi-6GHH
```

### 2. Toss 비밀 키
```bash
TOSS_SECRET_KEY=test_sk_4yKeq5bgrpw2BwE4AQE4VGX0lzW6
```

### 3. Supabase 서비스 롤 키
```bash
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5OTE1OCwiZXhwIjoyMDY4MDc1MTU4fQ.kgN693S_DOUxhBawA362-EwXAw4yCKAYs1HAhpAKc_w
```

## 🚀 설정 방법

### 방법 1: Supabase CLI 사용 (권장)

```bash
# 1. Supabase CLI 설치 (이미 설치되어 있다면 건너뛰기)
npm install -g supabase

# 2. 프로젝트 로그인
supabase login

# 3. 프로젝트 연결
supabase link --project-ref qwbhuusjpnpfwwrzpnfx

# 4. 비밀 키 설정
supabase secrets set PAYPAL_CLIENT_SECRET=EMuJ4OA8n3eg_WUBdWNS23gl40tcqLR_MPsBeaoAewwCQRhx1Gqe6hIkkEfUupRXVJj6SdD1VZi-6GHH
supabase secrets set TOSS_SECRET_KEY=test_sk_4yKeq5bgrpw2BwE4AQE4VGX0lzW6
supabase secrets set SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5OTE1OCwiZXhwIjoyMDY4MDc1MTU4fQ.kgN693S_DOUxhBawA362-EwXAw4yCKAYs1HAhpAKc_w

# 5. 비밀 키 확인
supabase secrets list
```

### 방법 2: Supabase Dashboard 사용

1. **Supabase Dashboard** 접속: https://app.supabase.com/projects/qwbhuusjpnpfwwrzpnfx
2. **Settings** → **Edge Functions** → **Environment Variables** 메뉴
3. 다음 환경변수들을 하나씩 추가:
   - `PAYPAL_CLIENT_SECRET`: `EMuJ4OA8n3eg_WUBdWNS23gl40tcqLR_MPsBeaoAewwCQRhx1Gqe6hIkkEfUupRXVJj6SdD1VZi-6GHH`
   - `TOSS_SECRET_KEY`: `test_sk_4yKeq5bgrpw2BwE4AQE4VGX0lzW6`
   - `SERVICE_ROLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5OTE1OCwiZXhwIjoyMDY4MDc1MTU4fQ.kgN693S_DOUxhBawA362-EwXAw4yCKAYs1HAhpAKc_w`

## 🔧 Functions 배포

비밀 키 설정 후 Functions를 배포해야 합니다:

```bash
# backend/supabase 디렉터리로 이동
cd backend/supabase

# Functions 배포
supabase functions deploy issue-license
```

## ✅ 설정 완료 확인

1. **비밀 키 확인**:
   ```bash
   supabase secrets list
   ```

2. **Functions 테스트**:
   ```bash
   supabase functions invoke issue-license --data '{"test": true}'
   ```

## 🚨 중요사항

- 비밀 키들은 **절대 코드에 하드코딩하지 마세요**
- 환경변수로만 관리하세요
- 테스트 환경에서 검증 후 운영 환경으로 전환하세요

## 📞 문제 해결

설정 중 문제가 발생하면:
1. Supabase CLI 버전 확인: `supabase --version`
2. 프로젝트 연결 상태 확인: `supabase status`
3. 로그 확인: `supabase functions logs issue-license` 