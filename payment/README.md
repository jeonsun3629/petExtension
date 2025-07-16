# 💳 결제 서비스 시스템

이 폴더는 픽셀 펫 크롬 익스텐션의 결제 처리 관련 코드를 포함합니다.

## 📁 파일 구조

```
payment/
├── payment-script-secure.js  # 결제 처리 스크립트
├── payment-example.html      # 결제 시뮬레이션 페이지
└── README.md                 # 이 파일
```

## 🔧 주요 파일 설명

### `payment-script-secure.js`
- PayPal 및 Toss 결제 처리 로직
- 결제 완료 후 라이선스 키 생성
- 크롬 익스텐션과의 메시지 통신

### `payment-example.html`
- 결제 시뮬레이션 데모 페이지
- PayPal 및 Toss 결제 테스트 UI
- 실제 서비스에서는 별도 웹사이트로 구현

## 💰 지원 결제 방식

### PayPal
- **환경**: Sandbox (테스트) / Live (운영)
- **통화**: USD
- **가격**: $9.99
- **특징**: 국제 결제 지원

### Toss Payments
- **환경**: Test (테스트) / Live (운영)
- **통화**: KRW
- **가격**: ₩13,000
- **특징**: 국내 결제 특화

## 🔄 결제 플로우

### 1. 사용자 결제 시작
```javascript
// 크롬 익스텐션에서 결제 페이지 열기
chrome.tabs.create({
  url: 'https://your-payment-site.com/payment-example.html'
});
```

### 2. 결제 처리
```javascript
// PayPal 결제 처리
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: { value: '9.99', currency_code: 'USD' }
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      // 결제 성공 처리
      processPaymentSuccess('paypal', details);
    });
  }
}).render('#paypal-button-container');
```

### 3. 라이선스 활성화
```javascript
// 결제 성공 후 자동 활성화
function processPaymentSuccess(provider, paymentData) {
  // 라이선스 키 생성
  const licenseKey = generateLicenseKey(provider, paymentData.id);
  
  // 크롬 익스텐션에 메시지 전송
  chrome.runtime.sendMessage(EXTENSION_ID, {
    action: 'payment_success',
    licenseKey: licenseKey,
    paymentData: paymentData
  });
}
```

## 🔑 환경변수 설정

### 개발 환경
```bash
# PayPal Sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Toss Test
TOSS_CLIENT_KEY=test_ck_your-test-key
```

### 운영 환경
```bash
# PayPal Live
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_BASE_URL=https://api-m.paypal.com

# Toss Live
TOSS_CLIENT_KEY=live_ck_your-live-key
```

## 🔒 보안 고려사항

### 클라이언트 사이드 (이 폴더)
- 공개 키만 사용 (Client ID, Client Key)
- 실제 결제 검증은 서버에서 처리
- 민감한 정보는 서버로 전송

### 서버 사이드 (Backend)
- 민감한 키들은 Edge Functions에서 관리
- 결제 검증 및 라이선스 발급 처리
- 데이터베이스 저장 및 관리

## 🚀 배포 방법

### 1. 정적 웹사이트 배포
```bash
# Netlify, Vercel 등에 배포
# 환경변수 설정 필요

# 예: Netlify
netlify deploy --prod --dir=payment/
```

### 2. 도메인 설정
```json
// manifest.json에서 도메인 설정
{
  "externally_connectable": {
    "matches": ["https://your-payment-domain.com/*"]
  }
}
```

### 3. CORS 설정
```javascript
// 서버에서 CORS 헤더 설정
{
  "Access-Control-Allow-Origin": "chrome-extension://your-extension-id",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}
```

## 🧪 테스트 방법

### PayPal 테스트
```bash
# 샌드박스 계정 생성
https://developer.paypal.com/developer/accounts/

# 테스트 결제 실행
# 금액: $9.99
# 통화: USD
```

### Toss 테스트
```bash
# 테스트 키 사용
TOSS_CLIENT_KEY=test_ck_***

# 테스트 카드 번호
# 카드: 4242424242424242
# 만료일: 12/30
# CVC: 123
```

## 🔧 개발 가이드

### 새 결제 방식 추가
1. `payment-script-secure.js`에 새 결제 로직 추가
2. `payment-example.html`에 UI 컴포넌트 추가
3. 백엔드 검증 로직 업데이트

### 가격 정책 변경
1. `payment-script-secure.js`에서 가격 상수 변경
2. UI 텍스트 업데이트
3. 백엔드 검증 로직 동기화

### 통화 지원 추가
1. 결제 제공자별 통화 설정
2. 환율 처리 로직 (필요시)
3. UI 다국어 지원

## 📊 결제 분석

### 주요 지표
- 결제 성공률
- 결제 방식별 선호도
- 지역별 결제 패턴
- 환불 요청률

### 모니터링
```javascript
// 결제 이벤트 추적
gtag('event', 'purchase', {
  transaction_id: paymentData.id,
  value: 9.99,
  currency: 'USD',
  items: [{
    item_id: 'premium_skins',
    item_name: 'Premium Pet Skins',
    category: 'Digital Content',
    quantity: 1,
    price: 9.99
  }]
});
```

## 🐛 문제 해결

### 결제 실패 시
1. 네트워크 연결 확인
2. API 키 유효성 검증
3. 결제 제공자 상태 확인
4. 브라우저 콘솔 로그 확인

### 라이선스 활성화 실패 시
1. 크롬 익스텐션 설치 확인
2. 메시지 통신 권한 확인
3. 백엔드 서버 상태 확인
4. 라이선스 키 형식 검증 