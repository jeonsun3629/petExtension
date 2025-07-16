// 픽셀 고양이 크롬 익스텐션 (스프라이트 버전)

// 스킨별 구성 정보 - 모듈식 확장 가능
const skinConfigs = {
  'yellow': {
    file: 'assets/skins/yellowCat.png',
    cols: 4, rows: 8,
    animations: ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom', 'lie', 'sleep'],
    fallbacks: {}
  },
  'grey': {
    file: 'assets/skins/greyCat.png', 
    cols: 4, rows: 8,
    animations: ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom', 'lie', 'sleep'],
    fallbacks: {}
  },
  'calico': {
    file: 'assets/skins/calicoCat.png',
    cols: 4, rows: 6,
    animations: ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom'],
    fallbacks: { 'lie': 'sit', 'sleep': 'sit-groom' }
  },
  // 프리미엄 스킨들
  'greyDog': {
    file: 'assets/skins/greyDog.PNG',
    cols: 4, rows: 8,
    animations: ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom', 'lie', 'sleep'],
    fallbacks: {}
  },
  'blackDog': {
    file: 'assets/skins/blackDog.PNG',
    cols: 4, rows: 8,
    animations: ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom', 'lie', 'sleep'],
    fallbacks: {}
  },
  'yellowDog': {
    file: 'assets/skins/yellowDog.PNG',
    cols: 4, rows: 8,
    animations: ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom', 'lie', 'sleep'],
    fallbacks: {}
  }
};

