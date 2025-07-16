<<<<<<< HEAD
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

    // 2. 로컬 스토리지에서 저장된 이메일들 확인
    const savedEmails = [];
    try {
      const result = await chrome.storage.local.get(['userEmails', 'lastPaymentEmail']);
      if (result.userEmails) {
        savedEmails.push(...result.userEmails);
      }
      if (result.lastPaymentEmail) {
        savedEmails.push(result.lastPaymentEmail);
      }
    } catch (storageError) {
      console.log('Secure: 스토리지에서 이메일 가져오기 실패:', storageError);
    }

    // 3. 확인할 이메일 목록 생성 (중복 제거)
    const emailsToCheck = [...new Set([chromeEmail, ...savedEmails].filter(Boolean))];
    console.log('Secure: 라이선스 확인할 이메일 목록:', emailsToCheck);

    if (emailsToCheck.length === 0) {
      console.log('Secure: 확인할 이메일이 없습니다.');
      return false;
    }

    // 4. 라이선스 확인
    const license = await checkMultipleEmailsForLicenseSecure(emailsToCheck);
    
    if (license) {
      // 5. 라이선스 발견 시 Background에 프리미엄 활성화 요청
      const activationResult = await sendMessageToBackground('activatePremium', {
        licenseKey: license.licenseKey,
        userEmail: license.userEmail
      });
      
      if (activationResult.success) {
        console.log('✅ Secure: 자동 라이선스 활성화 성공!');
        return true;
      } else {
        console.error('❌ Secure: 프리미엄 활성화 실패:', activationResult.error);
        return false;
      }
    } else {
      console.log('❌ Secure: 자동 라이선스 활성화 실패 - 라이선스 없음');
      return false;
    }

  } catch (error) {
    console.error('Secure: 자동 라이선스 활성화 오류:', error);
    return false;
  }
}

/**
 * 결제 시 라이선스 발급 요청 (Background 경유)
 * @param {Object} paymentData - 결제 정보
 * @returns {Promise<Object>} 라이선스 발급 결과
 */
