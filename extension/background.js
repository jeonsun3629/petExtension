// background.js - 크롬 익스텐션 백그라운드 스크립트
// 개발 환경 설정으로 빌드됨

// 🔒 보안: 개발 환경 API 설정
const API_CONFIG = {
  supabase: {
    url: 'https://qwbhuusjpnpfwwrzpnfx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTkxNTgsImV4cCI6MjA2ODA3NTE1OH0.G2k1yy6bbnpyi2F6U7cPC1Y6LtBn2nCvfuIUHPXxb9s'
  },
  paypal: {
    clientId: 'Afq_c39jZ4MsbzJSMHyeuwy8mnzH-DWYb-sPL1MzMVwDpE2Dv6G-bVp21UMBodhhp78weR-9bPyPRzGE',
    baseUrl: 'https://api-m.paypal.com'
  },
  toss: {
    clientKey: 'test_ck_kYG57Eba3GRe6onMedYL8pWDOxmA'
  }
};

// 환경 설정 (개발 환경)
const IS_PRODUCTION = true;
const BUILD_TIME = new Date().toISOString();
const BUILD_ENVIRONMENT = 'development';

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: 메시지 수신:', request);
  
  // 웹페이지에서 온 라이센스 활성화 메시지 처리
  if (request.type === 'LICENSE_ACTIVATED') {
    console.log('Background: 라이센스 활성화 메시지 수신:', request.licenseKey);
    handleLicenseActivated(request.licenseKey);
    sendResponse({ success: true, message: '라이센스 활성화 처리됨' });
    return true;
  }
  
  // 기존 액션 기반 메시지 처리
  if (request.action) {
    switch (request.action) {
      case 'checkLicense':
        handleCheckLicense(request.data, sendResponse);
        return true; // 비동기 응답을 위해 true 반환
        
      case 'issueLicense':
        handleIssueLicense(request.data, sendResponse);
        return true;
        
      case 'getPaymentConfig':
        handleGetPaymentConfig(request.data, sendResponse);
        return true;
        
      case 'activatePremium':
        handleActivatePremium(request.data, sendResponse);
        return true;
        
      case 'getBuildInfo':
        sendResponse({
          success: true,
          info: {
            environment: BUILD_ENVIRONMENT,
            isProduction: IS_PRODUCTION,
            buildTime: BUILD_TIME,
            apiEndpoints: {
              supabase: API_CONFIG.supabase.url,
              paypal: API_CONFIG.paypal.baseUrl
            }
          }
        });
        return true;
        
      case 'checkAutoLicense':
        handleCheckAutoLicense(request.data, sendResponse);
        return true;
        
      case 'manualLicenseCheck':
        handleManualLicenseCheck(request.data, sendResponse);
        return true;
        
      default:
        console.warn('Background: 알 수 없는 액션:', request.action);
        sendResponse({ success: false, error: 'Unknown action' });
    }
  }
});

/**
 * Supabase에서 라이선스 확인 (보안 강화)
 */
