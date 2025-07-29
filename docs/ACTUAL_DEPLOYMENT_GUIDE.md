# 실제 배포 가이드

## 1. Extension ID 확인 및 설정

### 개발자 모드에서 Extension ID 확인
1. Chrome에서 `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `extension` 폴더 선택하여 로드
5. 로드된 확장프로그램의 ID 복사 (예: `abcdefghijklmnopqrstuvwxyz123456`)

### Extension ID 업데이트
`payment/secure-license-manager.js` 파일의 `knownIds` 배열에 실제 Extension ID 추가:

```javascript
const knownIds = [
  '실제_확장프로그램_ID_여기에_입력', // 실제 extension ID로 교체
  'chrome-extension://실제_확장프로그램_ID_여기에_입력'
];
```

## 2. PayPal 설정 확인

### 현재 설정
- Client ID: `Abs4OksUpVjIL04t4lmPxErQkzzlK-5u5H95Cy0AC5pLa5ipgH8cnFcemI-DRufjjD51dgjI88A1_E6O`
- Environment: Sandbox (테스트용)
- 결제 금액: $2.99

### 실제 서비스용 설정 (선택사항)
실제 서비스에서는 다음을 변경해야 합니다:

1. **PayPal Live Client ID**로 변경
2. **Environment를 'production'**으로 변경
3. **결제 금액 확인**

## 3. 테스트 방법

### 개발자 모드 테스트
1. Chrome에서 `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. 확장프로그램 로드
4. 확장프로그램 아이콘 클릭
5. 결제 기능 테스트

### 웹페이지 테스트
1. `payment/payment.html` 파일을 브라우저에서 직접 열기
2. PayPal 결제 버튼 클릭하여 테스트

## 4. 배포 준비

### 파일 구조 확인
```
extension/
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── payment/
│   ├── payment.html
│   ├── payment-script-secure.js
│   ├── secure-license-manager.js
│   └── user-info.js
└── assets/
    └── skins/
```

### 필수 파일들
- [x] manifest.json (CSP 설정 포함)
- [x] background.js (PayPal 설정 포함)
- [x] payment.html (PayPal SDK 로드)
- [x] payment-script-secure.js (결제 처리)
- [x] secure-license-manager.js (라이선스 관리)

## 5. Chrome Web Store 배포 (선택사항)

### 배포 전 체크리스트
- [ ] Extension ID 설정 완료
- [ ] PayPal 설정 확인
- [ ] 결제 테스트 완료
- [ ] 프리미엄 기능 테스트 완료
- [ ] 다국어 지원 확인

### 배포 단계
1. Chrome Web Store Developer Dashboard 접속
2. 새 항목 추가
3. 확장프로그램 ZIP 파일 업로드
4. 스토어 등록 정보 입력
5. 심사 제출

## 6. 문제 해결

### Extension ID 오류
```
Error in invocation of runtime.sendMessage: chrome.runtime.sendMessage() called from a webpage must specify an Extension ID
```
**해결방법**: `secure-license-manager.js`의 `knownIds` 배열에 실제 Extension ID 추가

### PayPal 결제 실패
```
PayPal 설정을 가져올 수 없습니다
```
**해결방법**: 
1. `background.js`의 PayPal Client ID 확인
2. `payment-script-secure.js`의 기본 설정 확인

### CSP 오류
```
Refused to load script from 'https://www.paypal.com'
```
**해결방법**: `manifest.json`의 CSP 설정 확인

## 7. 보안 고려사항

### API 키 보안
- Supabase API 키는 이미 공개 키이므로 안전
- PayPal Client ID는 공개해도 안전
- 민감한 정보는 Background Script에서만 처리

### 결제 보안
- 모든 결제는 PayPal의 안전한 환경에서 처리
- 클라이언트에서는 결제 정보를 직접 다루지 않음
- 라이선스 검증은 서버에서 수행

## 8. 모니터링 및 유지보수

### 로그 확인
- Chrome 개발자 도구의 Console 탭에서 로그 확인
- Background Script 로그는 `chrome://extensions/`에서 확인

### 업데이트
- PayPal SDK 업데이트 시 `payment-script-secure.js` 수정
- 새로운 결제 방법 추가 시 `secure-license-manager.js` 수정

---

**참고**: 이 가이드는 개발 환경을 기준으로 작성되었습니다. 실제 서비스 배포 시에는 추가적인 보안 검토가 필요할 수 있습니다. 