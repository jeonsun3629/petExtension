<<<<<<< HEAD
# 🌟 픽셀 고양이 - 프리미엄 스킨 결제 시스템 가이드

## 📋 개요

이 가이드는 픽셀 고양이 크롬 확장 프로그램에 PayPal과 토스(Toss) 결제를 연동하여 프리미엄 스킨을 판매하는 방법을 설명합니다.

## 🚀 구현된 기능

### ✅ 완료된 기능
- 프리미엄 스킨 UI (회색/검은/노란 강아지)
- 결제 모달 시스템
- PayPal & 토스 결제 페이지 연동
- 결제 완료 후 자동 라이센스 활성화
- 수동 라이센스 키 입력 시스템
- 외부 메시지 수신 처리

### 🎨 포함된 프리미엄 스킨
- `greyDog` - 회색 강아지 스킨
- `blackDog` - 검은 강아지 스킨  
- `yellowDog` - 노란 강아지 스킨

## 🔧 설정 방법

### 1. manifest.json 설정 확인
```json
{
  "externally_connectable": {
    "matches": ["https://your-payment-site.com/*", "https://localhost:3000/*"]
  },
  "web_accessible_resources": [
    {
      "resources": ["skins/yellowCat.png", "skins/greyCat.png", "skins/calicoCat.png", "skins/greyDog.PNG", "skins/blackDog.PNG", "skins/yellowDog.PNG"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 2. 결제 서버 설정
`01.payment-example.html`을 실제 결제 서버로 교체하거나 수정하세요.

#### PayPal 설정
```javascript
// PayPal SDK 설정
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=KRW"></script>
```

#### 토스페이먼츠 설정
```javascript
// 토스페이먼츠 SDK 설정
<script src="https://js.tosspayments.com/v1/payment"></script>
```

### 3. 확장 프로그램 ID 설정
`01.payment-example.html`에서 실제 확장 프로그램 ID로 변경:
```javascript
const EXTENSION_ID = 'your-actual-extension-id-here';
```

## 💳 결제 플로우

### 자동 활성화 플로우
1. 사용자가 프리미엄 스킨 클릭
2. 결제 모달 표시
3. PayPal 또는 토스 결제 선택
4. 외부 결제 페이지로 이동
5. 결제 완료 후 라이센스 키 생성
6. **자동으로 확장 프로그램에 메시지 전송**
7. 프리미엄 스킨 즉시 해제

### 수동 활성화 플로우 (백업)
1. 결제 완료 후 라이센스 키 복사
2. 확장 프로그램에서 "라이센스 입력" 클릭
3. 라이센스 키 입력 후 활성화

## 🔐 라이센스 키 시스템

### 현재 테스트 키들
```javascript
const validLicenses = [
  'PREMIUM2024CAT',
  'TESTLICENSE123', 
  'CATPRO2024',
  'UNLOCK456'
];
```

### 동적 키 생성 (결제 완료 시)
- PayPal: `PAYPAL_SUCCESS_YYYY-MM-DD_RANDOMID`
- 토스: `TOSS_SUCCESS_YYYY-MM-DD_RANDOMID`

## 🛠️ 실제 서비스 배포 시 수정 사항

### 1. 결제 서버 구축
현재 `01.payment-example.html`은 시뮬레이션입니다. 실제 서비스에서는:

```javascript
// 실제 PayPal 결제 처리
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: { value: '3.00', currency_code: 'KRW' }
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      // 결제 성공 후 라이센스 키 생성
      const licenseKey = generateLicenseKey();
      activateExtensionPremium(licenseKey);
    });
  }
}).render('#paypal-button-container');
```

### 2. 라이센스 검증 서버
```javascript
// 서버에서 라이센스 검증
async function verifyLicenseKey(licenseKey) {
  const response = await fetch('https://your-api.com/verify-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey })
  });
  return response.json();
}
```

### 3. manifest.json 도메인 업데이트
```json
{
  "externally_connectable": {
    "matches": ["https://your-actual-domain.com/*"]
  }
}
```

## 🧪 테스트 방법

### 1. 프리미엄 스킨 테스트
1. 확장 프로그램 설치
2. 프리미엄 스킨(💎 표시) 클릭
3. 결제 모달 확인

### 2. 수동 라이센스 테스트
1. "라이센스 입력" 클릭
2. 테스트 키 입력: `TESTLICENSE123`
3. 프리미엄 스킨 해제 확인

### 3. 자동 활성화 테스트
1. `01.payment-example.html` 열기
2. PayPal 또는 토스 결제 버튼 클릭
3. 시뮬레이션 완료 후 자동 활성화 확인

## 🚨 보안 고려사항

### 클라이언트 사이드 보안 한계
- 확장 프로그램 소스코드는 공개됨
- 라이센스 검증을 완전히 우회 불가능하게 만들 수 없음
- 서버 검증 + 주기적 재검증 권장

### 권장 보안 조치
1. **서버 라이센스 검증** - 클라이언트에서 받은 키를 서버에서 재검증
2. **주기적 재검증** - 앱 시작 시마다 라이센스 상태 확인
3. **하드웨어 바인딩** - 기기별 라이센스 제한
4. **만료 시간 설정** - 라이센스 유효기간 설정

## 📞 문의사항

구현 중 문제가 발생하거나 추가 기능이 필요한 경우:
- 결제 연동 문제
- 라이센스 시스템 개선
- 보안 강화 방안
- 추가 결제 수단 연동

=======
# 🌟 픽셀 고양이 - 프리미엄 스킨 결제 시스템 가이드

## 📋 개요

이 가이드는 픽셀 고양이 크롬 확장 프로그램에 PayPal과 토스(Toss) 결제를 연동하여 프리미엄 스킨을 판매하는 방법을 설명합니다.

## 🚀 구현된 기능

### ✅ 완료된 기능
- 프리미엄 스킨 UI (회색/검은/노란 강아지)
- 결제 모달 시스템
- PayPal & 토스 결제 페이지 연동
- 결제 완료 후 자동 라이센스 활성화
- 수동 라이센스 키 입력 시스템
- 외부 메시지 수신 처리

### 🎨 포함된 프리미엄 스킨
- `greyDog` - 회색 강아지 스킨
- `blackDog` - 검은 강아지 스킨  
- `yellowDog` - 노란 강아지 스킨

## 🔧 설정 방법

### 1. manifest.json 설정 확인
```json
{
  "externally_connectable": {
    "matches": ["https://your-payment-site.com/*", "https://localhost:3000/*"]
  },
  "web_accessible_resources": [
    {
      "resources": ["skins/yellowCat.png", "skins/greyCat.png", "skins/calicoCat.png", "skins/greyDog.PNG", "skins/blackDog.PNG", "skins/yellowDog.PNG"],
      "matches": ["<all_urls>"]
    }
  ]
}
```

### 2. 결제 서버 설정
`01.payment-example.html`을 실제 결제 서버로 교체하거나 수정하세요.

#### PayPal 설정
```javascript
// PayPal SDK 설정
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=KRW"></script>
```

#### 토스페이먼츠 설정
```javascript
// 토스페이먼츠 SDK 설정
<script src="https://js.tosspayments.com/v1/payment"></script>
```

### 3. 확장 프로그램 ID 설정
`01.payment-example.html`에서 실제 확장 프로그램 ID로 변경:
```javascript
const EXTENSION_ID = 'your-actual-extension-id-here';
```

## 💳 결제 플로우

### 자동 활성화 플로우
1. 사용자가 프리미엄 스킨 클릭
2. 결제 모달 표시
3. PayPal 또는 토스 결제 선택
4. 외부 결제 페이지로 이동
5. 결제 완료 후 라이센스 키 생성
6. **자동으로 확장 프로그램에 메시지 전송**
7. 프리미엄 스킨 즉시 해제

### 수동 활성화 플로우 (백업)
1. 결제 완료 후 라이센스 키 복사
2. 확장 프로그램에서 "라이센스 입력" 클릭
3. 라이센스 키 입력 후 활성화

## 🔐 라이센스 키 시스템

### 현재 테스트 키들
```javascript
const validLicenses = [
  'PREMIUM2024CAT',
  'TESTLICENSE123', 
  'CATPRO2024',
  'UNLOCK456'
];
```

### 동적 키 생성 (결제 완료 시)
- PayPal: `PAYPAL_SUCCESS_YYYY-MM-DD_RANDOMID`
- 토스: `TOSS_SUCCESS_YYYY-MM-DD_RANDOMID`

## 🛠️ 실제 서비스 배포 시 수정 사항

### 1. 결제 서버 구축
현재 `01.payment-example.html`은 시뮬레이션입니다. 실제 서비스에서는:

```javascript
// 실제 PayPal 결제 처리
paypal.Buttons({
  createOrder: function(data, actions) {
    return actions.order.create({
      purchase_units: [{
        amount: { value: '3.00', currency_code: 'KRW' }
      }]
    });
  },
  onApprove: function(data, actions) {
    return actions.order.capture().then(function(details) {
      // 결제 성공 후 라이센스 키 생성
      const licenseKey = generateLicenseKey();
      activateExtensionPremium(licenseKey);
    });
  }
}).render('#paypal-button-container');
```

### 2. 라이센스 검증 서버
```javascript
// 서버에서 라이센스 검증
async function verifyLicenseKey(licenseKey) {
  const response = await fetch('https://your-api.com/verify-license', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ licenseKey })
  });
  return response.json();
}
```

### 3. manifest.json 도메인 업데이트
```json
{
  "externally_connectable": {
    "matches": ["https://your-actual-domain.com/*"]
  }
}
```

## 🧪 테스트 방법

### 1. 프리미엄 스킨 테스트
1. 확장 프로그램 설치
2. 프리미엄 스킨(💎 표시) 클릭
3. 결제 모달 확인

### 2. 수동 라이센스 테스트
1. "라이센스 입력" 클릭
2. 테스트 키 입력: `TESTLICENSE123`
3. 프리미엄 스킨 해제 확인

### 3. 자동 활성화 테스트
1. `01.payment-example.html` 열기
2. PayPal 또는 토스 결제 버튼 클릭
3. 시뮬레이션 완료 후 자동 활성화 확인

## 🚨 보안 고려사항

### 클라이언트 사이드 보안 한계
- 확장 프로그램 소스코드는 공개됨
- 라이센스 검증을 완전히 우회 불가능하게 만들 수 없음
- 서버 검증 + 주기적 재검증 권장

### 권장 보안 조치
1. **서버 라이센스 검증** - 클라이언트에서 받은 키를 서버에서 재검증
2. **주기적 재검증** - 앱 시작 시마다 라이센스 상태 확인
3. **하드웨어 바인딩** - 기기별 라이센스 제한
4. **만료 시간 설정** - 라이센스 유효기간 설정

## 📞 문의사항

구현 중 문제가 발생하거나 추가 기능이 필요한 경우:
- 결제 연동 문제
- 라이센스 시스템 개선
- 보안 강화 방안
- 추가 결제 수단 연동

>>>>>>> bc75f37e76227019e91025937dba237d8cc4d672
언제든 연락주세요! 🚀 