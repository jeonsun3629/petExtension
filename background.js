<<<<<<< HEAD
// background.js - 크롬 익스텐션 백그라운드 스크립트
// API 키 보안 관리 및 결제/라이선스 처리

// ⚠️ 이 키들은 웹 스토어 배포 시 환경변수나 별도 설정으로 관리해야 함
const API_CONFIG = {
  supabase: {
    url: 'https://qwbhuusjpnpfwwrzpnfx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTkxNTgsImV4cCI6MjA2ODA3NTE1OH0.G2k1yy6bbnpyi2F6U7cPC1Y6LtBn2nCvfuIUHPXxb9s'
  },
  paypal: {
    clientId: 'AQqclewaDKAMaraZmd8ZQui1tkw1e9xSwq_D3pC66SiMugo1uoath2Y65EHWVOLfvCCLmf9Wztr0uRQk',
    baseUrl: 'https://api-m.sandbox.paypal.com' // 운영시: https://api-m.paypal.com
  },
  toss: {
    clientKey: 'test_ck_kYG57Eba3GRe6onMedYL8pWDOxmA'
  }
};

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: 메시지 수신:', request.action);
  
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
      
    default:
      console.warn('Background: 알 수 없는 액션:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

/**
 * Supabase에서 라이선스 확인
 */
async function handleCheckLicense(data, sendResponse) {
  try {
    const { userEmail } = data;
    console.log('Background: 라이선스 확인 시작:', userEmail);
    
    if (!userEmail) {
      sendResponse({ success: false, error: '이메일이 필요합니다.' });
      return;
    }

    const response = await fetch(
      `${API_CONFIG.supabase.url}/rest/v1/licenses?user_email=eq.${encodeURIComponent(userEmail)}&status=eq.active`,
      {
        method: 'GET',
        headers: {
          'apikey': API_CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Supabase에 라이선스 발급 요청
 */
async function handleIssueLicense(data, sendResponse) {
  try {
    const { paymentProvider, paymentId, userEmail, amount } = data;
    console.log('Background: 라이선스 발급 요청:', { paymentProvider, paymentId, userEmail });

    const response = await fetch(`${API_CONFIG.supabase.url}/functions/v1/issue-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_CONFIG.supabase.anonKey,
        'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`
      },
      body: JSON.stringify({
        paymentProvider,
        paymentId,
        userEmail,
        amount: amount || 9.99
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('Background: 라이선스 발급 성공');
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
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 결제 설정 정보 제공 (클라이언트 키만)
 */
function handleGetPaymentConfig(data, sendResponse) {
  try {
    const { provider } = data;
    
    const config = {
      paypal: {
        clientId: API_CONFIG.paypal.clientId,
        // 시크릿 키는 제외 (보안)
      },
      toss: {
        clientKey: API_CONFIG.toss.clientKey,
        // 시크릿 키는 제외 (보안)
      }
    };

    if (provider && config[provider]) {
      sendResponse({ success: true, config: config[provider] });
    } else {
      sendResponse({ success: true, config: config });
    }

  } catch (error) {
    console.error('Background: 결제 설정 제공 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 프리미엄 활성화 처리
 */
async function handleActivatePremium(data, sendResponse) {
  try {
    const { licenseKey, userEmail } = data;
    console.log('Background: 프리미엄 활성화:', { licenseKey, userEmail });

    // Chrome storage에 프리미엄 상태 저장
    await chrome.storage.local.set({
      'isPremium': true,
      'pixelcat_premium_license': licenseKey,
      'pixelcat_premium_activated': Date.now().toString(),
      'premiumActivatedBy': 'auto-background',
      'premiumActivatedAt': new Date().toISOString(),
      'lastPaymentEmail': userEmail
    });

    // 모든 탭에 프리미엄 활성화 알림
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'premiumActivated',
          licenseKey: licenseKey
        }).catch(() => {
          // 메시지 전송 실패 무시 (content script 없는 탭)
        });
      });
    } catch (tabError) {
      console.log('Background: 탭 메시지 전송 일부 실패 (정상)');
    }

    console.log('Background: 프리미엄 활성화 완료');
    sendResponse({ success: true, message: '프리미엄이 활성화되었습니다.' });

  } catch (error) {
    console.error('Background: 프리미엄 활성화 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 확장 프로그램 설치/업데이트 시 초기화
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Background: 확장 프로그램 설치/업데이트:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Background: 첫 설치 - 환영합니다!');
  } else if (details.reason === 'update') {
    console.log('Background: 업데이트 완료');
    // 업데이트 시 자동 라이선스 확인
    checkAutoLicenseActivation();
  }
});

// 확장 프로그램 시작 시 자동 라이선스 확인
chrome.runtime.onStartup.addListener(() => {
  console.log('Background: Chrome 시작 - 자동 라이선스 확인');
  checkAutoLicenseActivation();
});

/**
 * 자동 라이선스 확인 및 활성화
 */
async function checkAutoLicenseActivation() {
  try {
    console.log('Background: 자동 라이선스 확인 시작');
    
    // 저장된 이메일들 가져오기
    const result = await chrome.storage.local.get(['userEmails', 'lastPaymentEmail', 'isPremium']);
    
    // 이미 프리미엄이면 건너뛰기
    if (result.isPremium) {
      console.log('Background: 이미 프리미엄 활성화됨');
      return;
    }

    const savedEmails = result.userEmails || [];
    if (result.lastPaymentEmail) {
      savedEmails.push(result.lastPaymentEmail);
    }

    // 중복 제거
    const uniqueEmails = [...new Set(savedEmails)];
    console.log('Background: 확인할 이메일:', uniqueEmails);

    // 각 이메일로 라이선스 확인
    for (const email of uniqueEmails) {
      if (email) {
        const licenseResult = await new Promise((resolve) => {
          handleCheckLicense({ userEmail: email }, resolve);
        });

        if (licenseResult.success) {
          console.log('Background: 자동 라이선스 발견!', email);
          
          // 프리미엄 활성화
          await new Promise((resolve) => {
            handleActivatePremium({
              licenseKey: licenseResult.license.licenseKey,
              userEmail: email
            }, resolve);
          });

          break; // 첫 번째 유효한 라이선스로 활성화 후 종료
        }
      }
    }

  } catch (error) {
    console.error('Background: 자동 라이선스 확인 오류:', error);
  }
}

=======
// background.js - 크롬 익스텐션 백그라운드 스크립트
// API 키 보안 관리 및 결제/라이선스 처리

// ⚠️ 이 키들은 웹 스토어 배포 시 환경변수나 별도 설정으로 관리해야 함
const API_CONFIG = {
  supabase: {
    url: 'https://qwbhuusjpnpfwwrzpnfx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Ymh1dXNqcG5wZnd3cnpwbmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0OTkxNTgsImV4cCI6MjA2ODA3NTE1OH0.G2k1yy6bbnpyi2F6U7cPC1Y6LtBn2nCvfuIUHPXxb9s'
  },
  paypal: {
    clientId: 'AQqclewaDKAMaraZmd8ZQui1tkw1e9xSwq_D3pC66SiMugo1uoath2Y65EHWVOLfvCCLmf9Wztr0uRQk',
    baseUrl: 'https://api-m.sandbox.paypal.com' // 운영시: https://api-m.paypal.com
  },
  toss: {
    clientKey: 'test_ck_kYG57Eba3GRe6onMedYL8pWDOxmA'
  }
};

// 메시지 리스너 설정
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background: 메시지 수신:', request.action);
  
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
      
    default:
      console.warn('Background: 알 수 없는 액션:', request.action);
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

/**
 * Supabase에서 라이선스 확인
 */
async function handleCheckLicense(data, sendResponse) {
  try {
    const { userEmail } = data;
    console.log('Background: 라이선스 확인 시작:', userEmail);
    
    if (!userEmail) {
      sendResponse({ success: false, error: '이메일이 필요합니다.' });
      return;
    }

    const response = await fetch(
      `${API_CONFIG.supabase.url}/rest/v1/licenses?user_email=eq.${encodeURIComponent(userEmail)}&status=eq.active`,
      {
        method: 'GET',
        headers: {
          'apikey': API_CONFIG.supabase.anonKey,
          'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * Supabase에 라이선스 발급 요청
 */
async function handleIssueLicense(data, sendResponse) {
  try {
    const { paymentProvider, paymentId, userEmail, amount } = data;
    console.log('Background: 라이선스 발급 요청:', { paymentProvider, paymentId, userEmail });

    const response = await fetch(`${API_CONFIG.supabase.url}/functions/v1/issue-license`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_CONFIG.supabase.anonKey,
        'Authorization': `Bearer ${API_CONFIG.supabase.anonKey}`
      },
      body: JSON.stringify({
        paymentProvider,
        paymentId,
        userEmail,
        amount: amount || 9.99
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('Background: 라이선스 발급 성공');
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
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 결제 설정 정보 제공 (클라이언트 키만)
 */
function handleGetPaymentConfig(data, sendResponse) {
  try {
    const { provider } = data;
    
    const config = {
      paypal: {
        clientId: API_CONFIG.paypal.clientId,
        // 시크릿 키는 제외 (보안)
      },
      toss: {
        clientKey: API_CONFIG.toss.clientKey,
        // 시크릿 키는 제외 (보안)
      }
    };

    if (provider && config[provider]) {
      sendResponse({ success: true, config: config[provider] });
    } else {
      sendResponse({ success: true, config: config });
    }

  } catch (error) {
    console.error('Background: 결제 설정 제공 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

/**
 * 프리미엄 활성화 처리
 */
async function handleActivatePremium(data, sendResponse) {
  try {
    const { licenseKey, userEmail } = data;
    console.log('Background: 프리미엄 활성화:', { licenseKey, userEmail });

    // Chrome storage에 프리미엄 상태 저장
    await chrome.storage.local.set({
      'isPremium': true,
      'pixelcat_premium_license': licenseKey,
      'pixelcat_premium_activated': Date.now().toString(),
      'premiumActivatedBy': 'auto-background',
      'premiumActivatedAt': new Date().toISOString(),
      'lastPaymentEmail': userEmail
    });

    // 모든 탭에 프리미엄 활성화 알림
    try {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'premiumActivated',
          licenseKey: licenseKey
        }).catch(() => {
          // 메시지 전송 실패 무시 (content script 없는 탭)
        });
      });
    } catch (tabError) {
      console.log('Background: 탭 메시지 전송 일부 실패 (정상)');
    }

    console.log('Background: 프리미엄 활성화 완료');
    sendResponse({ success: true, message: '프리미엄이 활성화되었습니다.' });

  } catch (error) {
    console.error('Background: 프리미엄 활성화 오류:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// 확장 프로그램 설치/업데이트 시 초기화
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Background: 확장 프로그램 설치/업데이트:', details.reason);
  
  if (details.reason === 'install') {
    console.log('Background: 첫 설치 - 환영합니다!');
  } else if (details.reason === 'update') {
    console.log('Background: 업데이트 완료');
    // 업데이트 시 자동 라이선스 확인
    checkAutoLicenseActivation();
  }
});

// 확장 프로그램 시작 시 자동 라이선스 확인
chrome.runtime.onStartup.addListener(() => {
  console.log('Background: Chrome 시작 - 자동 라이선스 확인');
  checkAutoLicenseActivation();
});

/**
 * 자동 라이선스 확인 및 활성화
 */
async function checkAutoLicenseActivation() {
  try {
    console.log('Background: 자동 라이선스 확인 시작');
    
    // 저장된 이메일들 가져오기
    const result = await chrome.storage.local.get(['userEmails', 'lastPaymentEmail', 'isPremium']);
    
    // 이미 프리미엄이면 건너뛰기
    if (result.isPremium) {
      console.log('Background: 이미 프리미엄 활성화됨');
      return;
    }

    const savedEmails = result.userEmails || [];
    if (result.lastPaymentEmail) {
      savedEmails.push(result.lastPaymentEmail);
    }

    // 중복 제거
    const uniqueEmails = [...new Set(savedEmails)];
    console.log('Background: 확인할 이메일:', uniqueEmails);

    // 각 이메일로 라이선스 확인
    for (const email of uniqueEmails) {
      if (email) {
        const licenseResult = await new Promise((resolve) => {
          handleCheckLicense({ userEmail: email }, resolve);
        });

        if (licenseResult.success) {
          console.log('Background: 자동 라이선스 발견!', email);
          
          // 프리미엄 활성화
          await new Promise((resolve) => {
            handleActivatePremium({
              licenseKey: licenseResult.license.licenseKey,
              userEmail: email
            }, resolve);
          });

          break; // 첫 번째 유효한 라이선스로 활성화 후 종료
        }
      }
    }

  } catch (error) {
    console.error('Background: 자동 라이선스 확인 오류:', error);
  }
}

>>>>>>> bc75f37e76227019e91025937dba237d8cc4d672
console.log('Background: 백그라운드 스크립트 로드 완료'); 