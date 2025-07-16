# 🐱 픽셀 고양이 크롬 익스텐션

귀여운 픽셀 아트 고양이가 화면을 돌아다니는 크롬 익스텐션입니다!

## ✨ 기능

- **4가지 애니메이션**: 걷기, 앉기, 그루밍, 뒤집어 눕기
- **자동 이동**: 고양이가 화면 경계에서 방향을 바꾸며 돌아다님
- **랜덤 행동**: 일정 시간마다 랜덤하게 행동 변경
- **픽셀 아트 스타일**: CSS로 구현된 귀여운 픽셀 고양이

## 🚀 설치 방법

<<<<<<< HEAD
### 1. 개발자 모드로 설치
=======
### 1. 개발자 모드로 설치 (개발자용)
>>>>>>> master

1. **Chrome 브라우저**를 열고 주소창에 `chrome://extensions/` 입력
2. 우측 상단의 **"개발자 모드"** 토글을 켭니다
3. **"압축해제된 확장 프로그램을 로드합니다"** 버튼 클릭
<<<<<<< HEAD
4. `catExtension` 폴더를 선택합니다
5. 익스텐션이 설치되면 완료!

=======
4. `dist` 폴더를 선택합니다 (빌드 완료 후)
5. 익스텐션이 설치되면 완료!

### 2. 빌드 시스템 사용 (권장)

보안이 강화된 새로운 빌드 시스템을 사용하세요:

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp env.example .env.development
# .env.development 파일을 실제 값으로 편집

# 3. 개발 환경 빌드
npm run build:dev

# 4. Chrome에서 dist 폴더 로드
```

자세한 내용은 [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)를 참조하세요.

>>>>>>> master
### 2. 사용법

- 익스텐션이 설치되면 **모든 웹페이지**에서 픽셀 고양이가 나타납니다
- 고양이는 자동으로 화면을 돌아다니며 다양한 행동을 합니다
- 브라우저 툴바의 익스텐션 아이콘을 클릭하면 정보를 볼 수 있습니다

## 🎨 고양이 행동

| 행동 | 설명 | 지속시간 |
|------|------|----------|
| 🚶‍♂️ **걷기** | 화면을 좌우로 이동 | 2-7초 |
| 🪑 **앉기** | 제자리에서 앉은 자세 | 3-7초 |
| 🧼 **그루밍** | 몸단장하는 모습 | 2-5초 |
| 😴 **눕기** | 편안하게 누운 자세 | 4-10초 |

## 🔧 기술 스택

- **Manifest V3** Chrome Extension
- **Vanilla JavaScript** (ES6+ 클래스)
- **CSS3 Animations** & **Linear Gradients**
- **Content Scripts** for all pages

## 📁 파일 구조

```
<<<<<<< HEAD
catExtension/
├── 00.popup.html      # 팝업 UI (보안 모드)
├── 01.payment-example.html    # 결제 시뮬레이션 페이지
├── 02.test-manual-license.html # 수동 라이선스 테스트
├── 03.cleanup-test-data.html   # 테스트 데이터 정리
├── manifest.json      # 익스텐션 설정
├── background.js      # 백그라운드 서비스 워커 (보안 API 관리)
├── content.js         # 메인 로직 (픽셀 고양이)
├── cat-sprites.css    # 고양이 스프라이트 & 애니메이션
├── popup-secure.js    # 팝업 컨트롤러 (보안 모드)
├── secure-license-manager.js  # 라이선스 관리 (보안 모드)
├── user-info.js       # 사용자 정보 관리
├── payment-script-secure.js   # 결제 처리 (보안 모드)
└── README.md         # 사용법
=======
pixel-pet-extension/
├── 📁 extension/                    # 크롬 익스텐션 소스
│   ├── manifest.json              # 확장 프로그램 메타데이터
│   ├── content.js                 # 메인 로직 (픽셀 펫)
│   ├── popup.html                 # 팝업 UI
│   ├── popup.js                   # 팝업 컨트롤러
│   ├── secure-license-manager.js  # 라이선스 관리 (보안)
│   ├── user-info.js               # 사용자 정보 관리
│   ├── styles/                    # 스타일 시트
│   │   ├── cat-pixel-sprites.css  # 펫 스프라이트 애니메이션
│   │   └── cat-sprites.css        # 펫 기본 스타일
│   └── assets/                    # 리소스 파일
│       ├── skins/                 # 펫 스킨 이미지
│       └── _locales/              # 다국어 지원
├── 📁 backend/                      # 백엔드 서버 시스템
│   ├── background.template.js     # 백그라운드 스크립트 템플릿
│   ├── background.js.backup       # 원본 백업
│   └── supabase/                  # Supabase 설정
│       ├── functions/             # Edge Functions
│       └── tables.sql             # 데이터베이스 스키마
├── 📁 payment/                      # 결제 서비스
│   ├── payment-script-secure.js   # 결제 처리 스크립트
│   └── payment-example.html       # 결제 시뮬레이션 페이지
├── 📁 build/                        # 빌드 시스템 (🔒 보안 강화)
│   ├── build.js                   # 빌드 스크립트
│   ├── package.js                 # 패키징 스크립트
│   ├── env.example               # 환경변수 예시
│   └── scripts/                   # 빌드 유틸리티
├── 📁 tests/                        # 테스트 파일
│   ├── manual-license-test.html   # 수동 라이선스 테스트
│   └── cleanup-test-data.html     # 테스트 데이터 정리
├── 📁 docs/                         # 문서
│   ├── DEPLOYMENT_GUIDE.md        # 배포 가이드
│   ├── SECURITY_SETUP.md          # 보안 설정 가이드
│   ├── WINDOWS_SETUP.md           # Windows 환경 설정
│   └── PAYMENT_SETUP.md           # 결제 시스템 가이드
├── 📁 dist/                         # 빌드 결과물 (자동 생성)
├── 📁 packages/                     # 웹스토어 패키지 (자동 생성)
├── package.json                   # 프로젝트 설정
├── .gitignore                     # Git 무시 파일
└── README.md                      # 이 파일
>>>>>>> master
```

## 🎯 특징

- **경량**: 이미지 파일 없이 CSS만으로 구현
- **반응형**: 화면 크기에 맞춰 경계 인식
- **성능 최적화**: RequestAnimationFrame 사용
- **메모리 안전**: 페이지 언로드 시 자동 정리
<<<<<<< HEAD
=======
- **🔒 보안 강화**: 환경변수 기반 API 키 관리
- **🚀 자동 빌드**: 개발/운영 환경 자동 분리
- **🛡️ 서버 검증**: 모든 라이선스 검증 백엔드 처리
>>>>>>> master

## 🐾 즐거운 고양이 라이프!

이제 웹 서핑할 때마다 귀여운 픽셀 고양이와 함께하세요! 🐱✨ 