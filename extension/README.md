# 📱 크롬 익스텐션 소스 코드

이 폴더는 픽셀 펫 크롬 익스텐션의 소스 코드를 포함합니다.

## 📁 파일 구조

```
extension/
├── manifest.json              # 확장 프로그램 메타데이터
├── content.js                 # 메인 로직 (펫 애니메이션)
├── popup.html                 # 팝업 UI
├── popup.js                   # 팝업 컨트롤러
├── secure-license-manager.js  # 라이선스 관리
├── user-info.js               # 사용자 정보 관리
├── styles/
│   ├── cat-pixel-sprites.css  # 펫 스프라이트 스타일
│   └── cat-sprites.css        # 펫 기본 스타일
├── assets/
│   ├── skins/                 # 펫 스킨 이미지
│   └── _locales/              # 다국어 지원
└── README.md                  # 이 파일
```

## 🔧 주요 파일 설명

### `manifest.json`
- 확장 프로그램의 메타데이터
- 권한 설정 및 리소스 정의
- Manifest V3 표준 준수

### `content.js`
- 웹페이지에 주입되는 메인 스크립트
- 펫 애니메이션 및 동작 로직
- 스킨 관리 및 사용자 설정 처리

### `popup.html` & `popup.js`
- 확장 프로그램 팝업 UI
- 펫 설정 및 프리미엄 스킨 관리
- 사용자 인터페이스 컨트롤러

### `secure-license-manager.js`
- 라이선스 검증 및 관리
- 백그라운드 스크립트와 통신
- 프리미엄 기능 활성화

### `user-info.js`
- 사용자 정보 관리
- Chrome 사용자 정보 처리
- 로그인 상태 확인

## 🎨 스킨 시스템

### 무료 스킨
- `yellowCat`: 노란 고양이
- `greyCat`: 회색 고양이
- `calicoCat`: 삼색 고양이

### 프리미엄 스킨
- `greyDog`: 회색 강아지
- `blackDog`: 검은 강아지
- `yellowDog`: 노란 강아지

## 🔄 빌드 과정

이 폴더의 파일들은 `../build/build.js` 스크립트에 의해 `../dist/` 폴더로 복사됩니다.

빌드 시 경로 매핑:
- `styles/` → `dist/` (평면화)
- `assets/` → `dist/assets/`
- 기타 파일들 → `dist/`

## 📝 개발 가이드

1. **새 스킨 추가**:
   - `assets/skins/` 폴더에 이미지 추가
   - `content.js`의 `skinConfigs` 업데이트
   - `popup.html`에 스킨 옵션 추가

2. **새 기능 추가**:
   - `content.js`에서 메인 로직 구현
   - `popup.js`에서 UI 컨트롤 추가
   - `manifest.json`에서 권한 확인

3. **다국어 지원**:
   - `assets/_locales/`에 언어별 messages.json 추가
   - `popup.html`에서 `__MSG_키명__` 형식 사용

## 🚀 테스트

크롬 개발자 모드에서 빌드된 `../dist/` 폴더를 로드하여 테스트할 수 있습니다. 