async function issueLicenseSecure(paymentData) {
  try {
    console.log('Secure: 라이선스 발급 요청 (Background 경유):', paymentData);
    
    const response = await sendMessageToBackground('issueLicense', paymentData);
    
    if (response.success) {
      console.log('Secure: 라이선스 발급 성공:', response.licenseKey);
      
      // 결제한 이메일 저장
      if (paymentData.userEmail) {
        await savePaymentEmailSecure(paymentData.userEmail);
      }
    }
    
    return response;

  } catch (error) {
    console.error('Secure: 라이선스 발급 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 결제 설정 정보 요청 (Background 경유)
 * @param {string} provider - 결제 제공업체 ('paypal' 또는 'toss')
 * @returns {Promise<Object>} 결제 설정 정보
 */
async function getPaymentConfigSecure(provider) {
  try {
    console.log('Secure: 결제 설정 요청 (Background 경유):', provider);
    
    const response = await sendMessageToBackground('getPaymentConfig', { provider });
    
    if (response.success) {
      console.log('Secure: 결제 설정 수신 완료');
      return response.config;
    } else {
      console.error('Secure: 결제 설정 요청 실패:', response.error);
      return null;
    }

  } catch (error) {
    console.error('Secure: 결제 설정 요청 오류:', error);
    return null;
  }
}

/**
 * 결제한 이메일을 저장하는 함수 (자동 라이선스 확인용)
 * @param {string} email - 저장할 이메일
 */
async function savePaymentEmailSecure(email) {
  try {
    if (!email) return;
    
    console.log('Secure: 결제 이메일 저장:', email);
    
    // Chrome storage에 저장
    const result = await chrome.storage.local.get(['userEmails']);
    const existingEmails = result.userEmails || [];
    
    // 중복 제거하고 최신 이메일을 앞으로
    const updatedEmails = [email, ...existingEmails.filter(e => e !== email)].slice(0, 5); // 최대 5개까지 저장
    
    await chrome.storage.local.set({
      'userEmails': updatedEmails,
      'lastPaymentEmail': email
    });
    
    console.log('Secure: 결제 이메일 저장 완료:', updatedEmails);
    
  } catch (error) {
    console.error('Secure: 결제 이메일 저장 실패:', error);
  }
}

/**
 * 수동 라이선스 확인 (사용자가 버튼 클릭 시)
 * @returns {Promise<boolean>} 성공 여부
 */
async function manualLicenseCheckSecure() {
  try {
    console.log('Secure: 수동 라이선스 확인 시작...');
    
    const success = await autoActivateLicenseFromSupabaseSecure();
    
    if (success) {
      alert('✅ 라이선스가 자동으로 활성화되었습니다!');
      
      // UI 새로고침
      if (typeof location !== 'undefined') {
        location.reload();
      }
    } else {
      alert('❌ 등록된 라이선스를 찾을 수 없습니다.\n수동으로 라이선스 키를 입력해주세요.');
    }
    
    return success;
    
  } catch (error) {
    console.error('Secure: 수동 라이선스 확인 오류:', error);
    alert('라이선스 확인 중 오류가 발생했습니다.');
    return false;
  }
}

/**
 * 라이선스 상태를 정기적으로 확인하는 함수
 * @param {number} intervalMinutes - 확인 간격 (분 단위, 기본값: 60분)
 */
function startLicenseMonitoringSecure(intervalMinutes = 60) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  console.log(`Secure: 라이선스 모니터링 시작 (${intervalMinutes}분 간격)`);
  
  // 즉시 한 번 실행
  autoActivateLicenseFromSupabaseSecure();
  
  // 주기적 실행
  setInterval(() => {
    console.log('Secure: 주기적 라이선스 확인 실행...');
    autoActivateLicenseFromSupabaseSecure();
  }, intervalMs);
}

=======
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

    // 2. 로컬 스토리지에서 저장된 이메일들 확인
    const savedEmails = [];
    try {
      const result = await chrome.storage.local.get(['userEmails', 'lastPaymentEmail']);
      if (result.userEmails) {
        savedEmails.push(...result.userEmails);
      }
      if (result.lastPaymentEmail) {
        savedEmails.push(result.lastPaymentEmail);
      }
    } catch (storageError) {
      console.log('Secure: 스토리지에서 이메일 가져오기 실패:', storageError);
    }

    // 3. 확인할 이메일 목록 생성 (중복 제거)
    const emailsToCheck = [...new Set([chromeEmail, ...savedEmails].filter(Boolean))];
    console.log('Secure: 라이선스 확인할 이메일 목록:', emailsToCheck);

    if (emailsToCheck.length === 0) {
      console.log('Secure: 확인할 이메일이 없습니다.');
      return false;
    }

    // 4. 라이선스 확인
    const license = await checkMultipleEmailsForLicenseSecure(emailsToCheck);
    
    if (license) {
      // 5. 라이선스 발견 시 Background에 프리미엄 활성화 요청
      const activationResult = await sendMessageToBackground('activatePremium', {
        licenseKey: license.licenseKey,
        userEmail: license.userEmail
      });
      
      if (activationResult.success) {
        console.log('✅ Secure: 자동 라이선스 활성화 성공!');
        return true;
      } else {
        console.error('❌ Secure: 프리미엄 활성화 실패:', activationResult.error);
        return false;
      }
    } else {
      console.log('❌ Secure: 자동 라이선스 활성화 실패 - 라이선스 없음');
      return false;
    }

  } catch (error) {
    console.error('Secure: 자동 라이선스 활성화 오류:', error);
    return false;
  }
}

/**
 * 결제 시 라이선스 발급 요청 (Background 경유)
 * @param {Object} paymentData - 결제 정보
 * @returns {Promise<Object>} 라이선스 발급 결과
 */
