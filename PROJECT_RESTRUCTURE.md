# 🗂️ 프로젝트 구조 정리 계획

## 📋 현재 문제점
- 모든 파일이 루트 디렉터리에 섞여있음
- 크롬 익스텐션, 백엔드, 결제 서비스가 구분되지 않음
- 테스트 파일과 문서가 분리되지 않음

## 🎯 목표 구조

```
pixel-pet-extension/
├── 📁 extension/                    # 크롬 익스텐션 소스
│   ├── manifest.json
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── secure-license-manager.js
│   ├── user-info.js
│   ├── styles/
│   │   ├── cat-pixel-sprites.css
│   │   └── cat-sprites.css
│   ├── assets/
│   │   ├── skins/
│   │   └── _locales/
│   └── README.md
├── 📁 backend/                      # 백엔드 서버
│   ├── background.template.js
│   ├── background.js.backup
│   ├── supabase/
│   │   ├── functions/
│   │   └── tables.sql
│   └── README.md
├── 📁 payment/                      # 결제 서비스
│   ├── payment-script-secure.js
│   ├── payment-example.html
│   └── README.md
├── 📁 build/                        # 빌드 시스템
│   ├── build.js
│   ├── package.js
│   ├── scripts/
│   │   └── clean.js
│   └── env.example
├── 📁 tests/                        # 테스트 파일
│   ├── manual-license-test.html
│   ├── cleanup-test-data.html
│   └── README.md
├── 📁 docs/                         # 문서
│   ├── README.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── SECURITY_SETUP.md
│   ├── WINDOWS_SETUP.md
│   └── PAYMENT_SETUP.md
├── 📁 dist/                         # 빌드 결과물 (자동 생성)
├── 📁 packages/                     # 패키지 (자동 생성)
├── package.json
├── .gitignore
└── README.md
```

## 🔄 이동 계획

### 1. 크롬 익스텐션 (extension/)
- manifest.json → extension/manifest.json
- content.js → extension/content.js
- 00.popup.html → extension/popup.html
- popup-secure.js → extension/popup.js
- secure-license-manager.js → extension/secure-license-manager.js
- user-info.js → extension/user-info.js
- cat-pixel-sprites.css → extension/styles/cat-pixel-sprites.css
- cat-sprites.css → extension/styles/cat-sprites.css
- skins/ → extension/assets/skins/
- _locales/ → extension/assets/_locales/

### 2. 백엔드 (backend/)
- background.template.js → backend/background.template.js
- background.js.backup → backend/background.js.backup
- supabase/ → backend/supabase/
- supabase_tables.sql → backend/supabase/tables.sql

### 3. 결제 서비스 (payment/)
- payment-script-secure.js → payment/payment-script-secure.js
- 01.payment-example.html → payment/payment-example.html

### 4. 빌드 시스템 (build/)
- build.js → build/build.js
- package.js → build/package.js
- scripts/ → build/scripts/
- env.example → build/env.example

### 5. 테스트 (tests/)
- 02.test-manual-license.html → tests/manual-license-test.html
- 03.cleanup-test-data.html → tests/cleanup-test-data.html

### 6. 문서 (docs/)
- DEPLOYMENT_GUIDE.md → docs/DEPLOYMENT_GUIDE.md
- SECURITY_SETUP.md → docs/SECURITY_SETUP.md
- WINDOWS_SETUP.md → docs/WINDOWS_SETUP.md
- PAYMENT_SETUP.md → docs/PAYMENT_SETUP.md
- production-changes-guide.md → docs/production-changes-guide.md

## 🗑️ 삭제할 파일들
- background.js (자동 생성됨)
- PROJECT_RESTRUCTURE.md (작업 완료 후)

## 🔧 수정 필요한 참조
- build.js의 파일 경로들
- package.js의 파일 경로들
- manifest.json의 리소스 경로들
- CSS 파일의 이미지 경로들 