// popup-secure.js - 픽셀 고양이 컨트롤 패널 (보안 버전)
// Background Script를 통한 안전한 라이선스 관리

// 중복 초기화 방지
let catControllerInitialized = false;

class CatController {
  constructor() {
    this.catActiveToggle = document.getElementById('catActiveToggle');
    this.followMouseToggle = document.getElementById('followMouseToggle');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedValue = document.getElementById('speedValue');
    this.modeStatus = document.getElementById('modeStatus');
    this.versionElement = document.getElementById('version');
    this.yellowSkin = document.getElementById('yellowSkin');
    this.greySkin = document.getElementById('greySkin');
    this.calicoSkin = document.getElementById('calicoSkin');
    this.greyDogSkin = document.getElementById('greyDogSkin');
    this.blackDogSkin = document.getElementById('blackDogSkin');
    this.yellowDogSkin = document.getElementById('yellowDogSkin');
    this.sizeSlider = document.getElementById('sizeSlider');
    this.sizeValue = document.getElementById('sizeValue');
    this.premiumModal = null;
    
    // DOM 요소들이 모두 로드되었는지 확인
    if (!this.catActiveToggle || !this.followMouseToggle || !this.speedSlider || !this.speedValue || !this.modeStatus || !this.sizeSlider || !this.sizeValue) {
      console.error('❌ 필수 DOM 요소들이 로드되지 않았습니다');
      return;
    }
    
    this.init();
  }

  async init() {
    console.log('🎮 고양이 컨트롤러 초기화 (보안 모드)');
    
    // i18n 텍스트 로드
    this.loadI18nText();
    
    // Chrome 사용자 정보 표시
    await this.displayChromeUserInfo();
    
    // manifest.json에서 버전 정보 가져오기
    this.updateVersion();
    
    // 저장된 설정 로드
    await this.loadSettings();
    
    // 프리미엄 상태 확인
    await this.checkPremiumStatus();
    
    // Supabase에서 자동 라이선스 확인 (보안 모드)
    await this.checkSupabaseLicenseSecure();
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
    
    // 초기 UI 업데이트
    this.updateUI();
    
    // 입장 애니메이션
    setTimeout(() => this.playEntranceAnimation(), 100);
  }

  loadI18nText() {
    try {
      document.getElementById('extensionTitle').textContent = chrome.i18n.getMessage('extensionName') || '픽셀 고양이';
      document.getElementById('welcomeMessage').textContent = chrome.i18n.getMessage('welcomeMessage') || '귀여운 픽셀 고양이가 웹페이지를 돌아다닙니다!';
      document.getElementById('catActivationLabel').textContent = chrome.i18n.getMessage('catActivation') || '고양이 활성화';
      document.getElementById('catFollowLabel').textContent = chrome.i18n.getMessage('followMouse') || '마우스 따라가기';
      document.getElementById('catSpeedLabel').textContent = chrome.i18n.getMessage('moveSpeed') || '이동 속도';
      document.getElementById('catSizeLabel').textContent = chrome.i18n.getMessage('catSize') || '크기 설정';
      document.getElementById('catSkinLabel').textContent = chrome.i18n.getMessage('catSkin') || '스킨 선택';
    } catch (error) {
      console.warn('⚠️ i18n 메시지 로드 실패:', error);
    }
  }