async function handleCheckLicense(data, sendResponse) {
  try {
    const { userEmail, licenseKey } = data;
    console.log('Background: 라이선스 확인 시작');
    
    if (!userEmail && !licenseKey) {
      sendResponse({ success: false, error: '이메일 또는 라이선스 키가 필요합니다.' });
      return;
    }

    // API 요청 구성
    let query = `${API_CONFIG.supabase.url}/rest/v1/licenses?status=eq.active`;
    
    if (userEmail) {
      query += `&user_email=eq.${encodeURIComponent(userEmail)}`;
    }
    if (licenseKey) {
      query += `&license_key=eq.${encodeURIComponent(licenseKey)}`;
    }

    const response = await fetch(query, {
      method: 'GET',
      headers: {
        'apikey': API_CONFIG.supabase.anonKey,
        'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const licenses = await response.json();
    
    if (licenses && licenses.length > 0) {
      // 가장 최근 라이선스 선택
      const latestLicense = licenses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
      
      // 만료일 확인
      const expiresAt = new Date(latestLicense.expires_at);
      const now = new Date();
      
      if (expiresAt > now) {
        console.log('Background: 활성 라이선스 발견');
        sendResponse({
          success: true,
          license: {
            licenseKey: latestLicense.license_key,
            userEmail: latestLicense.user_email,
            paymentProvider: latestLicense.payment_provider,
            createdAt: latestLicense.created_at,
            expiresAt: latestLicense.expires_at,
            status: latestLicense.status
          }
        });
      } else {
        console.log('Background: 라이선스 만료됨');
        sendResponse({ success: false, error: '라이선스가 만료되었습니다.' });
      }
    } else {
      console.log('Background: 라이선스 없음');
      sendResponse({ success: false, error: '라이선스를 찾을 수 없습니다.' });
    }

  } catch (error) {
    console.error('Background: 라이선스 확인 오류:', error);
    // 운영 환경에서는 상세한 오류 메시지 숨김
    const errorMessage = IS_PRODUCTION ? 
      '라이선스 확인 중 오류가 발생했습니다.' : 
      error.message;
    sendResponse({ success: false, error: errorMessage });
  }
}

/**
 * Edge Function을 통한 라이선스 발급 (보안 강화)
 */
async function handleIssueLicense(data, sendResponse) {
  try {
    const { paymentProvider, paymentId, userEmail, amount } = data;
    console.log('Background: 라이선스 발급 요청');

    // 입력 검증
    if (!paymentProvider || !paymentId || !userEmail) {
      sendResponse({ success: false, error: '필수 파라미터가 누락되었습니다.' });
      return;
    }

    // 재시도 로직으로 라이선스 발급 처리
    const result = await processLicenseIssuanceWithRetry(data);
    
    if (result.success) {
      console.log('Background: 라이선스 발급 성공');
      
      // 추가: Supabase에 상세한 결제 정보 저장
      try {
        await savePaymentDetailsToSupabase(data, result.licenseKey);
      } catch (saveError) {
        console.warn('Background: 결제 정보 저장 실패 (라이선스는 발급됨):', saveError);
      }
      
      sendResponse({
        success: true,
        licenseKey: result.licenseKey,
        message: result.message
      });
    } else {
      console.error('Background: 라이선스 발급 실패:', result);
      sendResponse({
        success: false,
        error: result.error || '라이선스 발급에 실패했습니다.'
      });
    }

  } catch (error) {
    console.error('Background: 라이선스 발급 오류:', error);
    const errorMessage = IS_PRODUCTION ? 
      '라이선스 발급 중 오류가 발생했습니다.' : 
      error.message;
    sendResponse({ success: false, error: errorMessage });
  }
}

/**
 * 재시도 로직을 포함한 라이선스 발급 처리
 */
async function processLicenseIssuanceWithRetry(data) {
  const maxRetries = 3;
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Background: 라이선스 발급 시도 ${attempt}/${maxRetries}`);
      
      const response = await fetch(`${API_CONFIG.supabase.url}/functions/v1/issue-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': API_CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`
        },
        body: JSON.stringify({
          paymentProvider: data.paymentProvider,
          paymentId: data.paymentId,
          userEmail: data.userEmail,
          amount: data.amount || 9.99,
          environment: BUILD_ENVIRONMENT,
          clientInfo: {
            buildTime: BUILD_TIME,
            version: chrome.runtime.getManifest().version
          }
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return result;
      } else {
        throw new Error(result.error || '라이선스 발급에 실패했습니다.');
      }
      
    } catch (error) {
      lastError = error;
      console.error(`Background: 라이선스 발급 시도 ${attempt} 실패:`, error);
      
      if (attempt < maxRetries) {
        // 재시도 전 잠시 대기 (지수 백오프)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // 모든 재시도 실패
  console.error('Background: 모든 라이선스 발급 시도 실패:', lastError);
  return {
    success: false,
    error: lastError?.message || '라이선스 발급에 실패했습니다.'
  };
}

/**
 * 결제 설정 정보 제공 (클라이언트 키만, 보안 강화)
 */
function handleGetPaymentConfig(data, sendResponse) {
  try {
    const { provider } = data;
    
    // 공개해도 안전한 키들만 제공
    const config = {
      paypal: {
        clientId: API_CONFIG.paypal.clientId,
        environment: IS_PRODUCTION ? 'production' : 'sandbox',
        baseUrl: API_CONFIG.paypal.baseUrl
      },
      toss: {
        clientKey: API_CONFIG.toss.clientKey,
        environment: IS_PRODUCTION ? 'production' : 'sandbox'
      }
    };

    // 특정 provider 요청시 해당 설정만 반환
    if (provider && config[provider]) {
      sendResponse({ success: true, config: config[provider] });
    } else {
      sendResponse({ success: true, config: config });
    }

  } catch (error) {
    console.error('Background: 결제 설정 제공 오류:', error);
    const errorMessage = IS_PRODUCTION ? 
      '설정 로드 중 오류가 발생했습니다.' : 
      error.message;
    sendResponse({ success: false, error: errorMessage });
  }
}

/**
 * 프리미엄 활성화 처리 (보안 강화)
 */
async function handleActivatePremium(data, sendResponse) {
  try {
    const { licenseKey, userEmail } = data;
    console.log('Background: 프리미엄 활성화 시작');

    // 입력 검증
    if (!licenseKey || !userEmail) {
      sendResponse({ success: false, error: '라이선스 키와 이메일이 필요합니다.' });
      return;
    }

    // 라이선스 재검증
    const verificationResult = await new Promise((resolve) => {
      handleCheckLicense({ licenseKey, userEmail }, resolve);
    });

    if (!verificationResult.success) {
      sendResponse({ success: false, error: '라이선스 검증 실패: ' + verificationResult.error });
      return;
    }

    // Chrome storage에 프리미엄 상태 저장
    const premiumData = {
      'isPremium': true,
      'pixelcat_premium_license': licenseKey,
      'pixelcat_premium_activated': Date.now().toString(),
      'premiumActivatedBy': 'background-verified',
      'premiumActivatedAt': new Date().toISOString(),
      'lastPaymentEmail': userEmail,
      'licenseVerifiedAt': new Date().toISOString(),
      'buildEnvironment': BUILD_ENVIRONMENT
    };

    await chrome.storage.local.set(premiumData);

    // 모든 탭에 프리미엄 활성화 알림
    try {
      const tabs = await chrome.tabs.query({});
      const activeTabCount = tabs.length;
      let notifiedCount = 0;

      for (const tab of tabs) {
        try {
          await chrome.tabs.sendMessage(tab.id, {
            action: 'premiumActivated',
            licenseKey: licenseKey,
            activatedAt: new Date().toISOString()
          });
          notifiedCount++;
        } catch (tabError) {
          // 개별 탭 메시지 전송 실패는 무시
        }
      }

      console.log(`Background: ${notifiedCount}/${activeTabCount} 탭에 프리미엄 활성화 알림 전송`);
    } catch (tabError) {
      console.log('Background: 탭 메시지 전송 오류 (정상 동작)');
    }

    console.log('Background: 프리미엄 활성화 완료');
    sendResponse({ 
      success: true, 
      message: '프리미엄이 활성화되었습니다.',
      activatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Background: 프리미엄 활성화 오류:', error);
    const errorMessage = IS_PRODUCTION ? 
      '프리미엄 활성화 중 오류가 발생했습니다.' : 
      error.message;
    sendResponse({ success: false, error: errorMessage });
  }
}

/**
 * Supabase에 상세한 결제 정보 저장
 */
async function savePaymentDetailsToSupabase(paymentData, licenseKey) {
  try {
    const paymentRecord = {
      payment_provider: paymentData.paymentProvider,
      payment_id: paymentData.paymentId,
      amount: parseFloat(paymentData.amount || 9.99),
      currency: 'USD',
      status: 'completed',
      payment_data: {
        order_id: paymentData.paymentId,
        payer_id: paymentData.userEmail, // PayPal payer_id 대신 이메일 사용
        payer_email: paymentData.userEmail,
        payer_name: paymentData.userEmail.split('@')[0], // 이메일에서 이름 추출
        payment_time: new Date().toISOString(),
        product_name: 'Pixel Pet Extension Premium License',
        product_description: '프리미엄 스킨 라이선스',
        license_key: licenseKey
      },
      verified_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    const response = await fetch(`${API_CONFIG.supabase.url}/rest/v1/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_CONFIG.supabase.anonKey,
        'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`
      },
      body: JSON.stringify([paymentRecord])
    });

    if (!response.ok) {
      console.error('Background: 결제 정보 저장 실패:', response.status, response.statusText);
      throw new Error('결제 정보 저장에 실패했습니다.');
    }

    const result = await response.json();
    console.log('Background: 결제 정보 저장 성공:', result);
    return result;

  } catch (error) {
    console.error('Background: 결제 정보 저장 중 오류:', error);
    throw error;
  }
}

/**
 * 확장 프로그램 생명주기 관리
 */
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Background: 확장 프로그램 설치/업데이트:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Background: 첫 설치 완료');
    // 설치 완료 후 환경 정보 로깅
    console.log(`Background: 환경 - ${BUILD_ENVIRONMENT}, 빌드 시간 - ${BUILD_TIME}`);
  } else if (details.reason === 'update') {
    console.log('Background: 업데이트 완료');
    // 업데이트 후 자동 라이선스 확인
    setTimeout(() => {
      checkAutoLicenseActivation();
    }, 1000);
  }
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Background: Chrome 시작 - 자동 라이선스 확인');
  checkAutoLicenseActivation();
});

/**
 * 자동 라이선스 확인 및 활성화 (보안 강화)
 */
async function checkAutoLicenseActivation() {
  try {
    console.log('Background: 자동 라이선스 확인 시작');
    
    const result = await chrome.storage.local.get([
      'userEmails', 
      'lastPaymentEmail', 
      'isPremium', 
      'pixelcat_premium_license',
      'licenseVerifiedAt'
    ]);
    
    // 이미 프리미엄이고 최근에 검증된 경우 건너뛰기
    if (result.isPremium && result.licenseVerifiedAt) {
      const lastVerified = new Date(result.licenseVerifiedAt);
      const hoursSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceVerification < 1) { // 1시간 이내 검증된 경우
        console.log('Background: 최근 검증된 프리미엄 라이선스 존재');
        return;
      }
    }

    // 저장된 이메일들 수집
    const savedEmails = result.userEmails || [];
    if (result.lastPaymentEmail) {
      savedEmails.push(result.lastPaymentEmail);
    }

    const uniqueEmails = [...new Set(savedEmails)];
    console.log('Background: 확인할 이메일 수:', uniqueEmails.length);

    // 각 이메일로 라이선스 확인
    for (const email of uniqueEmails) {
      if (email && email.includes('@')) {
        try {
          const licenseResult = await new Promise((resolve) => {
            handleCheckLicense({ userEmail: email }, resolve);
          });

          if (licenseResult.success) {
            console.log('Background: 자동 라이선스 발견');
            
            // 프리미엄 활성화
            await new Promise((resolve) => {
              handleActivatePremium({
                licenseKey: licenseResult.license.licenseKey,
                userEmail: email
              }, resolve);
            });

            break; // 첫 번째 유효한 라이선스로 활성화 후 종료
          }
        } catch (emailError) {
          console.warn('Background: 이메일별 라이선스 확인 실패:', email, emailError);
        }
      }
    }

  } catch (error) {
    console.error('Background: 자동 라이선스 확인 오류:', error);
  }
}

// 주기적 라이선스 재검증 (24시간마다)
setInterval(async () => {
  try {
    const result = await chrome.storage.local.get([
      'isPremium', 
      'pixelcat_premium_license', 
      'lastPaymentEmail',
      'licenseVerifiedAt'
    ]);
    
    if (result.isPremium && result.pixelcat_premium_license) {
      // 마지막 검증 시간 확인
      const lastVerified = result.licenseVerifiedAt ? new Date(result.licenseVerifiedAt) : new Date(0);
      const hoursSinceVerification = (Date.now() - lastVerified.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceVerification >= 24) {
        console.log('Background: 24시간 주기 라이선스 재검증');
        
        const verificationResult = await new Promise((resolve) => {
          handleCheckLicense({ 
            licenseKey: result.pixelcat_premium_license,
            userEmail: result.lastPaymentEmail 
          }, resolve);
        });

        if (!verificationResult.success) {
          console.warn('Background: 라이선스 재검증 실패 - 프리미엄 비활성화');
          await chrome.storage.local.remove([
            'isPremium', 
            'pixelcat_premium_license', 
            'premiumActivatedBy',
            'licenseVerifiedAt'
          ]);
        } else {
          console.log('Background: 라이선스 재검증 성공');
          await chrome.storage.local.set({
            'licenseVerifiedAt': new Date().toISOString()
          });
        }
      }
    }
  } catch (error) {
    console.error('Background: 주기적 라이선스 재검증 오류:', error);
  }
}, 60 * 60 * 1000); // 1시간마다 체크 (24시간 경과시에만 실제 검증)

/**
 * 자동 라이선스 확인 핸들러 (popup.js에서 호출)
 */
async function handleCheckAutoLicense(data, sendResponse) {
  try {
    console.log('Background: 자동 라이선스 확인 요청 수신');
    
    // 기존 자동 라이선스 확인 함수 호출
    await checkAutoLicenseActivation();
    
    // 결과 확인
    const result = await chrome.storage.local.get(['isPremium', 'pixelcat_premium_license']);
    
    if (result.isPremium && result.pixelcat_premium_license) {
      sendResponse({ success: true, message: '자동 라이선스 확인 성공' });
    } else {
      sendResponse({ success: false, message: '라이선스를 찾을 수 없음' });
    }
    
  } catch (error) {
    console.error('Background: 자동 라이선스 확인 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 수동 라이선스 확인 핸들러 (popup.js에서 호출)
 */
async function handleManualLicenseCheck(data, sendResponse) {
  try {
    console.log('Background: 수동 라이선스 확인 요청 수신');
    
    // 저장된 이메일들로 라이선스 확인
    const result = await chrome.storage.local.get(['userEmails', 'lastPaymentEmail']);
    const savedEmails = result.userEmails || [];
    if (result.lastPaymentEmail) {
      savedEmails.push(result.lastPaymentEmail);
    }
    
    const uniqueEmails = [...new Set(savedEmails)];
    let foundLicense = false;
    
    for (const email of uniqueEmails) {
      if (email && email.includes('@')) {
        try {
          const licenseResult = await new Promise((resolve) => {
            handleCheckLicense({ userEmail: email }, resolve);
          });
          
          if (licenseResult.success) {
            console.log('Background: 수동 라이선스 발견');
            
            // 프리미엄 활성화
            await new Promise((resolve) => {
              handleActivatePremium({
                licenseKey: licenseResult.license.licenseKey,
                userEmail: email
              }, resolve);
            });
            
            foundLicense = true;
            break;
          }
        } catch (emailError) {
          console.warn('Background: 이메일별 라이선스 확인 실패:', email, emailError);
        }
      }
    }
    
    if (foundLicense) {
      sendResponse({ success: true, message: '수동 라이선스 확인 성공' });
    } else {
      sendResponse({ success: false, message: '라이선스를 찾을 수 없음' });
    }
    
  } catch (error) {
    console.error('Background: 수동 라이선스 확인 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 웹페이지에서 받은 라이센스 활성화 처리
 */
async function handleLicenseActivated(licenseKey) {
  try {
    console.log('Background: 라이센스 활성화 처리 시작:', licenseKey);
    
    // 라이센스 키를 로컬 스토리지에 저장
    await chrome.storage.local.set({
      'pixelcat_premium_license': licenseKey,
      'isPremium': true,
      'licenseActivatedAt': new Date().toISOString()
    });
    
    console.log('Background: 라이센스 활성화 완료');
    
    // 모든 탭에 프리미엄 활성화 알림
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'PREMIUM_ACTIVATED',
          licenseKey: licenseKey
        });
      } catch (error) {
        // 탭에서 메시지를 받을 수 없는 경우 무시
        console.log('Background: 탭 메시지 전송 실패 (정상):', tab.url);
      }
    }
    
  } catch (error) {
    console.error('Background: 라이센스 활성화 처리 오류:', error);
  }
}

// 확장 프로그램 시작 로그
console.log(`Background: 백그라운드 스크립트 로드 완료 (${BUILD_ENVIRONMENT})`);
console.log(`Background: 빌드 시간 - ${BUILD_TIME}`);
console.log(`Background: API 엔드포인트 - Supabase: ${API_CONFIG.supabase.url}`); 