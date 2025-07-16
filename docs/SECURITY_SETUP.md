# 🔒 보안 설정 빠른 시작 가이드

## 📋 개요

이 가이드는 픽셀 펫 확장 프로그램의 보안 설정을 빠르게 구성하는 방법을 설명합니다.

## 🚀 빠른 시작 (5분 설정)

### 1. 환경변수 파일 생성

```bash
# 개발 환경용 환경변수 파일 생성
cp env.example .env.development

# 운영 환경용 환경변수 파일 생성  
cp env.example .env.production
```

### 2. 개발 환경 설정 (.env.development)

```bash
# .env.development 파일 내용
NODE_ENV=development
SUPABASE_URL=https://qwbhuusjpnpfwwrzpnfx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTkxNTgsImV4cCI6MjA2ODA3NTE1OH0.G2k1yy6bbnpyi2F6U7cPC1Y6LtBn2nCvfuIUHPXxb9s
PAYPAL_CLIENT_ID=AQqclewaDKAMaraZmd8ZQui1tkw1e9xSwq_D3pC66SiMugo1uoath2Y65EHWVOLfvCCLmf9Wztr0uRQk
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
TOSS_CLIENT_KEY=test_ck_kYG57Eba3GRe6onMedYL8pWDOxmA
EXTENSION_ID=development-extension-id
PAYMENT_DOMAIN=https://localhost:3000
```

### 3. 빌드 및 테스트

```bash
# 의존성 설치
npm install

# 개발 환경 빌드
npm run build:dev

# Chrome에서 dist 폴더 로드하여 테스트
```

## 🛡️ 운영 환경 설정

### 1. 운영 환경 키 준비

운영 환경에서는 다음 키들을 실제 운영 키로 변경해야 합니다:

```bash
# .env.production 파일 내용
NODE_ENV=production
SUPABASE_URL=https://qwbhuusjpnpfwwrzpnfx.supabase.co
SUPABASE_ANON_KEY=your-production-anon-key
PAYPAL_CLIENT_ID=your-live-paypal-client-id
PAYPAL_BASE_URL=https://api-m.paypal.com
TOSS_CLIENT_KEY=live_ck_your-live-toss-key
EXTENSION_ID=your-final-extension-id
PAYMENT_DOMAIN=https://your-domain.com
```

### 2. Supabase 비밀 키 설정

```bash
# Supabase CLI로 비밀 키 설정
supabase secrets set PAYPAL_CLIENT_SECRET=your-live-paypal-secret
supabase secrets set TOSS_SECRET_KEY=your-live-toss-secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 운영 환경 빌드

```bash
# 운영 환경 빌드 및 패키징
npm run package

# 결과물 확인
ls -la packages/
```

## 🔍 보안 검증

### 1. 하드코딩된 키 확인

```bash
# 빌드된 파일에서 하드코딩된 키 검색
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" dist/
grep -r "AQqclewaDKAMaraZmd8ZQui1tkw1e9xSwq_D3pC66SiM" dist/
grep -r "test_ck_kYG57Eba3GRe6onMedYL8pWDOxmA" dist/

# 결과가 없으면 성공 (환경변수로 주입됨)
```

### 2. 빌드 환경 확인

```bash
# 빌드된 background.js에서 환경 확인
grep -A 5 -B 5 "IS_PRODUCTION" dist/background.js
grep -A 5 -B 5 "BUILD_TIME" dist/background.js
```

### 3. 패키지 내용 확인

```bash
# 패키지에 포함된 파일 확인
unzip -l packages/pixel-pet-extension-v1.0.0.zip

# 테스트 파일이 제외되었는지 확인
# 다음 파일들이 없어야 함:
# - 01.payment-example.html
# - 02.test-manual-license.html
# - 03.cleanup-test-data.html
```

## ⚠️ 주의사항

### 1. 환경변수 파일 보안

```bash
# 환경변수 파일은 절대 Git에 커밋하지 않음
echo ".env.*" >> .gitignore
git add .gitignore
git commit -m "Add environment files to gitignore"
```

### 2. 키 교체 주기

- **개발 키**: 6개월마다 교체
- **운영 키**: 3개월마다 교체
- **비밀 키**: 1개월마다 교체

### 3. 접근 권한 관리

```bash
# 환경변수 파일 권한 설정
chmod 600 .env.*

# 빌드 스크립트 권한 설정
chmod +x build.js
chmod +x package.js
```

## 🚨 문제 해결

### 환경변수 로드 실패

```bash
# 1. 파일 존재 확인
ls -la .env.*

# 2. 파일 내용 확인
cat .env.development

# 3. 권한 확인
ls -l .env.*
```

### 빌드 실패

```bash
# 1. 종속성 재설치
rm -rf node_modules
npm install

# 2. 정리 후 빌드
npm run clean
npm run build:dev
```

### 키 검증 실패

```bash
# 1. Supabase 연결 테스트
curl -H "apikey: YOUR_ANON_KEY" "https://qwbhuusjpnpfwwrzpnfx.supabase.co/rest/v1/"

# 2. PayPal 키 테스트
curl -H "Authorization: Basic $(echo -n 'CLIENT_ID:CLIENT_SECRET' | base64)" \
     "https://api-m.sandbox.paypal.com/v1/oauth2/token"
```

---

**이 가이드를 따라하시면 5분 안에 보안 설정을 완료하고 안전하게 개발을 시작할 수 있습니다!** 🎉 