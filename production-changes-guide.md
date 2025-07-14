# 🚀 운영 환경 적용을 위한 변경사항 가이드

## 📋 개요
현재 개발/테스트 환경에서 실제 운영 환경으로 전환하기 위해 필요한 코드 수정사항들을 정리합니다.

## 🔧 1. 하드코딩된 테스트 라이센스 제거 (중요도: ⭐⭐⭐⭐⭐)

### 현재 문제점
`content.js`의 `verifyLicenseKey` 메서드에 하드코딩된 테스트 라이센스들:

```javascript
// ❌ 제거해야 할 코드
const validLicenses = [
  'PREMIUM2024CAT',
  'TESTLICENSE123',
  'CATPRO2024', 
  'UNLOCK456',
  'PAYPAL_SUCCESS_' + new Date().toISOString().slice(0, 10),
  'TOSS_SUCCESS_' + new Date().toISOString().slice(0, 10)
];
```

### 수정 방법
`content.js` 파일의 `verifyLicenseKey` 메서드를 다음으로 교체:

```javascript
// ✅ 실제 서버 검증 코드
async verifyLicenseKey(licenseKey) {
  try {
    console.log('라이센스 검증 요청:', licenseKey);
    
    // Background script를 통해 안전한 서버 검증
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'checkLicense',
        data: { licenseKey: licenseKey }
      }, resolve);
    });

    if (response && response.success) {
      console.log('라이센스 검증 성공:', response.license);
      return true;
    } else {
      console.log('라이센스 검증 실패:', response?.error);
      return false;
    }

  } catch (error) {
    console.error('라이센스 검증 오류:', error);
    return false;
  }
}
```

## 🔧 2. 환경별 API 설정 분리 (중요도: ⭐⭐⭐⭐)

### 현재 문제점
`background.js`와 `supabase_env.txt`에 샌드박스/테스트 API 키들이 하드코딩됨:

```javascript
// ❌ 샌드박스 설정들
paypal: {
  baseUrl: 'https://api-m.sandbox.paypal.com' // 샌드박스
},
toss: {
  clientKey: 'test_ck_kYG57Eba3GRe6onMedYL8pWDOxmA' // 테스트 키
}
```

### 수정 방법

#### 2-1. background.js 환경 분리
```javascript
// ✅ 환경별 설정
const IS_PRODUCTION = true; // 운영 시 true로 변경

const API_CONFIG = {
  supabase: {
    url: 'https://qwbhuusjpnpfwwrzpnfx.supabase.co',
    anonKey: 'your-production-anon-key'
  },
  paypal: {
    clientId: IS_PRODUCTION ? 'LIVE_PAYPAL_CLIENT_ID' : 'SANDBOX_CLIENT_ID',
    baseUrl: IS_PRODUCTION ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'
  },
  toss: {
    clientKey: IS_PRODUCTION ? 'live_ck_XXXXXXXXX' : 'test_ck_XXXXXXXXX'
  }
};
```

#### 2-2. Supabase 환경변수 업데이트
```bash
# ✅ 운영 환경 설정
SUPABASE_URL=https://qwbhuusjpnpfwwrzpnfx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# PayPal 운영 환경
PAYPAL_CLIENT_ID=your-live-paypal-client-id
PAYPAL_CLIENT_SECRET=your-live-paypal-client-secret
PAYPAL_BASE_URL=https://api-m.paypal.com

# 토스페이먼츠 운영 환경
TOSS_CLIENT_KEY=live_ck_XXXXXXXXX
TOSS_SECRET_KEY=live_sk_XXXXXXXXX
```

## 🔧 3. Edge Function 배포 (중요도: ⭐⭐⭐⭐)

### 현재 상태
Edge Function이 Supabase에 배포되지 않아 결제 검증이 실패함.