  updateVersion() {
    try {
      const manifest = chrome.runtime.getManifest();
      if (this.versionElement && manifest.version) {
        this.versionElement.textContent = `v${manifest.version}`;
      }
    } catch (error) {
      console.warn('⚠️ 버전 정보 업데이트 실패:', error);
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['catActive', 'followMouse', 'catSpeed', 'catSkin', 'catSize']);
      
      this.catActiveToggle.checked = result.catActive !== false;
      this.followMouseToggle.checked = result.followMouse === true;
      this.speedSlider.value = result.catSpeed || 1;
      this.sizeSlider.value = result.catSize || 32;
      
      this.updateSpeedIndicator(result.catSpeed || 1);
      this.sizeValue.textContent = `${result.catSize || 32}px`;
      this.updateSkinSelection(result.catSkin || 'yellow');
      
      console.log('✅ 설정 로드 완료');
    } catch (error) {
      console.error('❌ 설정 로드 실패:', error);
    }
  }

  async saveSettings() {
    try {
      const settings = {
        catActive: this.catActiveToggle.checked,
        followMouse: this.followMouseToggle.checked,
        catSpeed: parseFloat(this.speedSlider.value),
        catSkin: this.getSelectedSkin(),
        catSize: parseInt(this.sizeSlider.value)
      };

      await chrome.storage.local.set(settings);
      
      // 모든 탭에 설정 변경 메시지 전송
      try {
        const tabs = await chrome.tabs.query({});
        const message = {
          action: 'updateSettings',
          settings: settings
        };
        
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // content script가 없는 탭에서는 오류 무시
          });
        });
      } catch (tabError) {
        console.log('일부 탭에 메시지 전송 실패 (정상)');
      }
      
      console.log('✅ 설정 저장 및 전송 완료:', settings);
      this.showSaveConfirmation();
    } catch (error) {
      console.error('❌ 설정 저장 실패:', error);
    }
  }

  setupEventListeners() {
    // 토글 스위치 이벤트
    this.catActiveToggle.addEventListener('change', () => {
      this.updateUI();
      this.saveSettings();
      this.playToggleAnimation();
    });

    this.followMouseToggle.addEventListener('change', () => {
      this.updateUI();
      this.saveSettings();
    });

    // 슬라이더 이벤트
    this.speedSlider.addEventListener('input', () => {
      const speed = parseFloat(this.speedSlider.value);
      this.updateSpeedIndicator(speed);
      this.updateUI();
      this.saveSettings();
    });

    this.sizeSlider.addEventListener('input', () => {
      const size = parseInt(this.sizeSlider.value);
      this.sizeValue.textContent = `${size}px`;
      this.saveSettings();
    });

    // 스킨 선택 이벤트
    [this.yellowSkin, this.greySkin, this.calicoSkin].forEach(skinElement => {
      if (skinElement) {
        skinElement.addEventListener('click', () => {
          const skinType = skinElement.dataset.skin;
          this.selectSkin(skinType);
        });
      }
    });

    // 프리미엄 스킨 클릭 이벤트
    [this.greyDogSkin, this.blackDogSkin, this.yellowDogSkin].forEach(premiumSkinElement => {
      if (premiumSkinElement) {
        premiumSkinElement.addEventListener('click', () => {
          const skinType = premiumSkinElement.dataset.skin;
          this.handlePremiumSkinClick(skinType);
        });
      }
    });
  }

  updateUI = () => {
    const isActive = this.catActiveToggle.checked;
    const followMouse = this.followMouseToggle.checked;
    
    // 모드 상태 업데이트
    if (isActive) {
      if (followMouse) {
        this.modeStatus.textContent = chrome.i18n.getMessage('followingMouseStatus') || '🎯 마우스 따라가기';
        this.modeStatus.className = 'mode-status follow-mode';
      } else {
        this.modeStatus.textContent = chrome.i18n.getMessage('freeRoamingStatus') || '🚶‍♂️ 자유롭게 돌아다니기';
        this.modeStatus.className = 'mode-status free-mode';
      }
    } else {
      this.modeStatus.textContent = chrome.i18n.getMessage('catInactiveStatus') || '😴 고양이 휴식중';
      this.modeStatus.className = 'mode-status inactive-mode';
    }
    
    // 비활성화 시 컨트롤 흐리게
    const controlGroups = document.querySelectorAll('.control-group:not(:first-child)');
    controlGroups.forEach(group => {
      group.style.opacity = isActive ? '1' : '0.6';
      group.style.pointerEvents = isActive ? 'auto' : 'none';
    });
  }

  updateSpeedIndicator = (speed) => {
    const speedEmojis = ['🐌', '🚶‍♂️', '🏃‍♂️', '💨', '⚡'];
    const emojiIndex = Math.min(Math.floor(speed * 2), speedEmojis.length - 1);
    this.speedValue.textContent = `${speedEmojis[emojiIndex]} ${speed.toFixed(1)}x`;
  }

  selectSkin = (skinType) => {
    this.updateSkinSelection(skinType);
    this.saveSettings();
  }

  getSelectedSkin() {
    const selectedSkin = document.querySelector('.skin-option.selected');
    return selectedSkin ? selectedSkin.dataset.skin : 'yellow';
  }

  updateSkinSelection = (skinType) => {
    // 모든 스킨에서 selected 클래스 제거
    document.querySelectorAll('.skin-option').forEach(skin => {
      skin.classList.remove('selected');
    });
    
    // 선택된 스킨에 selected 클래스 추가
    const selectedSkinElement = document.querySelector(`[data-skin="${skinType}"]`);
    if (selectedSkinElement) {
      selectedSkinElement.classList.add('selected');
    }
  }

  playEntranceAnimation() {
    const container = document.querySelector('.container');
    if (container) {
      container.style.transform = 'translateY(20px)';
      container.style.opacity = '0';
      container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        container.style.transform = 'translateY(0)';
        container.style.opacity = '1';
      }, 50);
    }
  }

  playToggleAnimation() {
    const modeStatus = this.modeStatus;
    modeStatus.style.transform = 'scale(1.05)';
    setTimeout(() => {
      modeStatus.style.transform = 'scale(1)';
    }, 150);
  }

  showSaveConfirmation() {
    const message = document.createElement('div');
    message.className = 'save-confirmation';
    message.innerHTML = chrome.i18n.getMessage('saved') || '✅ 설정이 저장되었습니다!';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 2000);
  }

  async checkPremiumStatus() {
    try {
      const result = await chrome.storage.local.get(['isPremium', 'pixelcat_premium_license']);
      const isPremium = result.isPremium || false;
      
      if (isPremium) {
        console.log('✅ 프리미엄 활성화됨');
        this.unlockPremiumSkins();
      } else {
        console.log('ℹ️ 무료 버전 사용중');
      }
    } catch (error) {
      console.error('프리미엄 상태 확인 실패:', error);
    }
  }

  async handlePremiumSkinClick(skinType) {
    const result = await chrome.storage.local.get(['isPremium']);
    if (result.isPremium) {
      this.selectSkin(skinType);
    } else {
      this.showPremiumModal(skinType);
    }
  }

  showPremiumModal(skinType) {
    // 기존 모달이 있으면 제거
    if (this.premiumModal) {
      this.premiumModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'premium-modal';
    modal.innerHTML = `
      <div class="premium-content">
        <h2>🌟 프리미엄 스킨</h2>
        <p>이 스킨은 프리미엄 버전에서만 사용할 수 있습니다.</p>
        <div class="premium-price">₩3,000</div>
        <p>모든 프리미엄 스킨을 평생 사용하세요!</p>
        <div style="margin: 20px 0;">
          <button class="premium-button" id="paypalBtn">
            💳 PayPal로 결제
          </button>
          <button class="premium-button" id="tossBtn">
            💳 토스로 결제
          </button>
        </div>
        <div style="margin: 15px 0;">
          <button class="premium-button secondary" id="autoCheckBtn" style="background: linear-gradient(45deg, #10b981, #34d399); color: white;">
            🔄 자동 라이센스 확인
          </button>
          <button class="premium-button secondary" id="licenseBtn">
            🔑 라이센스 입력
          </button>
          <button class="premium-button secondary" id="closeBtn">
            닫기
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.premiumModal = modal;
    
    // 이벤트 리스너 추가
    modal.querySelector('#paypalBtn').addEventListener('click', () => this.openPaymentPage('paypal'));
    modal.querySelector('#tossBtn').addEventListener('click', () => this.openPaymentPage('toss'));
    modal.querySelector('#autoCheckBtn').addEventListener('click', () => this.checkSupabaseLicenseManualSecure());
    modal.querySelector('#licenseBtn').addEventListener('click', () => this.showLicenseInput());
    modal.querySelector('#closeBtn').addEventListener('click', () => this.closePremiumModal());
    
    // 모달 외부 클릭 시 닫기
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closePremiumModal();
      }
    });
  }

  openPaymentPage(paymentMethod) {
    const paymentUrl = `https://jeonsun3629.github.io/petExtension/payment.html?method=${paymentMethod}`;
    chrome.tabs.create({ url: paymentUrl });
    this.closePremiumModal();
  }

  showLicenseInput() {
    const licenseKey = prompt('라이센스 키를 입력해주세요:');
    if (licenseKey) {
      this.activateLicense(licenseKey);
    }
  }

  async activateLicense(licenseKey) {
    try {
      console.log('라이센스 활성화 시도:', licenseKey);
      
      // 간단한 라이센스 키 검증 (실제로는 서버에서 검증해야 함)
      const isValid = await this.verifyLicenseKey(licenseKey);
      
      if (isValid) {
        await chrome.storage.local.set({
          'isPremium': true,
          'pixelcat_premium_license': licenseKey,
          'pixelcat_premium_activated': Date.now().toString()
        });
        
        this.unlockPremiumSkins();
        this.showPremiumActivatedMessage();
        this.closePremiumModal();
        
        console.log('✅ 라이센스 활성화 성공!');
      } else {
        alert('❌ 유효하지 않은 라이센스 키입니다.');
      }
    } catch (error) {
      console.error('라이센스 활성화 실패:', error);
      alert('라이센스 활성화 중 오류가 발생했습니다.');
    }
  }

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

  unlockPremiumSkins() {
    document.querySelectorAll('.skin-option.premium').forEach(skinElement => {
      skinElement.classList.add('unlocked');
      skinElement.classList.remove('locked');
      skinElement.style.filter = 'none';
      skinElement.style.opacity = '1';
    });
  }

  closePremiumModal() {
    if (this.premiumModal) {
      this.premiumModal.remove();
      this.premiumModal = null;
    }
  }

  showPremiumActivatedMessage() {
    const message = document.createElement('div');
    message.className = 'save-confirmation';
    message.innerHTML = '🎉 프리미엄 스킨 활성화됨!';
    message.style.background = 'linear-gradient(45deg, #ffd700, #ffed4e)';
    message.style.color = '#333';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 3000);
  }

  // Supabase에서 자동 라이선스 확인 (보안 모드)
  async checkSupabaseLicenseSecure() {
    try {
      console.log('🔍 Supabase 자동 라이선스 확인 시작 (보안 모드)...');
      
      // 이미 프리미엄이 활성화되어 있는지 확인
      const result = await chrome.storage.local.get(['isPremium', 'premiumActivatedBy']);
      if (result.isPremium && (result.premiumActivatedBy === 'auto-background' || result.premiumActivatedBy === 'auto-supabase')) {
        console.log('✅ 이미 자동 활성화된 프리미엄 상태');
        return;
      }
      
      // 자동 라이선스 활성화 시도 (보안 모드)
      if (typeof autoActivateLicenseFromSupabaseSecure === 'function') {
        const success = await autoActivateLicenseFromSupabaseSecure();
        
        if (success) {
          console.log('🎉 Supabase 자동 라이선스 활성화 성공 (보안 모드)!');
          
          // UI 업데이트
          await this.checkPremiumStatus();
          this.showAutoActivationMessage();
          
          // 라이선스 모니터링 시작 (1시간 간격)
          if (typeof startLicenseMonitoringSecure === 'function') {
            startLicenseMonitoringSecure(60);
          }
        } else {
          console.log('ℹ️ Supabase에서 라이선스를 찾을 수 없음 (정상)');
        }
      } else {
        console.warn('autoActivateLicenseFromSupabaseSecure 함수를 찾을 수 없습니다.');
      }
      
    } catch (error) {
      console.error('Supabase 라이선스 확인 오류:', error);
    }
  }

  // 수동 Supabase 라이선스 확인 (보안 모드)
  async checkSupabaseLicenseManualSecure() {
    try {
      console.log('🔍 수동 Supabase 라이선스 확인 시작 (보안 모드)...');
      
      if (typeof manualLicenseCheckSecure === 'function') {
        const success = await manualLicenseCheckSecure();
        
        if (success) {
          // 프리미엄 모달 닫기
          this.closePremiumModal();
          
          // UI 업데이트
          await this.checkPremiumStatus();
          
          console.log('✅ 수동 라이선스 확인 성공!');
        }
      } else {
        console.warn('manualLicenseCheckSecure 함수를 찾을 수 없습니다.');
        alert('라이선스 확인 기능을 사용할 수 없습니다.');
      }
      
    } catch (error) {
      console.error('수동 라이선스 확인 오류:', error);
      alert('라이선스 확인 중 오류가 발생했습니다.');
    }
  }

  // 자동 활성화 메시지 표시
  showAutoActivationMessage() {
    const message = document.createElement('div');
    message.className = 'save-confirmation';
    message.innerHTML = '🔄 자동 라이선스 감지됨!';
    message.style.background = 'linear-gradient(45deg, #10b981, #34d399)';
    message.style.color = 'white';
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 3000);
  }

  // Chrome 사용자 정보 표시
  async displayChromeUserInfo() {
    try {
      const userInfoContainer = document.getElementById('chromeUserInfo');
      if (!userInfoContainer) {
        console.warn('chromeUserInfo 컨테이너를 찾을 수 없습니다.');
        return;
      }

      // Chrome Identity API를 사용하여 사용자 정보 가져오기
      if (chrome.identity && chrome.identity.getProfileUserInfo) {
        chrome.identity.getProfileUserInfo(
          { accountStatus: 'ANY' },
          (userInfo) => {
            if (chrome.runtime.lastError) {
              console.log('사용자 정보 가져오기 실패:', chrome.runtime.lastError.message);
              userInfoContainer.innerHTML = '';
              return;
            }

            if (userInfo && userInfo.email) {
              userInfoContainer.innerHTML = `
                <div style="
                  background: rgba(255,255,255,0.1); 
                  padding: 8px; 
                  border-radius: 5px; 
                  border: 1px solid rgba(255,255,255,0.2);
                  backdrop-filter: blur(10px);
                ">
                  <div style="display: flex; align-items: center; gap: 6px; justify-content: center;">
                    <span style="font-size: 12px;">👤</span>
                    <span style="font-size: 11px; font-weight: 500;">${userInfo.email}</span>
                  </div>
                  <div style="font-size: 9px; opacity: 0.8; margin-top: 2px;">Chrome 로그인 계정</div>
                </div>
              `;
              console.log('Chrome 사용자 정보 표시:', userInfo.email);
            } else {
              userInfoContainer.innerHTML = `
                <div style="
                  background: rgba(255,255,255,0.05); 
                  padding: 6px; 
                  border-radius: 5px; 
                  border: 1px solid rgba(255,255,255,0.1);
                ">
                  <div style="font-size: 10px; opacity: 0.7;">Chrome 로그인 없음</div>
                </div>
              `;
            }
          }
        );
      } else {
        console.warn('Chrome Identity API를 사용할 수 없습니다.');
        userInfoContainer.innerHTML = '';
      }
    } catch (error) {
      console.error('사용자 정보 표시 오류:', error);
    }
  }
}

// 안전한 초기화 함수
function initializeCatController() {
  if (catControllerInitialized) {
    console.log('⚠️ CatController 이미 초기화됨, 건너뛰기');
    return;
  }

  try {
    catControllerInitialized = true;
    console.log('🚀 CatController 초기화 시작 (보안 모드)');
    new CatController();
  } catch (error) {
    console.error('❌ CatController 초기화 실패:', error);
    catControllerInitialized = false; // 실패 시 재시도 가능하도록
  }
}

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM 로드 완료 (보안 모드)');
  setTimeout(initializeCatController, 100);
});

// 추가 안전장치
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  console.log('📄 이미 DOM 로드 완료 - 즉시 초기화');
  setTimeout(initializeCatController, 50);
} 