async function issueLicenseSecure(paymentData) {
  try {
    console.log('Secure: 라이선스 발급 요청 (Background 경유):', paymentData);
    
    const response = await sendMessageToBackground('issueLicense', paymentData);
    
    if (response.success) {
      console.log('Secure: 라이선스 발급 성공:', response.licenseKey);
      
      // 결제한 이메일 저장
      if (paymentData.userEmail) {
        await savePaymentEmailSecure(paymentData.userEmail);
      }
    }
    
    return response;

  } catch (error) {
    console.error('Secure: 라이선스 발급 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 결제 설정 정보 요청 (Background 경유)
 * @param {string} provider - 결제 제공업체 ('paypal' 또는 'toss')
 * @returns {Promise<Object>} 결제 설정 정보
 */
async function getPaymentConfigSecure(provider) {
  try {
    console.log('Secure: 결제 설정 요청 (Background 경유):', provider);
    
    const response = await sendMessageToBackground('getPaymentConfig', { provider });
    
    if (response.success) {
      console.log('Secure: 결제 설정 수신 완료');
      return response.config;
    } else {
      console.error('Secure: 결제 설정 요청 실패:', response.error);
      return null;
    }

  } catch (error) {
    console.error('Secure: 결제 설정 요청 오류:', error);
    return null;
  }
}

/**
 * 결제한 이메일을 저장하는 함수 (자동 라이선스 확인용)
 * @param {string} email - 저장할 이메일
 */
async function savePaymentEmailSecure(email) {
  try {
    if (!email) return;
    
    console.log('Secure: 결제 이메일 저장:', email);
    
    // Chrome storage에 저장
    const result = await chrome.storage.local.get(['userEmails']);
    const existingEmails = result.userEmails || [];
    
    // 중복 제거하고 최신 이메일을 앞으로
    const updatedEmails = [email, ...existingEmails.filter(e => e !== email)].slice(0, 5); // 최대 5개까지 저장
    
    await chrome.storage.local.set({
      'userEmails': updatedEmails,
      'lastPaymentEmail': email
    });
    
    console.log('Secure: 결제 이메일 저장 완료:', updatedEmails);
    
  } catch (error) {
    console.error('Secure: 결제 이메일 저장 실패:', error);
  }
}

/**
 * 수동 라이선스 확인 (사용자가 버튼 클릭 시)
 * @returns {Promise<boolean>} 성공 여부
 */
async function manualLicenseCheckSecure() {
  try {
    console.log('Secure: 수동 라이선스 확인 시작...');
    
    const success = await autoActivateLicenseFromSupabaseSecure();
    
    if (success) {
      alert('✅ 라이선스가 자동으로 활성화되었습니다!');
      
      // UI 새로고침
      if (typeof location !== 'undefined') {
        location.reload();
      }
    } else {
      alert('❌ 등록된 라이선스를 찾을 수 없습니다.\n수동으로 라이선스 키를 입력해주세요.');
    }
    
    return success;
    
  } catch (error) {
    console.error('Secure: 수동 라이선스 확인 오류:', error);
    alert('라이선스 확인 중 오류가 발생했습니다.');
    return false;
  }
}

/**
 * 라이선스 상태를 정기적으로 확인하는 함수
 * @param {number} intervalMinutes - 확인 간격 (분 단위, 기본값: 60분)
 */
function startLicenseMonitoringSecure(intervalMinutes = 60) {
  const intervalMs = intervalMinutes * 60 * 1000;
  
  console.log(`Secure: 라이선스 모니터링 시작 (${intervalMinutes}분 간격)`);
  
  // 즉시 한 번 실행
  autoActivateLicenseFromSupabaseSecure();
  
  // 주기적 실행
  setInterval(() => {
    console.log('Secure: 주기적 라이선스 확인 실행...');
    autoActivateLicenseFromSupabaseSecure();
  }, intervalMs);
}

>>>>>>> bc75f37e76227019e91025937dba237d8cc4d672
console.log('Secure: 보안 라이선스 매니저 로드 완료'); 