### 해결 방법
```bash
# Supabase CLI 설치
npm install -g supabase

# 프로젝트 초기화
supabase init

# Edge Function 배포
supabase functions deploy issue-license

# 환경변수 설정
supabase secrets set PAYPAL_CLIENT_ID=your-live-client-id
supabase secrets set PAYPAL_CLIENT_SECRET=your-live-client-secret
supabase secrets set TOSS_SECRET_KEY=your-live-secret-key
```

## 🔧 4. 결제 금액 및 통화 설정 (중요도: ⭐⭐⭐)

### 현재 문제점
여러 파일에서 다른 금액/통화 설정:

```javascript
// payment-script-secure.js - USD
amount: { value: '9.99', currency_code: 'USD' }

// payment-script-secure.js - KRW  
amount: 9990, // 원 단위

// 통화 불일치 문제
```

### 수정 방법
모든 파일에서 통일된 금액 설정:

```javascript
// ✅ 통일된 설정
const PRICE_CONFIG = {
  USD: { amount: 9.99, currency: 'USD' },
  KRW: { amount: 13000, currency: 'KRW' }
};

// PayPal (USD)
amount: { 
  value: PRICE_CONFIG.USD.amount.toString(), 
  currency_code: PRICE_CONFIG.USD.currency 
}

// Toss (KRW)
amount: PRICE_CONFIG.KRW.amount
```

## 🔧 5. 도메인 및 URL 설정 (중요도: ⭐⭐⭐)

### 현재 문제점
`manifest.json`에 테스트 도메인들이 설정됨:

```json
{
  "externally_connectable": {
    "matches": ["https://your-payment-site.com/*", "https://localhost:3000/*"]
  }
}
```

### 수정 방법
실제 운영 도메인으로 변경:

```json
{
  "externally_connectable": {
    "matches": ["https://your-actual-domain.com/*"]
  }
}
```

## 🔧 6. 에러 처리 및 로깅 강화 (중요도: ⭐⭐⭐)

### 추가 필요 기능
```javascript
// ✅ 운영 환경용 에러 처리
function handleProductionError(error, context) {
  // 사용자에게는 친화적인 메시지
  const userMessage = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  
  // 개발자에게는 상세한 로그 (원격 로깅 서비스 연동)
  console.error(`[${context}] Production Error:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  });
  
  return userMessage;
}
```

## 🔧 7. 보안 강화 (중요도: ⭐⭐⭐⭐)

### 7-1. CSP 강화
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval' https://www.paypal.com https://js.tosspayments.com; object-src 'self';"
  }
}
```

### 7-2. 라이센스 재검증 로직
```javascript
// ✅ 주기적 라이센스 재검증 (24시간마다)
setInterval(async () => {
  await this.autoCheckUserLicense();
}, 24 * 60 * 60 * 1000);
```

## 📋 8. 체크리스트

### 배포 전 필수 확인사항
- [ ] 하드코딩된 테스트 라이센스 제거
- [ ] 샌드박스 API 키를 운영 키로 변경
- [ ] Edge Function Supabase에 배포
- [ ] 실제 도메인으로 `manifest.json` 업데이트
- [ ] 통화/금액 설정 통일
- [ ] 에러 처리 로직 강화
- [ ] 라이센스 재검증 로직 추가

### 테스트 필수 항목
- [ ] PayPal 실제 결제 테스트
- [ ] Toss 실제 결제 테스트
- [ ] 라이센스 검증 서버 연동 테스트
- [ ] Chrome 웹 스토어 업로드 테스트
- [ ] 다양한 브라우저 환경 테스트

## 🚨 주의사항

1. **API 키 보안**: 운영 API 키는 절대 Git에 커밋하지 마세요
2. **점진적 배포**: 테스트 환경에서 충분히 검증 후 운영 배포
3. **백업**: 기존 개발 버전을 백업한 후 수정
4. **모니터링**: 운영 배포 후 결제 성공률 모니터링 필수

---

이 가이드를 따라 수정하면 실제 운영 환경에서 안전하게 결제 시스템을 사용할 수 있습니다! 🚀 