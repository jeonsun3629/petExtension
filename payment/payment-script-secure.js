// payment-script-secure.js - 보안 결제 페이지 스크립트 (API 키 없음)
// Background Script를 통한 안전한 결제 처리

// PayPal SDK 동적 로딩
async function loadPayPalSDK(clientId) {
    return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (window.paypal) {
            resolve(window.paypal);
            return;
        }
        
        // PayPal SDK 스크립트 동적 로딩
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
        script.onload = () => {
            console.log('PayPal SDK 로드 완료');
            resolve(window.paypal);
        };
        script.onerror = () => {
            reject(new Error('PayPal SDK 로드 실패'));
        };
        document.head.appendChild(script);
    });
}

// PayPal 결제 처리
async function processPayPalPaymentSecure() {
    try {
        console.log('PayPal 결제 시작 (보안 모드)...');
        showPaymentProgress('PayPal 결제창을 준비하는 중...');
        
        // Background에서 PayPal 설정 가져오기
        const paypalConfig = await getPaymentConfigSecure('paypal');
        if (!paypalConfig || !paypalConfig.clientId) {
            throw new Error('PayPal 설정을 가져올 수 없습니다.');
        }
        
        // PayPal SDK 로드
        const paypal = await loadPayPalSDK(paypalConfig.clientId);
        
        // PayPal 버튼 컨테이너 생성
        const paymentSection = document.getElementById('paymentSection');
        paymentSection.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3>PayPal로 결제하기</h3>
                <p style="margin: 20px 0; font-size: 18px; font-weight: bold;">프리미엄 라이선스 - $2.99</p>
                <div id="paypal-button-container" style="max-width: 400px; margin: 0 auto;"></div>
            </div>
        `;
        
        // PayPal 버튼 렌더링
        paypal.Buttons({
            style: {
                color: 'blue',
                shape: 'rect',
                label: 'pay'
            },
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: '2.99',
                            currency_code: 'USD'
                        },
                        description: 'Pixel Cat Extension Premium License'
                    }]
                });
            },
            onApprove: async function(data, actions) {
                try {
                    showPaymentProgress('결제 완료를 확인하는 중...');
                    
                    // Chrome 로그인 이메일 확인 후 사용자 이메일 결정
                    let userEmail = await getChromeUserEmail();
                    if (!userEmail) {
                        userEmail = prompt('라이선스를 등록할 이메일을 입력해주세요:') || 'user@example.com';
                    } else {
                        console.log('Chrome 로그인 이메일 자동 사용:', userEmail);
                    }
                    
                    // Background를 통해 라이선스 발급 요청
                    const result = await issueLicenseSecure({
                        paymentProvider: 'paypal',
                        paymentId: data.orderID,
                        userEmail: userEmail,
                        amount: 2.99
                    });
                    
                    if (result.success) {
                        handlePaymentSuccess(result.licenseKey);
                    } else {
                        throw new Error(result.error || '라이선스 발급에 실패했습니다.');
                    }
                    
                } catch (error) {
                    console.error('PayPal 결제 후 처리 실패:', error);
                    alert('결제는 완료되었지만 라이선스 발급 중 오류가 발생했습니다. 고객 지원에 문의해주세요.');
                }
            },
            onError: function(err) {
                console.error('PayPal 결제 오류:', err);
                alert('PayPal 결제 중 오류가 발생했습니다. 다시 시도해주세요.');
            },
            onCancel: function(data) {
                console.log('PayPal 결제 취소:', data);
                location.reload(); // 페이지 새로고침
            }
        }).render('#paypal-button-container');
        
    } catch (error) {
        console.error('PayPal 결제 실패:', error);
        alert('PayPal 결제 시스템 연결에 실패했습니다.');
    }
}

// 토스 SDK 동적 로딩
async function loadTossSDK() {
    return new Promise((resolve, reject) => {
        // 이미 로드된 경우
        if (window.TossPayments) {
            resolve(window.TossPayments);
            return;
        }
        
        // 토스 SDK 스크립트 동적 로딩
        const script = document.createElement('script');
        script.src = 'https://js.tosspayments.com/v2';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            console.log('토스 SDK 로드 완료');
            // 약간의 지연 후 확인 (SDK 초기화 시간 고려)
            setTimeout(() => {
                if (window.TossPayments) {
                    resolve(window.TossPayments);
                } else {
                    reject(new Error('토스 SDK 초기화 실패'));
                }
            }, 100);
        };
        
        script.onerror = () => {
            reject(new Error('토스 SDK 로드 실패'));
        };
        
        document.head.appendChild(script);
    });
}

// 토스 결제 처리
async function processTossPaymentSecure() {
    try {
        console.log('토스 결제 시작 (보안 모드)...');
        showPaymentProgress('토스 결제창을 준비하는 중...');
        
        // Background에서 토스 설정 가져오기
        const tossConfig = await getPaymentConfigSecure('toss');
        if (!tossConfig || !tossConfig.clientKey) {
            throw new Error('토스 설정을 가져올 수 없습니다.');
        }
        
        // 토스 SDK 로드
        const TossPayments = await loadTossSDK();
        
        // Chrome 로그인 이메일 확인 후 사용자 이메일 입력 받기
        let userEmail = await getChromeUserEmail();
        if (!userEmail) {
            userEmail = prompt('라이선스를 등록할 이메일을 입력해주세요:');
            if (!userEmail) {
                alert('이메일을 입력해야 결제를 진행할 수 있습니다.');
                location.reload();
                return;
            }
        } else {
            console.log('Chrome 로그인 이메일 자동 사용:', userEmail);
            // 사용자에게 확인 받기 (선택사항)
            const confirmEmail = confirm(`Chrome 로그인 계정(${userEmail})으로 라이선스를 등록하시겠습니까?`);
            if (!confirmEmail) {
                userEmail = prompt('다른 이메일을 입력해주세요:');
                if (!userEmail) {
                    alert('이메일을 입력해야 결제를 진행할 수 있습니다.');
                    location.reload();
                    return;
                }
            }
        }
        
        // TossPayments 객체 생성
        const tossPayments = TossPayments(tossConfig.clientKey);
        
        // 결제 데이터 설정
        const paymentData = {
            amount: 2990, // 원 단위 (2.99 USD ≈ 2,990원)
            orderId: 'PIXELCAT_' + new Date().getTime(), // 고유 주문 ID
            orderName: 'Pixel Cat Extension Premium License',
            customerName: userEmail.split('@')[0],
            customerEmail: userEmail,
            successUrl: window.location.origin + window.location.pathname + '?success=toss',
            failUrl: window.location.origin + window.location.pathname + '?fail=toss'
        };
        
        console.log('토스 결제 데이터:', paymentData);
        
        // 결제창 호출
        const payment = tossPayments.requestPayment('카드', paymentData);
        
        payment.then(async function(result) {
            try {
                showPaymentProgress('결제 완료를 확인하는 중...');
                
                // Background를 통해 라이선스 발급 요청
                const response = await issueLicenseSecure({
                    paymentProvider: 'toss',
                    paymentId: result.paymentKey,
                    userEmail: userEmail,
                    amount: 2.99
                });
                
                if (response.success) {
                    handlePaymentSuccess(response.licenseKey);
                } else {
                    throw new Error(response.error || '라이선스 발급에 실패했습니다.');
                }
                
            } catch (error) {
                console.error('토스 결제 후 처리 실패:', error);
                alert('결제는 완료되었지만 라이선스 발급 중 오류가 발생했습니다. 고객 지원에 문의해주세요.');
            }
        }).catch(function(error) {
            if (error.code === 'USER_CANCEL') {
                console.log('토스 결제 취소:', error);
                location.reload(); // 페이지 새로고침
            } else {
                console.error('토스 결제 오류:', error);
                alert('토스 결제 중 오류가 발생했습니다: ' + error.message);
            }
        });
        
    } catch (error) {
        console.error('토스 결제 실패:', error);
        alert('토스 결제 시스템 연결에 실패했습니다.');
    }
}

// 결제 진행 상태 표시
function showPaymentProgress(message) {
    const paymentSection = document.getElementById('paymentSection');
    paymentSection.innerHTML = `
        <div style="padding: 40px; text-align: center;">
            <div class="activating" style="font-size: 48px; margin-bottom: 20px;">⏳</div>
            <h3>${message}</h3>
            <p style="margin-top: 10px; opacity: 0.8;">잠시만 기다려주세요...</p>
        </div>
    `;
}

// 결제 성공 처리
function handlePaymentSuccess(licenseKey) {
    console.log('결제 성공! 라이센스 키:', licenseKey);
    
    // UI 업데이트
    document.getElementById('paymentSection').style.display = 'none';
    document.getElementById('successSection').style.display = 'block';
    document.getElementById('licenseCode').textContent = licenseKey;
    
    // 확장 프로그램에 자동 활성화 메시지 전송
    activateExtensionPremiumSecure(licenseKey);
}

// 확장 프로그램에 프리미엄 활성화 메시지 전송 (보안 버전)
async function activateExtensionPremiumSecure(licenseKey) {
    try {
        const statusDiv = document.getElementById('activationStatus');
        statusDiv.textContent = '라이센스 키 저장 중...';
        
        // Chrome storage에 라이센스 키 저장
        try {
            await chrome.storage.local.set({
                'pixelcat_premium_license': licenseKey,
                'pixelcat_premium_activated': Date.now().toString(),
                'isPremium': true,
                'premiumActivatedBy': 'payment-secure'
            });
            
            statusDiv.textContent = '✅ 라이센스 키가 저장되었습니다! 확장 프로그램 팝업을 열어서 확인해주세요.';
            statusDiv.style.color = '#22c55e';
            
            console.log('라이센스 키 저장 완료:', licenseKey);
            
            // Background에 프리미엄 활성화 메시지 전송
            try {
                chrome.runtime.sendMessage({
                    action: 'activatePremium',
                    data: { licenseKey: licenseKey }
                }, (response) => {
                    if (!chrome.runtime.lastError && response && response.success) {
                        statusDiv.textContent = '✅ 자동 활성화 성공!';
                        console.log('확장 프로그램 자동 활성화 성공');
                    }
                });
            } catch (messageError) {
                console.log('Background 메시지 전송 실패:', messageError);
            }
            
        } catch (storageError) {
            console.error('Chrome storage 저장 실패:', storageError);
            statusDiv.textContent = '❌ 저장 실패 - 수동으로 라이센스 키를 입력해주세요.';
            statusDiv.style.color = '#ff6b6b';
        }
        
    } catch (error) {
        console.error('라이센스 키 처리 실패:', error);
        document.getElementById('activationStatus').textContent = '처리 실패 - 수동으로 라이센스 키를 입력해주세요.';
    }
}

// 라이센스 키 복사
function copyLicenseKey() {
    const licenseCode = document.getElementById('licenseCode').textContent;
    navigator.clipboard.writeText(licenseCode).then(() => {
        alert('라이센스 키가 클립보드에 복사되었습니다!');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    });
}

// 뒤로가기
function goBack() {
    window.close();
}

// 랜덤 ID 생성
function generateRandomId() {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
}

// DOM 로드 완료 후 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', async () => {
    console.log('보안 결제 페이지 로드됨');
    
    // PayPal 설정이 로드될 때까지 대기
    try {
        const paypalConfig = await getPaymentConfigSecure('paypal');
        console.log('PayPal 설정 로드 완료');
    } catch (error) {
        console.error('PayPal 설정 로드 실패:', error);
    }
    
    // 이벤트 리스너 추가 (onclick 대신 addEventListener 사용)
    const paypalBtn = document.querySelector('.paypal-btn');
    const tossBtn = document.querySelector('.toss-btn');
    const backBtn = document.querySelector('.back-btn');
    const copyBtn = document.querySelector('.copy-btn');
    
    if (paypalBtn) {
        paypalBtn.addEventListener('click', processPayPalPaymentSecure);
    }
    
    if (tossBtn) {
        tossBtn.addEventListener('click', processTossPaymentSecure);
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }
    
    if (copyBtn) {
        copyBtn.addEventListener('click', copyLicenseKey);
    }
    
    // URL 파라미터에서 결제 방법 확인
    const urlParams = new URLSearchParams(window.location.search);
    const paymentMethod = urlParams.get('method');
    
    if (paymentMethod === 'paypal') {
        processPayPalPaymentSecure();
    } else if (paymentMethod === 'toss') {
        processTossPaymentSecure();
    }
}); 