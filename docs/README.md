# 픽셀 고양이 확장프로그램 - 결제 페이지

이 폴더는 GitHub Pages에서 호스팅되는 결제 페이지입니다.

## 파일 구조

- `payment.html` - PayPal 결제 페이지 (GitHub Pages용)
- `ACTUAL_DEPLOYMENT_GUIDE.md` - 실제 배포 가이드
- `DEPLOYMENT_CHECKLIST.md` - 배포 체크리스트

## 접속 방법

GitHub Pages에서 호스팅되는 결제 페이지에 접속하려면:

```
https://jeonsun3629.github.io/petExtension/docs/payment.html
```

## 기능

### PayPal 결제
- PayPal Sandbox 환경에서 테스트 가능
- 실제 결제 금액: $2.99
- 결제 완료 후 라이선스 키 생성

### 토스 결제
- 준비 중 (현재는 알림 메시지만 표시)

## 개발 환경 vs GitHub Pages

### 개발 환경
- 로컬 파일에서 직접 열기
- Chrome Extension API 사용 가능
- Background Script와 통신 가능

### GitHub Pages
- 웹페이지 모드로 실행
- PayPal SDK만 사용
- 라이선스 키 생성 후 수동 입력 필요

## 테스트 방법

1. **GitHub Pages에서 테스트**:
   - https://jeonsun3629.github.io/petExtension/docs/payment.html 접속
   - PayPal 버튼 클릭하여 결제 테스트

2. **개발자 모드에서 테스트**:
   - Chrome에서 `chrome://extensions/` 접속
   - 개발자 모드 활성화
   - 확장프로그램 로드 후 테스트

## PayPal 설정

- Client ID: `Abs4OksUpVjIL04t4lmPxErQkzzlK-5u5H95Cy0AC5pLa5ipgH8cnFcemI-DRufjjD51dgjI88A1_E6O`
- Environment: Sandbox (테스트용)
- Currency: USD

## 문제 해결

### PayPal SDK 로드 실패
- GitHub Pages의 보안 정책으로 인한 문제일 수 있음
- 브라우저 콘솔에서 오류 메시지 확인
- 네트워크 연결 상태 확인

### 결제 후 라이선스 키가 표시되지 않음
- 브라우저 콘솔에서 JavaScript 오류 확인
- PayPal Sandbox 계정으로 테스트 중인지 확인

---

**참고**: 이 페이지는 GitHub Pages에서 호스팅되므로 Chrome Extension API는 사용할 수 없습니다. 실제 확장프로그램에서는 `extension/payment/` 폴더의 파일을 사용하세요. 