<<<<<<< HEAD
// user-info.js - Chrome 로그인 사용자 정보 가져오기

/**
 * Chrome에 로그인된 사용자의 이메일을 가져옵니다
 * @returns {Promise<string|null>} 사용자 이메일 또는 null
 */
async function getChromeUserEmail() {
    try {
        // Chrome Identity API를 사용하여 사용자 정보 가져오기
        return new Promise((resolve, reject) => {
            if (!chrome.identity) {
                console.warn('Chrome Identity API를 사용할 수 없습니다.');
                resolve(null);
                return;
            }

            // 프로필 정보 가져오기 (로그인 없이)
            chrome.identity.getProfileUserInfo(
                { accountStatus: 'ANY' },
                (userInfo) => {
                    if (chrome.runtime.lastError) {
                        console.error('사용자 정보 가져오기 실패:', chrome.runtime.lastError.message);
                        resolve(null);
                        return;
                    }

                    if (userInfo && userInfo.email) {
                        console.log('Chrome 로그인 사용자 이메일:', userInfo.email);
                        resolve(userInfo.email);
                    } else {
                        console.log('Chrome에 로그인된 사용자가 없습니다.');
                        resolve(null);
                    }
                }
            );
        });
    } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error);
        return null;
    }
}

/**
 * Chrome에 로그인된 사용자의 아이디(이메일 앞부분)를 가져옵니다
 * @returns {Promise<string|null>} 사용자 아이디 또는 null
 */
async function getChromeUserId() {
    try {
        const email = await getChromeUserEmail();
        if (email) {
            // 이메일에서 @ 앞부분만 추출
            return email.split('@')[0];
        }
        return null;
    } catch (error) {
        console.error('사용자 아이디 추출 오류:', error);
        return null;
    }
}

/**
 * 사용자 정보를 가져와서 입력 필드에 자동 설정
 * @param {string} emailInputId - 이메일 입력 필드의 ID
 * @param {boolean} showAlert - 정보를 가져왔을 때 알림 표시 여부
 */
async function autoFillUserEmail(emailInputId = 'userEmail', showAlert = true) {
    try {
        const email = await getChromeUserEmail();
        
        if (email) {
            const emailInput = document.getElementById(emailInputId);
            if (emailInput) {
                emailInput.value = email;
                emailInput.style.borderColor = '#22c55e'; // 초록색 테두리
                
                if (showAlert) {
                    console.log(`Chrome 로그인 이메일 자동 입력: ${email}`);
                }
                return email;
            } else {
                console.warn(`ID가 '${emailInputId}'인 입력 필드를 찾을 수 없습니다.`);
            }
        } else {
            if (showAlert) {
                console.log('Chrome에 로그인된 사용자가 없어 수동 입력이 필요합니다.');
            }
        }
        return null;
    } catch (error) {
        console.error('이메일 자동 입력 오류:', error);
        return null;
    }
}

/**
 * 사용자가 Chrome에 로그인되어 있는지 확인
 * @returns {Promise<boolean>} 로그인 여부
 */
async function isChromeUserLoggedIn() {
    try {
        const email = await getChromeUserEmail();
        return email !== null;
    } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        return false;
    }
}

/**
 * 사용자 정보를 UI에 표시
 * @param {string} containerId - 정보를 표시할 컨테이너의 ID
 */