class PixelCat {
  constructor() {
    this.cat = null;
    this.isActive = true;
    this.catActive = true; // 고양이 활성화 상태
    this.currentBehavior = 'walk-right';
    this.behaviors = ['walk-front', 'walk-right', 'walk-back', 'walk-left', 'sit', 'sit-groom', 'lie', 'sleep'];
    this.walkBehaviors = ['walk-front', 'walk-right', 'walk-back', 'walk-left'];
    this.position = { x: 100, y: 100 };
    this.direction = 'right'; // front, left, back, right
    this.speed = 1;
    this.isRunning = false;
    this.behaviorTimer = null; // 타이머 ID 저장
    this.behaviorDuration = 3000;
    
    // 새로운 마우스 따라다니기 기능
    this.followMouse = false;
    this.mousePosition = { x: 0, y: 0 };
    this.lastMouseMove = Date.now();
    this.targetPosition = { x: 100, y: 100 };
    this.hasArrivedAtMouse = false;
    this.isIdleAtMouse = false;
    this.followMouseStarted = false;
    
    // 스킨 관리
    this.currentSkin = 'yellow';
    this.size = 32;
    
    console.log('🚀 픽셀 스프라이트 고양이가 시작되었습니다!');
    this.init();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['catActive', 'followMouse', 'catSpeed', 'catSkin', 'catSize']);
      this.catActive = result.catActive !== undefined ? result.catActive : true;
      this.followMouse = result.followMouse || false;
      this.speed = result.catSpeed || 1;
      this.currentSkin = result.catSkin || 'yellow';
      this.size = result.catSize || 32;
      console.log('⚙️ 설정 로드:', { catActive: this.catActive, followMouse: this.followMouse, speed: this.speed, skin: this.currentSkin, size: this.size });
    } catch (error) {
      console.log('⚙️ 기본 설정 사용');
    }
  }

  async init() {
    // 설정을 먼저 로드한 후 고양이 생성
    await this.loadSettings();
    
    this.createCat();
    this.setupMouseTracking();
    this.startAnimation();
    this.startBehaviorTimer();
    this.setupMessageListener();
  }

  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.lastMouseMove = Date.now();
      
      if (this.followMouse && this.catActive) {
        // 마우스의 왼쪽 위 포인트에 도착하도록 설정
        this.targetPosition.x = e.clientX - 17; // 마우스 포인터 왼쪽
        this.targetPosition.y = e.clientY - 20; // 마우스 포인터 위쪽
        
        // 마우스가 움직이면 도착 상태 리셋 및 걷기 모드로 전환
        if (this.hasArrivedAtMouse || this.isIdleAtMouse) {
          this.hasArrivedAtMouse = false;
          this.isIdleAtMouse = false;
          this.currentBehavior = 'walk-right';
          console.log('🐱 마우스가 움직여서 고양이가 다시 따라가기 시작!');
        }
        
        // 걷기 모드가 아니면 걷기로 전환
        if (!this.walkBehaviors.includes(this.currentBehavior)) {
          this.currentBehavior = 'walk-right';
        }
      }
    });
    
    console.log('🖱️ 마우스 추적 이벤트 리스너 설정 완료');
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateSettings') {
        const settings = request.settings || request;
        
        // 고양이 활성화/비활성화 처리
        if (typeof settings.catActive === 'boolean' && settings.catActive !== this.catActive) {
          this.catActive = settings.catActive;
          this.updateCatVisibility();
          console.log('🐱 고양이 활성화 상태 변경:', this.catActive);
        }
        
        // 마우스 따라다니기 설정
        if (typeof settings.followMouse === 'boolean') {
          this.followMouse = settings.followMouse;
          console.log('🎯 마우스 따라다니기 변경:', this.followMouse);
        }
        
        // 속도 설정
        if (typeof settings.catSpeed === 'number') {
          this.speed = settings.catSpeed;
          console.log('⚡ 속도 변경:', this.speed);
        }
        
        // 스킨이 변경되었는지 확인
        if (settings.catSkin && settings.catSkin !== this.currentSkin) {
          this.currentSkin = settings.catSkin;
          this.updateCatSkin();
          console.log('🎨 스킨 변경:', this.currentSkin);
        }
        
        // 크기 설정
        if (typeof settings.catSize === 'number' && settings.catSize !== this.size) {
          this.size = settings.catSize;
          this.updateCatSize();
          console.log('📏 크기 변경:', this.size);
        }
        
        console.log('📨 설정 업데이트:', settings);
        
        // 고양이가 활성화되어 있을 때만 행동 제어
        if (this.catActive) {
          // 설정이 변경되면 행동 초기화
          if (!this.followMouse) {
            // 자유 모드로 변경시 일반 행동 재개
            this.hasArrivedAtMouse = false;
            this.isIdleAtMouse = false;
            this.changeBehavior();
          } else {
            // 마우스 따라다니기 모드로 변경시 상태 리셋
            this.hasArrivedAtMouse = false;
            this.isIdleAtMouse = false;
            this.currentBehavior = 'walk-right';
            console.log('🎯 마우스 따라다니기 모드 활성화');
          }
        }
        
        sendResponse({ success: true });
      }
    });

    // 외부 메시지 수신 리스너 (결제 완료 시 자동 활성화)
    // content script에서는 onMessageExternal 대신 일반 onMessage 사용
    if (chrome.runtime && chrome.runtime.onMessage) {
      // 프리미엄 활성화 요청을 위한 추가 리스너
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'activatePremium' && request.licenseKey) {
          console.log('🔐 프리미엄 활성화 요청 수신:', request.licenseKey);
          
          this.handleExternalPremiumActivation(request.licenseKey)
            .then(() => {
              sendResponse({ success: true, message: '프리미엄 활성화 성공' });
            })
            .catch((error) => {
              console.error('❌ 프리미엄 활성화 실패:', error);
              sendResponse({ success: false, error: error.message });
            });
          
          // 비동기 응답을 위해 true 반환
          return true;
        }
      });
    }
  }

  // 외부에서 프리미엄 활성화 요청 처리
  async handleExternalPremiumActivation(licenseKey) {
    try {
      console.log('🔐 외부 라이센스 키 검증:', licenseKey);
      
      // 실제 서비스에서는 서버에 검증 요청을 보내야 함
      const isValid = await this.verifyLicenseKey(licenseKey);
      
      if (isValid) {
        await chrome.storage.sync.set({ premiumLicense: 'activated' });
        console.log('🎉 외부 요청으로 프리미엄 활성화 완료!');
        
        // 성공 알림 표시
        this.showPremiumActivationNotification();
      } else {
        throw new Error('유효하지 않은 라이센스 키');
      }
    } catch (error) {
      console.error('❌ 외부 프리미엄 활성화 처리 실패:', error);
      throw error;
    }
  }

  // 라이센스 키 검증 (보안 강화 - 서버 검증)
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

  // 프리미엄 활성화 알림 표시
  showPremiumActivationNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: linear-gradient(45deg, #ffd700, #ffed4e) !important;
      color: #333 !important;
      padding: 15px 20px !important;
      border-radius: 10px !important;
      font-family: Arial, sans-serif !important;
      font-size: 14px !important;
      font-weight: bold !important;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4) !important;
      z-index: 999999 !important;
      animation: slideInFromRight 0.5s ease !important;
    `;
    notification.innerHTML = '🎉 프리미엄 스킨이 활성화되었습니다!';
    
    // 애니메이션 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInFromRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 3초 후 제거
    setTimeout(() => {
      notification.style.animation = 'slideOutToRight 0.5s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 500);
    }, 3000);
  }

  createCat() {
    console.log('🐱 스프라이트 고양이를 생성 중입니다...');
    
    const existingCat = document.querySelector('.pixel-cat');
    if (existingCat) {
      existingCat.remove();
    }
    
    this.cat = document.createElement('div');
    this.cat.className = 'pixel-cat cat-walk-right';
    
    // CSS로 스타일 적용 (스프라이트용)
    const skinImage = this.getSkinImageUrl();
    const skinConfig = this.getSkinConfig();
    const scale = this.size / 32; // 32px 기준으로 스케일 계산
    const backgroundWidth = skinConfig.cols * 32; // 스프라이트 총 너비
    const backgroundHeight = skinConfig.rows * 32; // 스프라이트 총 높이
    
    this.cat.style.cssText = `
      position: fixed !important;
      left: ${this.position.x}px !important;
      top: ${this.position.y}px !important;
      width: 32px !important;
      height: 32px !important;
      z-index: 999999 !important;
      pointer-events: none !important;
      image-rendering: pixelated !important;
      image-rendering: -moz-crisp-edges !important;
      image-rendering: crisp-edges !important;
      background-image: url('${skinImage}') !important;
      background-size: ${backgroundWidth}px ${backgroundHeight}px !important;
      background-repeat: no-repeat !important;
      visibility: visible !important;
      opacity: 1 !important;
      transform: scale(${scale}) !important;
      transform-origin: top left !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      transition: left 0.2s linear, top 0.2s linear !important;
    `;
    
    document.body.appendChild(this.cat);
    
    // 스킨 적용 (CSS에서 제거했으므로 여기서 설정)
    this.updateCatSkin();
    
    // 초기 활성화 상태 반영
    this.updateCatVisibility();
    
    console.log('✅ 스프라이트 고양이가 생성되었습니다!', this.cat);
    console.log('📍 위치:', this.position);
    console.log('🎨 적용된 스킨:', this.currentSkin);
    console.log('📏 적용된 크기:', this.size, '(스케일:', scale + ')');
    console.log('🎭 스킨 구성:', skinConfig);
    
    setTimeout(() => {
      const catInDom = document.querySelector('.pixel-cat');
      console.log('🔍 1초 후 고양이 확인:', catInDom ? '✅ 발견됨' : '❌ 없음');
    }, 1000);
  }

  startAnimation() {
    const animate = () => {
      // 고양이가 생성되었고 전체적으로 활성화되어 있을 때만 애니메이션 실행
      if (this.cat && this.catActive) {
        if (this.followMouse) {
          this.followMouseTarget();
        } else if (this.walkBehaviors.includes(this.currentBehavior)) {
          this.walk();
        }
      }
      
      // 애니메이션 루프는 계속 실행 (중단되지 않도록)
      requestAnimationFrame(animate);
    };
    
    animate();
    console.log('🎬 애니메이션 루프 시작');
  }

  followMouseTarget() {
    const dx = this.targetPosition.x - this.position.x;
    const dy = this.targetPosition.y - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // 디버깅: 첫 번째 호출시에만 로그 출력
    if (!this.followMouseStarted) {
      this.followMouseStarted = true;
      console.log('🎯 마우스 따라다니기 시작!', {
        target: this.targetPosition,
        current: this.position,
        distance: distance.toFixed(2)
      });
    }
    
    // 마우스에 도착했는지 확인 (더 정확한 도착 판정)
    if (distance < 10) {
      if (!this.hasArrivedAtMouse) {
        this.hasArrivedAtMouse = true;
        console.log('🎯 고양이가 마우스에 도착했습니다!');
        
        // 도착하면 바로 앉기/자기 애니메이션 실행
        this.startIdleAtMouse();
      }
      return; // 도착했으면 더 이상 이동하지 않음
    }
    
    // 아직 도착하지 않았으면 계속 이동
    if (this.hasArrivedAtMouse) {
      this.hasArrivedAtMouse = false;
      this.isIdleAtMouse = false;
      this.followMouseStarted = false; // 다시 시작할 때 로그 출력하도록
    }
    
    // 목표 방향 계산
    const moveSpeed = this.speed;
    const ratio = moveSpeed / distance;
    
    // 위치 업데이트
    this.position.x += dx * ratio;
    this.position.y += dy * ratio;
    
    // 화면 경계 체크 (실제 표시되는 크기 고려)
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const actualSize = this.size; // 스케일이 적용된 실제 크기
    
    this.position.x = Math.max(0, Math.min(windowWidth - actualSize, this.position.x));
    this.position.y = Math.max(0, Math.min(windowHeight - actualSize, this.position.y));
    
    // 방향 결정 (8방향 중 가장 가까운 4방향으로 매핑)
    const angle = Math.atan2(dy, dx);
    const deg = (angle * 180 / Math.PI + 360) % 360;
    
    if (deg >= 315 || deg < 45) {
      this.direction = 'right';
    } else if (deg >= 45 && deg < 135) {
      this.direction = 'front';
    } else if (deg >= 135 && deg < 225) {
      this.direction = 'left';
    } else {
      this.direction = 'back';
    }
    
    this.updatePosition();
    this.updateAnimation();
  }

  startIdleAtMouse() {
    if (!this.isIdleAtMouse) {
      this.isIdleAtMouse = true;
      
      // 현재 스킨에서 사용 가능한 idle 애니메이션들
      const config = this.getSkinConfig();
      const availableIdleBehaviors = ['sit', 'sit-groom', 'sleep', 'lie'].filter(behavior => 
        config.animations.includes(behavior) || config.fallbacks[behavior]
      );
      
      // 사용 가능한 애니메이션이 없으면 기본적으로 sit 사용
      const targetBehaviors = availableIdleBehaviors.length > 0 ? availableIdleBehaviors : ['sit'];
      const newBehavior = targetBehaviors[Math.floor(Math.random() * targetBehaviors.length)];
      
      // 실제 사용할 애니메이션 결정 (fallback 적용)
      const actualBehavior = this.getActualAnimation(newBehavior);
      this.currentBehavior = actualBehavior;
      this.updateAnimation();
      
      const behaviorNames = {
        'sit': '앉기',
        'sit-groom': '앉아서 그루밍',
        'sleep': '자기',
        'lie': '누워있기'
      };
      
      const displayName = behaviorNames[actualBehavior] || actualBehavior;
      console.log(`😴 마우스에 도착해서 ${displayName} 중입니다! (요청: ${newBehavior}, 실제: ${actualBehavior})`);
    }
  }

  walk() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const actualSize = this.size; // 스케일이 적용된 실제 크기
    
    // 방향 전환 및 새로운 방향 설정
    if (this.position.x <= 0) {
      this.direction = Math.random() < 0.5 ? 'right' : (Math.random() < 0.5 ? 'front' : 'back');
      this.position.x = 0;
    } else if (this.position.x >= windowWidth - actualSize) {
      this.direction = Math.random() < 0.5 ? 'left' : (Math.random() < 0.5 ? 'front' : 'back');
      this.position.x = windowWidth - actualSize;
    }
    
    if (this.position.y <= 0) {
      this.direction = Math.random() < 0.5 ? 'front' : (Math.random() < 0.5 ? 'left' : 'right');
      this.position.y = 0;
    } else if (this.position.y >= windowHeight - actualSize) {
      this.direction = Math.random() < 0.5 ? 'back' : (Math.random() < 0.5 ? 'left' : 'right');
      this.position.y = windowHeight - actualSize;
    }
    
    // 현재 방향에 따라 이동
    const moveSpeed = this.isRunning ? this.speed * 2 : this.speed;
    
    switch (this.direction) {
      case 'front':
        this.position.y += moveSpeed;
        break;
      case 'back':
        this.position.y -= moveSpeed;
        break;
      case 'left':
        this.position.x -= moveSpeed;  
        break;
      case 'right':
        this.position.x += moveSpeed;  
        break;
    }
    
    // 가끔 방향 변경 (5% 확률)
    if (Math.random() < 0.05) {
      const directions = ['front', 'right', 'back', 'left'];
      this.direction = directions[Math.floor(Math.random() * directions.length)];
      
      // 10% 확률로 달리기 모드 토글
      if (Math.random() < 0.1) {
        this.isRunning = !this.isRunning;
        console.log(`🏃 고양이가 ${this.isRunning ? '달리기' : '걷기'} 모드로 변경!`);
      }
    }
    
    this.updatePosition();
    this.updateAnimation();
  }

  updatePosition() {
    if (this.cat) {
      this.cat.style.setProperty('left', this.position.x + 'px', 'important');
      this.cat.style.setProperty('top', this.position.y + 'px', 'important');
    }
  }

  updateAnimation() {
    if (!this.cat) return;
    
    // 현재 행동이 걷기인 경우 방향에 따라 애니메이션 변경
    if (this.walkBehaviors.includes(this.currentBehavior)) {
      const prefix = this.isRunning ? 'cat-run' : 'cat-walk';
      const newClass = `pixel-cat ${prefix}-${this.direction}`;
      
      if (this.cat.className !== newClass) {
        this.cat.className = newClass;
      }
    } else {
      // 정적 행동
      const newClass = `pixel-cat cat-${this.currentBehavior}`;
      if (this.cat.className !== newClass) {
        this.cat.className = newClass;
      }
    }
  }

  changeBehavior() {
    if (!this.cat) return;
    
    // 마우스 따라다니기 모드에서는 행동 변경 안함
    if (this.followMouse) return;
    
    const config = this.getSkinConfig();
    const availableWalkBehaviors = this.walkBehaviors.filter(behavior => 
      config.animations.includes(behavior) || config.fallbacks[behavior]
    );
    const availableStaticBehaviors = ['sit', 'sit-groom', 'lie', 'sleep'].filter(behavior => 
      config.animations.includes(behavior) || config.fallbacks[behavior]
    );
    
    // 70% 확률로 걷기, 30% 확률로 다른 행동
    let newBehavior;
    if (Math.random() < 0.7 && availableWalkBehaviors.length > 0) {
      newBehavior = availableWalkBehaviors[Math.floor(Math.random() * availableWalkBehaviors.length)];
    } else if (availableStaticBehaviors.length > 0) {
      newBehavior = availableStaticBehaviors[Math.floor(Math.random() * availableStaticBehaviors.length)];
    } else {
      // 사용 가능한 애니메이션이 없으면 걷기로 대체
      newBehavior = 'walk-front';
    }
    
    // 실제 사용할 애니메이션 결정 (fallback 적용)
    const actualBehavior = this.getActualAnimation(newBehavior);
    this.currentBehavior = actualBehavior;
    
    // 정적 행동일 경우 클래스 직접 설정
    if (!this.walkBehaviors.includes(actualBehavior)) {
      this.cat.className = `pixel-cat cat-${actualBehavior}`;
    }
    
    // 행동별 지속 시간 설정
    switch (actualBehavior) {
      case 'walk-front':
      case 'walk-right':
      case 'walk-back':
      case 'walk-left':
        this.behaviorDuration = Math.random() * 8000 + 4000; // 4-12초
        break;
      case 'sit':
        this.behaviorDuration = Math.random() * 5000 + 3000; // 3-8초
        break;
      case 'sit-groom':
        this.behaviorDuration = Math.random() * 4000 + 2000; // 2-6초
        break;
      case 'lie':
        this.behaviorDuration = Math.random() * 6000 + 4000; // 4-10초 (걷다가 눞기)
        break;
      case 'sleep':
        this.behaviorDuration = Math.random() * 12000 + 8000; // 8-20초 (누워서 자기)
        break;
      default:
        this.behaviorDuration = Math.random() * 5000 + 3000;
        break;
    }
    
    const behaviorNames = {
      'walk-front': '아래로 걷기',
      'walk-right': '오른쪽으로 걷기',
      'walk-back': '위로 걷기', 
      'walk-left': '왼쪽으로 걷기',
      'sit': '앉기',
      'sit-groom': '앉아서 앞발 핥기',
      'lie': '걷다가 눞기',
      'sleep': '누워서 자기'
    };
    
    const displayName = behaviorNames[actualBehavior] || actualBehavior;
    console.log(`🐾 고양이가 ${displayName} 중입니다! (요청: ${newBehavior}, 실제: ${actualBehavior})`);
  }

  startBehaviorTimer() {
    // 기존 타이머가 있으면 정리
    if (this.behaviorTimer) {
      clearTimeout(this.behaviorTimer);
      this.behaviorTimer = null;
    }
    
    const behaviorLoop = () => {
      if (!this.isActive || !this.catActive) return;
      
      this.changeBehavior();
      this.behaviorTimer = setTimeout(behaviorLoop, this.behaviorDuration);
    };
    
    // 첫 번째 행동 변경은 3초 후에 시작
    this.behaviorTimer = setTimeout(behaviorLoop, 3000);
  }

  getSkinImageUrl() {
    const config = this.getSkinConfig();
    return chrome.runtime.getURL(config.file);
  }
  
  getSkinConfig() {
    return skinConfigs[this.currentSkin] || skinConfigs['yellow'];
  }
  
  getActualAnimation(requestedAnimation) {
    const config = this.getSkinConfig();
    
    // 요청된 애니메이션이 현재 스킨에서 지원되는지 확인
    if (config.animations.includes(requestedAnimation)) {
      return requestedAnimation;
    }
    
    // 지원되지 않으면 fallback 애니메이션 사용
    if (config.fallbacks && config.fallbacks[requestedAnimation]) {
      const fallbackAnimation = config.fallbacks[requestedAnimation];
      console.log(`🔄 ${this.currentSkin} 스킨에서 ${requestedAnimation} → ${fallbackAnimation} 대체`);
      return fallbackAnimation;
    }
    
    // fallback도 없으면 기본 걷기 애니메이션
    console.warn(`⚠️ ${this.currentSkin} 스킨에서 ${requestedAnimation} 애니메이션을 찾을 수 없습니다. walk-front로 대체합니다.`);
    return 'walk-front';
  }
  
  updateCatSkin() {
    if (this.cat) {
      const skinImage = this.getSkinImageUrl();
      const skinConfig = this.getSkinConfig();
      const backgroundWidth = skinConfig.cols * 32; // 스프라이트 총 너비
      const backgroundHeight = skinConfig.rows * 32; // 스프라이트 총 높이
      
      // background-image와 background-size 모두 업데이트
      this.cat.style.setProperty('background-image', `url('${skinImage}')`, 'important');
      this.cat.style.setProperty('background-size', `${backgroundWidth}px ${backgroundHeight}px`, 'important');
      
      console.log('🎨 고양이 스킨 업데이트 완료:', this.currentSkin);
      console.log('🔗 이미지 URL:', skinImage);
      console.log('📐 배경 크기:', `${backgroundWidth}px × ${backgroundHeight}px`);
    }
  }
  
  updateCatSize() {
    if (this.cat) {
      const scale = this.size / 32; // 32px 기준으로 스케일 계산
      this.cat.style.setProperty('transform', `scale(${scale})`, 'important');
      console.log('📏 고양이 크기 업데이트:', this.size + 'px (스케일: ' + scale + ')');
    }
  }
  
  updateCatVisibility() {
    if (!this.cat) return;
    
    if (this.catActive) {
      this.cat.style.setProperty('display', 'block', 'important');
      this.cat.style.setProperty('visibility', 'visible', 'important');
      console.log('😸 고양이가 나타났습니다!');
      
      // 고양이가 활성화되면 애니메이션과 행동 재시작
      this.restartCatActivity();
    } else {
      this.cat.style.setProperty('display', 'none', 'important');
      this.cat.style.setProperty('visibility', 'hidden', 'important');
      
      // 고양이가 비활성화되면 타이머 정리
      if (this.behaviorTimer) {
        clearTimeout(this.behaviorTimer);
        this.behaviorTimer = null;
      }
      
      console.log('😴 고양이가 숨었습니다!');
    }
  }
  
  restartCatActivity() {
    if (!this.catActive) return;
    
    // 상태 초기화
    this.hasArrivedAtMouse = false;
    this.isIdleAtMouse = false;
    
    // 새로운 위치 설정 (화면 중앙 근처 랜덤 위치)
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const actualSize = this.size;
    
    this.position.x = Math.random() * (windowWidth - actualSize - 200) + 100;
    this.position.y = Math.random() * (windowHeight - actualSize - 200) + 100;
    
    // 새로운 방향 설정
    const directions = ['front', 'right', 'back', 'left'];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
    
    // 새로운 행동 설정 (걷기 모드로 시작)
    if (this.followMouse) {
      this.currentBehavior = 'walk-right';
    } else {
      // 걷기 행동으로 시작
      this.currentBehavior = `walk-${this.direction}`;
    }
    
    // 위치 업데이트
    this.updatePosition();
    this.updateAnimation();
    
    // 행동 타이머 재시작 (즉시 시작)
    this.startBehaviorTimer();
    
    // 즉시 움직임 시작 (타이머 대기 없이)
    setTimeout(() => {
      if (this.catActive) {
        this.changeBehavior();
      }
    }, 500); // 0.5초 후 첫 번째 행동 변경
    
    console.log('🔄 고양이 활동이 재시작되었습니다!');
    console.log('📍 새로운 위치:', this.position);
    console.log('🎯 새로운 방향:', this.direction);
    console.log('🏃 새로운 행동:', this.currentBehavior);
  }
  
  destroy() {
    console.log('🗑️ 스프라이트 고양이를 제거합니다');
    this.isActive = false;
    
    // 타이머 정리
    if (this.behaviorTimer) {
      clearTimeout(this.behaviorTimer);
      this.behaviorTimer = null;
    }
    
    if (this.cat && this.cat.parentNode) {
      this.cat.parentNode.removeChild(this.cat);
    }
  }
}

// 즉시 실행
(function() {
  console.log('🌟 픽셀 스프라이트 고양이 스크립트가 로드되었습니다!');
  console.log('📄 현재 페이지:', window.location.href);
  
  function createCat() {
    console.log('🎯 스프라이트 고양이 생성!');
    if (window.pixelCat) {
      window.pixelCat.destroy();
    }
    window.pixelCat = new PixelCat();
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createCat);
  } else {
    createCat();
  }
  
  window.addEventListener('beforeunload', () => {
    if (window.pixelCat) {
      window.pixelCat.destroy();
    }
  });
})(); 