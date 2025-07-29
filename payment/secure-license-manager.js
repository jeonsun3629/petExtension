// secure-license-manager.js - 보안 라이선스 매니저 (API 키 없음)
// Background Script와 메시지 통신을 통해 안전한 라이선스 관리

/**
 * Background Script에 메시지 전송 헬퍼 함수
 * @param {string} action - 액션 타입
 * @param {Object} data - 전송할 데이터
 * @returns {Promise<Object>} 응답 결과
 */
async function sendMessageToBackground(action, data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(
        { action: action, data: data },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Background 통신 오류:', chrome.runtime.lastError.message);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response || { success: false, error: 'No response' });
          }
        }
      );
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      reject(error);
    }
  });
}

/**
 * Supabase에서 사용자 이메일로 라이선스 확인 (Background 경유)
 * @param {string} userEmail - 확인할 사용자 이메일
 * @returns {Promise<Object|null>} 라이선스 정보 또는 null
 */
async function checkLicenseFromSupabaseSecure(userEmail) {
  try {
    if (!userEmail) {
      console.log('이메일이 제공되지 않았습니다.');
      return null;
    }

    console.log('Secure: 라이선스 확인 요청 (Background 경유):', userEmail);
    
    const response = await sendMessageToBackground('checkLicense', { userEmail });
    
    if (response.success) {
      console.log('Secure: 라이선스 확인 성공:', response.license);
      return response.license;
    } else {
      console.log('Secure: 라이선스 없음:', response.error);
      return null;
    }

  } catch (error) {
    console.error('Secure: 라이선스 확인 오류:', error);
    return null;
  }
}

/**
 * 여러 이메일로 라이선스 확인 (Chrome 계정 + 추가 이메일)
 * @param {string[]} emails - 확인할 이메일 목록
 * @returns {Promise<Object|null>} 발견된 라이선스 정보 또는 null
 */
async function checkMultipleEmailsForLicenseSecure(emails) {
  try {
    for (const email of emails) {
      if (email) {
        const license = await checkLicenseFromSupabaseSecure(email);
        if (license) {
          console.log(`Secure: 라이선스 발견 (${email}):`, license);
          return license;
        }
      }
    }
    
    console.log('Secure: 모든 이메일에서 라이선스를 찾을 수 없습니다.');
    return null;
    
  } catch (error) {
    console.error('Secure: 다중 이메일 라이선스 확인 오류:', error);
    return null;
  }
}

/**
 * Chrome 로그인 이메일과 저장된 이메일을 모두 확인하여 자동 라이선스 활성화
 * @returns {Promise<boolean>} 자동 활성화 성공 여부
 */
async function autoActivateLicenseFromSupabaseSecure() {
  try {
    console.log('Secure: 자동 라이선스 활성화 시도 중...');

    // 1. Chrome 로그인 이메일 확인
    let chromeEmail = null;
    if (typeof getChromeUserEmail === 'function') {
      chromeEmail = await getChromeUserEmail();
    }

    // 2. 저장된 이메일 확인
    let savedEmail = null;
    try {
      const result = await chrome.storage.local.get(['paymentEmail']);
      savedEmail = result.paymentEmail;
    } catch (error) {
      console.warn('저장된 이메일 확인 실패:', error);
    }

    // 3. 확인할 이메일 목록 생성
    const emailsToCheck = [];
    if (chromeEmail) emailsToCheck.push(chromeEmail);
    if (savedEmail && savedEmail !== chromeEmail) emailsToCheck.push(savedEmail);

    if (emailsToCheck.length === 0) {
      console.log('Secure: 확인할 이메일이 없습니다.');
      return false;
    }

    console.log('Secure: 확인할 이메일 목록:', emailsToCheck);

    // 4. 라이선스 확인
    const license = await checkMultipleEmailsForLicenseSecure(emailsToCheck);

    if (license) {
      // 5. 라이선스 활성화
      await chrome.storage.local.set({
        'isPremium': true,
        'pixelcat_premium_license': license.license_key,
        'pixelcat_premium_activated': Date.now().toString(),
        'premiumActivatedBy': 'auto-supabase'
      });

      console.log('Secure: 자동 라이선스 활성화 성공!');
      return true;
    } else {
      console.log('Secure: 자동 활성화할 라이선스를 찾을 수 없습니다.');
      return false;
    }

  } catch (error) {
    console.error('Secure: 자동 라이선스 활성화 오류:', error);
    return false;
  }
}

