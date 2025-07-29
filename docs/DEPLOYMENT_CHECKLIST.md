# 배포 체크리스트

## ✅ 완료된 항목

### 1. PayPal 설정
- [x] PayPal Client ID 설정: `Abs4OksUpVjIL04t4lmPxErQkzzlK-5u5H95Cy0AC5pLa5ipgH8cnFcemI-DRufjjD51dgjI88A1_E6O`
- [x] Background Script에서 PayPal 설정 제공
- [x] Payment Script에서 PayPal SDK 동적 로드
- [x] 결제 금액 설정: $2.99

### 2. 보안 설정
- [x] Content Security Policy (CSP) 설정
- [x] PayPal 도메인 허용: `https://www.paypal.com`
- [x] 웹페이지 모드에서도 안전한 폴백 처리
- [x] API 키는 공개해도 안전한 것들만 사용

### 3. 파일 구조
- [x] manifest.json (CSP 설정 포함)
- [x] background.js (PayPal 설정 포함)
- [x] payment.html (PayPal SDK 로드)
- [x] payment-script-secure.js (결제 처리)
- [x] secure-license-manager.js (라이선스 관리)

## 🔄 진행 중인 항목

### 4. Extension ID 설정
- [ ] 개발자 모드에서 Extension ID 확인
- [ ] `secure-license-manager.js`의 `knownIds` 배열 업데이트
- [ ] Extension ID 오류 해결 확인

## 📋 테스트 체크리스트

### 웹페이지 테스트
- [x] `payment.html` 직접 열기
- [x] PayPal 버튼 렌더링 확인
- [x] PayPal 결제 플로우 테스트
- [x] 결제 성공 후 라이선스 발급 확인

### 개발자 모드 테스트
- [ ] Chrome에서 `chrome://extensions/` 접속
- [ ] 개발자 모드 활성화
- [ ] 확장프로그램 로드
- [ ] Extension ID 확인 및 복사
- [ ] 확장프로그램 아이콘 클릭
- [ ] 결제 기능 테스트
- [ ] 프리미엄 기능 활성화 확인

## 🚀 배포 준비

### Chrome Web Store 배포 (선택사항)
- [ ] Extension ID 설정 완료
- [ ] 모든 테스트 통과
- [ ] ZIP 파일 생성
- [ ] 스토어 등록 정보 준비
- [ ] 심사 제출

## 🔧 문제 해결

### Extension ID 오류 해결
```
Error in invocation of runtime.sendMessage: chrome.runtime.sendMessage() called from a webpage must specify an Extension ID
```

**해결 단계**:
1. Chrome에서 `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. 확장프로그램 로드
4. Extension ID 복사
5. `payment/secure-license-manager.js` 파일 수정:

```javascript
const knownIds = [
  '실제_확장프로그램_ID_여기에_입력', // 여기에 실제 ID 입력
  'chrome-extension://실제_확장프로그램_ID_여기에_입력'
];
```

### PayPal 결제 테스트
1. PayPal Sandbox 계정으로 테스트
2. 테스트용 카드 정보 사용
3. 결제 완료 후 라이선스 발급 확인

## 📝 최종 확인사항

### 기능 확인
- [ ] PayPal 결제 버튼 표시
- [ ] PayPal 결제 플로우 작동
- [ ] 결제 성공 후 라이선스 발급
- [ ] 프리미엄 기능 활성화
- [ ] 다국어 지원 (한국어/영어)

### 보안 확인
- [ ] CSP 설정으로 외부 스크립트 안전하게 로드
- [ ] 민감한 정보는 Background Script에서만 처리
- [ ] 웹페이지 모드에서도 안전한 폴백

### 성능 확인
- [ ] PayPal SDK 로드 시간
- [ ] 결제 플로우 응답 시간
- [ ] 메모리 사용량

---

**다음 단계**: Extension ID를 확인하고 설정한 후, 개발자 모드에서 전체 테스트를 진행하세요. 