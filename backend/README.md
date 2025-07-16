# 🖥️ 백엔드 서버 시스템

이 폴더는 픽셀 펫 크롬 익스텐션의 백엔드 서버 코드를 포함합니다.

## 📁 파일 구조

```
backend/
├── background.template.js    # 백그라운드 스크립트 템플릿
├── background.js.backup      # 원본 백그라운드 스크립트 백업
├── supabase/
│   ├── functions/
│   │   └── issue-license/
│   │       └── index.ts      # 라이선스 발급 Edge Function
│   └── tables.sql            # 데이터베이스 스키마
└── README.md                 # 이 파일
```

## 🔧 주요 파일 설명

### `background.template.js`
- 크롬 익스텐션의 백그라운드 서비스 워커 템플릿
- 빌드 시 환경변수가 주입되어 실제 background.js 생성
- API 키 관리 및 라이선스 검증 로직

### `background.js.backup`
- 원본 하드코딩된 백그라운드 스크립트
- 보안 업그레이드 전 버전의 백업
- 참고용으로만 사용

### `supabase/functions/issue-license/index.ts`
- Supabase Edge Function
- 결제 검증 및 라이선스 발급 처리
- PayPal, Toss 결제 검증 로직

### `supabase/tables.sql`
- 데이터베이스 스키마 정의
- 라이선스, 결제, 사용자 테이블 구조

## 🔑 환경변수 (빌드 시 주입)

### 크롬 익스텐션 (background.js)
```javascript
// 공개해도 안전한 키들
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PAYPAL_CLIENT_ID=your-paypal-client-id
TOSS_CLIENT_KEY=your-toss-client-key
```

### Edge Functions (Supabase Secrets)
```bash
# 민감한 키들 (서버에서만 사용)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
TOSS_SECRET_KEY=your-toss-secret-key
```

## 🚀 배포 프로세스

### 1. Edge Function 배포
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# Edge Function 배포
supabase functions deploy issue-license

# 환경변수 설정
supabase secrets set PAYPAL_CLIENT_SECRET=your-secret
supabase secrets set TOSS_SECRET_KEY=your-secret
```

### 2. 데이터베이스 설정
```bash
# 테이블 생성
supabase db push

# 또는 SQL 직접 실행
psql -h your-db-url -U postgres -f supabase/tables.sql
```

## 🔒 보안 아키텍처

### 클라이언트 (크롬 익스텐션)
- 공개 키만 포함 (Anon Key, Client ID)
- 민감한 작업은 Edge Functions에 위임
- 주기적 라이선스 재검증

### 서버 (Edge Functions)
- 민감한 키들은 Supabase Secrets에 저장
- 결제 검증 및 라이선스 발급 처리
- 데이터베이스 접근 제어

## 📊 데이터베이스 스키마

### licenses 테이블
```sql
id              UUID PRIMARY KEY
license_key     VARCHAR(255) UNIQUE
user_email      VARCHAR(255)
payment_provider VARCHAR(50)
payment_id      VARCHAR(255)
status          VARCHAR(50) DEFAULT 'active'
created_at      TIMESTAMP
expires_at      TIMESTAMP
```

### payments 테이블
```sql
id              UUID PRIMARY KEY
license_id      UUID REFERENCES licenses(id)
payment_provider VARCHAR(50)
payment_id      VARCHAR(255) UNIQUE
amount          DECIMAL(10,2)
currency        VARCHAR(3)
status          VARCHAR(50)
verified_at     TIMESTAMP
```

## 🔧 개발 가이드

### 새 결제 방식 추가
1. `supabase/functions/issue-license/index.ts`에 검증 로직 추가
2. `background.template.js`에 클라이언트 설정 추가
3. 환경변수 설정 업데이트

### 라이선스 정책 변경
1. `supabase/tables.sql`에서 스키마 수정
2. Edge Function에서 검증 로직 업데이트
3. 크롬 익스텐션의 검증 로직 업데이트

## 🐛 문제 해결

### Edge Function 배포 실패
```bash
# 로그 확인
supabase functions logs issue-license

# 재배포
supabase functions deploy issue-license --no-verify-jwt
```

### 데이터베이스 연결 문제
```bash
# 연결 테스트
supabase db ping

# 권한 확인
supabase projects list
``` 