/**
 * 결제 완료 후 라이선스 발급 요청 (Background 경유)
 * @param {Object} paymentData - 결제 데이터
 * @returns {Promise<Object>} 라이선스 발급 결과
 */
async function issueLicenseSecure(paymentData) {
  try {
    console.log('Secure: 라이선스 발급 요청 (Background 경유):', paymentData);
    
    const response = await sendMessageToBackground('issueLicense', paymentData);
    
    if (response.success) {
      console.log('Secure: 라이선스 발급 성공:', response.licenseKey);
      return { success: true, licenseKey: response.licenseKey };
    } else {
      console.error('Secure: 라이선스 발급 실패:', response.error);
      return { success: false, error: response.error };
    }

  } catch (error) {
    console.error('Secure: 라이선스 발급 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Background에서 결제 설정 가져오기 (보안 모드)
 * @param {string} provider - 결제 제공자 (paypal, toss)
 * @returns {Promise<Object|null>} 결제 설정 또는 null
 */
async function getPaymentConfigSecure(provider) {
  try {
    console.log(`Secure: ${provider} 설정 요청 (Background 경유)`);
    
    const response = await sendMessageToBackground('getPaymentConfig', { provider });
    
    if (response.success) {
      console.log(`Secure: ${provider} 설정 가져오기 성공`);
      return response.config;
    } else {
      console.error(`Secure: ${provider} 설정 가져오기 실패:`, response.error);
      return null;
    }

  } catch (error) {
    console.error(`Secure: ${provider} 설정 가져오기 오류:`, error);
    return null;
  }
}

/**
 * 결제 이메일을 안전하게 저장
 * @param {string} email - 저장할 이메일
 * @returns {Promise<boolean>} 저장 성공 여부
 */
async function savePaymentEmailSecure(email) {
  try {
    if (!email) {
      console.warn('저장할 이메일이 없습니다.');
      return false;
    }

    await chrome.storage.local.set({ 'paymentEmail': email });
    console.log('Secure: 결제 이메일 저장 성공:', email);
    return true;

  } catch (error) {
    console.error('Secure: 결제 이메일 저장 오류:', error);
    return false;
  }
}

/**
 * 수동 라이선스 확인 (Background 경유)
 * @returns {Promise<boolean>} 확인 성공 여부
 */
async function manualLicenseCheckSecure() {
  try {
    console.log('Secure: 수동 라이선스 확인 시작...');

    // Chrome 로그인 이메일 확인
    let chromeEmail = null;
    if (typeof getChromeUserEmail === 'function') {
      chromeEmail = await getChromeUserEmail();
    }

    if (!chromeEmail) {
      console.log('Secure: Chrome 로그인 이메일을 찾을 수 없습니다.');
      return false;
    }

    // 라이선스 확인
    const license = await checkLicenseFromSupabaseSecure(chromeEmail);

    if (license) {
      // 라이선스 활성화
      await chrome.storage.local.set({
        'isPremium': true,
        'pixelcat_premium_license': license.license_key,
        'pixelcat_premium_activated': Date.now().toString(),
        'premiumActivatedBy': 'manual-supabase'
      });

      console.log('Secure: 수동 라이선스 확인 성공!');
      return true;
    } else {
      console.log('Secure: 수동 확인에서 라이선스를 찾을 수 없습니다.');
      return false;
    }

  } catch (error) {
    console.error('Secure: 수동 라이선스 확인 오류:', error);
    return false;
  }
}

/**
 * 라이선스 모니터링 시작 (주기적 확인)
 * @param {number} intervalMinutes - 확인 간격 (분)
 */
function startLicenseMonitoringSecure(intervalMinutes = 60) {
  try {
    console.log(`Secure: 라이선스 모니터링 시작 (${intervalMinutes}분 간격)`);
    
    setInterval(async () => {
      try {
        await autoActivateLicenseFromSupabaseSecure();
      } catch (error) {
        console.error('Secure: 라이선스 모니터링 오류:', error);
      }
    }, intervalMinutes * 60 * 1000);

  } catch (error) {
    console.error('Secure: 라이선스 모니터링 시작 오류:', error);
  }
} 