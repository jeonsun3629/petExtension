# 픽셀 고양이 확장프로그램 🐱🐶

Chrome 브라우저에서 귀여운 픽셀 펫들이 웹페이지를 돌아다니며 여러분과 함께하는 확장프로그램입니다!

## 🌟 주요 기능

- **귀여운 픽셀 펫들**: 고양이와 강아지가 웹페이지를 돌아다님
- **프리미엄 스킨**: 추가 펫 스킨들 (결제 필요)
- **PayPal 결제**: 안전한 결제 시스템
- **GitHub Pages 호스팅**: 웹에서 결제 페이지 접근 가능

## 🚀 빠른 시작

### 개발 환경 설정

```bash
# 저장소 클론
git clone https://github.com/jeonsun3629/petExtension.git
cd petExtension

# 의존성 설치
npm install

# 개발 빌드
npm run build:dev

# 프로덕션 빌드
npm run build:prod
```

## 📦 빌드 및 패키징

### 기본 빌드
```bash
# 개발 빌드
npm run build:dev

# 프로덕션 빌드
npm run build:prod

# 전체 빌드 (클린 + 빌드 + 패키징)
npm run build:all
```

### 패키징
```bash
# 확장프로그램만 패키징
npm run package:extension

# GitHub Pages만 패키징
npm run package:gh-pages

# 전체 패키징
npm run package
```

### 정리
```bash
npm run clean
```

## 📁 프로젝트 구조

```
petExtension/
├── extension/          # Chrome 확장프로그램 소스
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup.html
├── docs/              # GitHub Pages용 파일들
│   ├── payment.html   # 결제 페이지
│   └── README.md
├── build/             # 빌드 스크립트
│   ├── build.js
│   └── package.js
├── dist/              # 빌드 결과물
│   ├── payment/       # 확장프로그램용 결제 페이지
│   └── docs/          # GitHub Pages용 파일들
└── packages/          # 패키징 결과물
    ├── pixel-pet-extension-v*.zip
    └── github-pages-v*.zip
```

## 🔧 개발 가이드

### 환경 변수 설정
```bash
# .env.development 또는 .env.production 파일 생성
PAYPAL_CLIENT_ID=your_paypal_client_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 확장프로그램 개발
- `extension/` 폴더에서 확장프로그램 코드 수정
- `npm run build:dev`로 개발 빌드
- Chrome에서 확장프로그램 다시 로드

### 결제 페이지 개발
- `docs/payment.html` 수정
- GitHub Pages에 자동 배포됨
- [https://jeonsun3629.github.io/petExtension/payment.html]에서 확인

## 🌐 배포

### GitHub Pages 배포
```bash
npm run deploy:gh-pages
git add .
git commit -m "Update payment page"
git push
```

### Chrome Web Store 배포
1. `npm run package:extension` 실행
2. `packages/pixel-pet-extension-v*.zip` 파일 다운로드
3. Chrome Web Store Developer Dashboard에서 업로드

## 🐛 문제 해결

### 빌드 오류
```bash
npm run clean
npm run build:prod
```

### 결제 페이지 접근 불가
- GitHub Pages 설정 확인
- 브라우저 캐시 삭제
- 네트워크 연결 상태 확인

### 확장프로그램 로드 실패
- Chrome 개발자 모드 확인
- 확장프로그램 ID 확인
- manifest.json 문법 오류 확인

## 📄 라이선스

MIT License

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

- **GitHub Issues**: [이슈 등록](https://github.com/jeonsun3629/petExtension/issues)
- **결제 문의**: PayPal 결제 페이지에서 문의

---

**즐거운 픽셀 펫과 함께하는 브라우징 되세요! 🎉** 