async function displayUserInfo(containerId = 'userInfo') {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`ID가 '${containerId}'인 컨테이너를 찾을 수 없습니다.`);
            return;
        }

        const email = await getChromeUserEmail();
        
        if (email) {
            container.innerHTML = `
                <div style="padding: 10px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 5px; margin: 10px 0;">
                    <p style="margin: 0; color: #0369a1;">
                        <strong>Chrome 로그인 계정:</strong> ${email}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">
                        이 이메일이 자동으로 사용됩니다.
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="padding: 10px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; margin: 10px 0;">
                    <p style="margin: 0; color: #92400e;">
                        Chrome에 로그인된 계정이 없습니다. 수동으로 이메일을 입력해주세요.
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error('사용자 정보 표시 오류:', error);
    }
=======
// user-info.js - Chrome 로그인 사용자 정보 가져오기

/**
 * Chrome에 로그인된 사용자의 이메일을 가져옵니다
 * @returns {Promise<string|null>} 사용자 이메일 또는 null
 */
async function getChromeUserEmail() {
    try {
        // Chrome Identity API를 사용하여 사용자 정보 가져오기
        return new Promise((resolve, reject) => {
            if (!chrome.identity) {
                console.warn('Chrome Identity API를 사용할 수 없습니다.');
                resolve(null);
                return;
            }

            // 프로필 정보 가져오기 (로그인 없이)
            chrome.identity.getProfileUserInfo(
                { accountStatus: 'ANY' },
                (userInfo) => {
                    if (chrome.runtime.lastError) {
                        console.error('사용자 정보 가져오기 실패:', chrome.runtime.lastError.message);
                        resolve(null);
                        return;
                    }

                    if (userInfo && userInfo.email) {
                        console.log('Chrome 로그인 사용자 이메일:', userInfo.email);
                        resolve(userInfo.email);
                    } else {
                        console.log('Chrome에 로그인된 사용자가 없습니다.');
                        resolve(null);
                    }
                }
            );
        });
    } catch (error) {
        console.error('사용자 정보 가져오기 오류:', error);
        return null;
    }
}

/**
 * Chrome에 로그인된 사용자의 아이디(이메일 앞부분)를 가져옵니다
 * @returns {Promise<string|null>} 사용자 아이디 또는 null
 */
async function getChromeUserId() {
    try {
        const email = await getChromeUserEmail();
        if (email) {
            // 이메일에서 @ 앞부분만 추출
            return email.split('@')[0];
        }
        return null;
    } catch (error) {
        console.error('사용자 아이디 추출 오류:', error);
        return null;
    }
}

/**
 * 사용자 정보를 가져와서 입력 필드에 자동 설정
 * @param {string} emailInputId - 이메일 입력 필드의 ID
 * @param {boolean} showAlert - 정보를 가져왔을 때 알림 표시 여부
 */
async function autoFillUserEmail(emailInputId = 'userEmail', showAlert = true) {
    try {
        const email = await getChromeUserEmail();
        
        if (email) {
            const emailInput = document.getElementById(emailInputId);
            if (emailInput) {
                emailInput.value = email;
                emailInput.style.borderColor = '#22c55e'; // 초록색 테두리
                
                if (showAlert) {
                    console.log(`Chrome 로그인 이메일 자동 입력: ${email}`);
                }
                return email;
            } else {
                console.warn(`ID가 '${emailInputId}'인 입력 필드를 찾을 수 없습니다.`);
            }
        } else {
            if (showAlert) {
                console.log('Chrome에 로그인된 사용자가 없어 수동 입력이 필요합니다.');
            }
        }
        return null;
    } catch (error) {
        console.error('이메일 자동 입력 오류:', error);
        return null;
    }
}

/**
 * 사용자가 Chrome에 로그인되어 있는지 확인
 * @returns {Promise<boolean>} 로그인 여부
 */
async function isChromeUserLoggedIn() {
    try {
        const email = await getChromeUserEmail();
        return email !== null;
    } catch (error) {
        console.error('로그인 상태 확인 오류:', error);
        return false;
    }
}

/**
 * 사용자 정보를 UI에 표시
 * @param {string} containerId - 정보를 표시할 컨테이너의 ID
 */
async function displayUserInfo(containerId = 'userInfo') {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`ID가 '${containerId}'인 컨테이너를 찾을 수 없습니다.`);
            return;
        }

        const email = await getChromeUserEmail();
        
        if (email) {
            container.innerHTML = `
                <div style="padding: 10px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 5px; margin: 10px 0;">
                    <p style="margin: 0; color: #0369a1;">
                        <strong>Chrome 로그인 계정:</strong> ${email}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #64748b;">
                        이 이메일이 자동으로 사용됩니다.
                    </p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div style="padding: 10px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; margin: 10px 0;">
                    <p style="margin: 0; color: #92400e;">
                        Chrome에 로그인된 계정이 없습니다. 수동으로 이메일을 입력해주세요.
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error('사용자 정보 표시 오류:', error);
    }
>>>>>>> bc75f37e76227019e91025937dba237d8cc4d672
} 