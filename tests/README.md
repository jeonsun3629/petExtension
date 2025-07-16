# 🧪 테스트 시스템

이 폴더는 픽셀 펫 크롬 익스텐션의 테스트 파일들을 포함합니다.

## 📁 파일 구조

```
tests/
├── manual-license-test.html  # 수동 라이선스 테스트
├── cleanup-test-data.html    # 테스트 데이터 정리
└── README.md                 # 이 파일
```

## 🔧 주요 파일 설명

### `manual-license-test.html`
- 수동 라이선스 검증 테스트 도구
- Supabase 데이터베이스 직접 조회
- 라이선스 키 생성 및 검증 테스트

### `cleanup-test-data.html`
- 테스트 데이터베이스 정리 도구
- 불필요한 테스트 라이선스 삭제
- 개발 환경 초기화

## 🧪 테스트 시나리오

### 1. 라이선스 검증 테스트
```html
<!-- manual-license-test.html에서 실행 -->
1. 테스트 라이선스 키 생성
2. 데이터베이스에 직접 저장
3. 크롬 익스텐션에서 검증 테스트
4. 만료 시간 테스트
```

### 2. 결제 시뮬레이션 테스트
```html
<!-- payment-example.html과 연계 -->
1. PayPal 샌드박스 결제 테스트
2. Toss 테스트 결제 실행
3. 라이선스 자동 활성화 확인
4. 프리미엄 스킨 해제 테스트
```

### 3. 데이터 정리 테스트
```html
<!-- cleanup-test-data.html에서 실행 -->
1. 테스트 라이선스 목록 조회
2. 만료된 라이선스 삭제
3. 중복 라이선스 정리
4. 데이터베이스 최적화
```

## 🔑 테스트 환경 설정

### 개발 환경
```bash
# .env.development 파일 설정
SUPABASE_URL=https://your-supabase-url.supabase.co
SUPABASE_ANON_KEY=your-dev-anon-key
PAYPAL_CLIENT_ID=your-sandbox-client-id
TOSS_CLIENT_KEY=test_ck_your-test-key
```

### 테스트 라이선스 키
```javascript
// 하드코딩된 테스트 키들 (개발 환경에서만 사용)
const TEST_LICENSES = [
  'PREMIUM2024CAT',
  'TESTLICENSE123',
  'CATPRO2024',
  'UNLOCK456'
];
```

## 🚀 테스트 실행 방법

### 1. 수동 라이선스 테스트
```bash
# 1. 웹 브라우저에서 파일 열기
open tests/manual-license-test.html

# 2. 테스트 라이선스 생성
# 3. 크롬 익스텐션에서 라이선스 입력
# 4. 프리미엄 스킨 활성화 확인
```

### 2. 데이터 정리 테스트
```bash
# 1. 웹 브라우저에서 파일 열기
open tests/cleanup-test-data.html

# 2. 전체 라이선스 목록 조회
# 3. 테스트 데이터 선택적 삭제
# 4. 데이터베이스 상태 확인
```

## 📊 테스트 체크리스트

### 기능 테스트
- [ ] 크롬 익스텐션 설치 및 활성화
- [ ] 펫 애니메이션 정상 동작
- [ ] 팝업 UI 컨트롤 테스트
- [ ] 스킨 변경 기능 테스트
- [ ] 설정 저장 및 복원 테스트

### 라이선스 시스템 테스트
- [ ] 무료 스킨 기본 활성화
- [ ] 프리미엄 스킨 잠금 상태 확인
- [ ] 수동 라이선스 입력 테스트
- [ ] 라이선스 만료 처리 테스트
- [ ] 불법 라이선스 차단 테스트

### 결제 시스템 테스트
- [ ] PayPal 샌드박스 결제 테스트
- [ ] Toss 테스트 결제 실행
- [ ] 결제 완료 후 자동 활성화
- [ ] 결제 실패 시 에러 처리
- [ ] 중복 결제 방지 테스트

### 보안 테스트
- [ ] API 키 노출 확인
- [ ] 라이선스 키 검증 강화
- [ ] 클라이언트 사이드 우회 방지
- [ ] 서버 사이드 검증 테스트
- [ ] 주기적 재검증 테스트

## 🔧 테스트 도구 사용법

### manual-license-test.html
```javascript
// 1. 테스트 라이선스 생성
function generateTestLicense() {
  const licenseKey = 'TEST_' + Date.now();
  const userEmail = 'test@example.com';
  
  // Supabase에 직접 저장
  supabase.from('licenses').insert({
    license_key: licenseKey,
    user_email: userEmail,
    payment_provider: 'test',
    payment_id: 'test_' + Date.now(),
    status: 'active'
  });
}

// 2. 라이선스 검증 테스트
function testLicenseVerification(licenseKey) {
  // 크롬 익스텐션 API 호출
  chrome.runtime.sendMessage({
    action: 'checkLicense',
    data: { licenseKey: licenseKey }
  }, response => {
    console.log('검증 결과:', response);
  });
}
```

### cleanup-test-data.html
```javascript
// 1. 테스트 데이터 조회
function listTestData() {
  supabase
    .from('licenses')
    .select('*')
    .ilike('license_key', 'TEST_%')
    .then(result => {
      console.log('테스트 라이선스:', result.data);
    });
}

// 2. 테스트 데이터 삭제
function cleanupTestData() {
  supabase
    .from('licenses')
    .delete()
    .ilike('license_key', 'TEST_%')
    .then(result => {
      console.log('삭제 완료:', result);
    });
}
```

## 🐛 문제 해결

### 테스트 실패 시
1. **환경변수 확인**: `.env.development` 파일 설정
2. **네트워크 연결**: Supabase 연결 상태 확인
3. **브라우저 콘솔**: 오류 메시지 확인
4. **크롬 익스텐션**: 개발자 모드 활성화

### 라이선스 테스트 실패 시
1. **데이터베이스 권한**: Supabase RLS 정책 확인
2. **라이선스 키 형식**: 올바른 형식인지 확인
3. **만료 시간**: 라이선스 유효 기간 확인
4. **백엔드 서버**: Edge Functions 상태 확인

## 📈 성능 테스트

### 로드 테스트
```javascript
// 대량 라이선스 검증 테스트
async function loadTest() {
  const promises = [];
  
  for (let i = 0; i < 100; i++) {
    promises.push(
      testLicenseVerification('TEST_' + i)
    );
  }
  
  const results = await Promise.all(promises);
  console.log('성능 테스트 결과:', results);
}
```

### 메모리 사용량 테스트
```javascript
// 메모리 사용량 모니터링
function memoryTest() {
  const before = performance.memory.usedJSHeapSize;
  
  // 펫 애니메이션 1000회 실행
  for (let i = 0; i < 1000; i++) {
    createPixelPet();
    destroyPixelPet();
  }
  
  const after = performance.memory.usedJSHeapSize;
  console.log('메모리 사용량 증가:', after - before);
}
```

## 🔄 자동화 테스트

### CI/CD 통합
```yaml
# GitHub Actions 예시
name: Extension Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test
```

### 테스트 스크립트
```javascript
// test-runner.js
const tests = [
  'license-verification',
  'payment-processing',
  'skin-activation',
  'data-cleanup'
];

tests.forEach(test => {
  console.log(`Running ${test}...`);
  require(`./tests/${test}.js`);
});
``` 