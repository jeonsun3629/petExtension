# 🚀 픽셀 펫 확장 프로그램 - 보안 강화 배포 가이드

## 📋 개요

이 가이드는 보안이 강화된 새로운 빌드 시스템을 사용하여 Chrome 웹스토어에 안전하게 배포하는 방법을 설명합니다.

## 🔧 새로운 보안 시스템 특징

### ✅ 개선된 보안 기능
- **환경변수 기반 API 키 관리**: 빌드 시점에 환경변수 주입
- **하드코딩된 키 제거**: 소스코드에서 모든 민감한 키 제거
- **환경별 빌드**: 개발/운영 환경 자동 분리
- **서버 사이드 검증**: 모든 라이선스 검증은 백엔드에서 처리
- **자동 패키징**: 웹스토어 최적화된 패키지 자동 생성

### 🛡️ 보안 향상 사항
- API 키 하드코딩 완전 제거
- 운영 환경에서 상세 오류 메시지 숨김
- 주기적 라이선스 재검증 (24시간)
- 빌드 시점 환경 검증

## 📦 빌드 시스템 구조

```
📁 프로젝트 루트/
├── 📄 package.json              # 빌드 설정 및 의존성
├── 📄 build.js                  # 메인 빌드 스크립트
├── 📄 package.js                # 웹스토어 패키징 스크립트
├── 📄 background.template.js    # 백그라운드 스크립트 템플릿
├── 📄 env.example              # 환경변수 예시
├── 📁 scripts/
│   └── 📄 clean.js             # 정리 스크립트
├── 📁 dist/                    # 빌드 결과물 (자동 생성)
└── 📁 packages/                # 패키지 파일 (자동 생성)
```

## 🔑 환경변수 설정

### 1. 환경변수 파일 생성

개발 환경:
```bash
# .env.development
NODE_ENV=development
SUPABASE_URL=https://qwbhuusjpnpfwwrzpnfx.supabase.co
SUPABASE_ANON_KEY=your-dev-supabase-anon-key
PAYPAL_CLIENT_ID=your-sandbox-paypal-client-id
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
TOSS_CLIENT_KEY=test_ck_your-test-toss-client-key
EXTENSION_ID=your-extension-id
PAYMENT_DOMAIN=https://localhost:3000
```

운영 환경:
```bash
# .env.production
NODE_ENV=production
SUPABASE_URL=https://qwbhuusjpnpfwwrzpnfx.supabase.co
SUPABASE_ANON_KEY=your-prod-supabase-anon-key
PAYPAL_CLIENT_ID=your-live-paypal-client-id
PAYPAL_BASE_URL=https://api-m.paypal.com
TOSS_CLIENT_KEY=live_ck_your-live-toss-client-key
EXTENSION_ID=your-final-extension-id
PAYMENT_DOMAIN=https://your-payment-domain.com
```

### 2. Supabase Edge Functions 환경변수 설정

```bash
# Supabase 비밀 키 설정 (민감한 키들)
supabase secrets set PAYPAL_CLIENT_SECRET=your-live-paypal-client-secret
supabase secrets set TOSS_SECRET_KEY=your-live-toss-secret-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🛠️ 빌드 및 배포 프로세스

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 환경 빌드

```bash
# 개발 환경 빌드
npm run build:dev

# 또는 기본 빌드 (개발 환경)
npm run build
```

### 3. 운영 환경 빌드

```bash
# 운영 환경 빌드
npm run build:prod
```

### 4. 웹스토어 패키징

```bash
# 빌드 + 패키징 한번에
npm run package

# 또는 별도로 패키징
npm run build:prod
node package.js
```

### 5. 빌드 결과 확인

```bash
# 빌드 결과물 확인
ls -la dist/

# 패키지 파일 확인
ls -la packages/
```

## 📋 배포 체크리스트

### 배포 전 필수 확인사항

- [ ] **환경변수 설정 완료**
  - [ ] `.env.production` 파일 생성
  - [ ] 모든 필수 환경변수 설정
  - [ ] 운영 API 키로 변경 확인

- [ ] **Supabase 설정 완료**
  - [ ] Edge Functions 배포 완료
  - [ ] 비밀 키 (secrets) 설정 완료
  - [ ] 데이터베이스 테이블 생성 완료

- [ ] **빌드 및 테스트**
  - [ ] 운영 환경 빌드 성공
  - [ ] 패키징 성공
  - [ ] 로컬 테스트 완료

- [ ] **보안 검증**
  - [ ] 하드코딩된 키 제거 확인
  - [ ] 빌드된 파일에 환경변수 주입 확인
  - [ ] 민감한 파일 패키지에서 제외 확인

### 웹스토어 업로드 준비

- [ ] **패키지 파일 확인**
  - [ ] `pixel-pet-extension-v1.0.0.zip` 생성 확인
  - [ ] 파일 크기 적절한지 확인 (< 20MB)
  - [ ] 테스트 파일 제외 확인

- [ ] **메타데이터 준비**
  - [ ] 확장 프로그램 설명
  - [ ] 스크린샷 및 아이콘
  - [ ] 권한 요청 사유 설명

## 🔧 빌드 명령어 참조

```bash
# 정리
npm run clean                 # 빌드 파일 정리

# 빌드
npm run build                 # 개발 환경 빌드
npm run build:dev            # 개발 환경 빌드 (명시적)
npm run build:prod           # 운영 환경 빌드

# 패키징
npm run package              # 빌드 + 패키징
node package.js              # 패키징만 실행
```

## ❗ 주의사항

### 1. 환경변수 보안
- **`.env.*` 파일을 Git에 커밋하지 마세요**
- **환경변수 파일은 서버에서만 관리하세요**
- **팀원과 공유할 때는 별도의 보안 채널을 사용하세요**

### 2. API 키 관리
- **클라이언트 사이드 키만 환경변수에 저장**
- **서버 사이드 키는 Supabase Secrets에 저장**
- **정기적으로 키를 교체하세요**

### 3. 배포 검증
- **개발 환경에서 충분히 테스트 후 배포**
- **운영 환경 빌드로 로컬 테스트 필수**
- **웹스토어 업로드 후 추가 검증**

## 🐛 문제 해결

### 빌드 오류 시

```bash
# 1. 정리 후 다시 빌드
npm run clean
npm run build:prod

# 2. 환경변수 확인
echo $NODE_ENV
cat .env.production

# 3. 의존성 재설치
rm -rf node_modules
npm install
```

### 패키징 오류 시

```bash
# 1. 빌드 디렉터리 확인
ls -la dist/

# 2. 패키지 디렉터리 정리
rm -rf packages/
npm run package
```

## 🚀 배포 완료 후

### 1. 웹스토어 모니터링
- 설치 통계 확인
- 사용자 리뷰 모니터링
- 오류 보고 확인

### 2. 성능 모니터링
- 결제 성공률 확인
- 라이선스 검증 성공률
- API 사용량 모니터링

### 3. 보안 점검
- 주기적 라이선스 재검증 동작 확인
- 비정상적인 API 호출 패턴 감지
- 로그 분석 및 보안 이슈 점검

---

**이 가이드를 따라하시면 보안이 강화된 상태로 안전하게 Chrome 웹스토어에 배포할 수 있습니다!** 🎉

추가 질문이나 문제가 있으시면 언제든지 문의해주세요. 