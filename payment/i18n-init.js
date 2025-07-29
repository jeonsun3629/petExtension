// i18n-init.js - 다국어 초기화 스크립트
// Chrome Extension 환경에서 i18n 메시지로 텍스트 설정

function initializeI18n() {
    // chrome.i18n API가 있는지 확인 (Chrome Extension 환경)
    if (typeof chrome !== 'undefined' && chrome.i18n) {
        // 페이지 제목
        document.title = chrome.i18n.getMessage('premiumSkinPurchase') + ' - ' + chrome.i18n.getMessage('pixelCatExtension');
        document.getElementById('pageTitle').textContent = document.title;
        
        // 메인 타이틀
        document.getElementById('mainTitle').innerHTML = '🌟 ' + chrome.i18n.getMessage('premiumSkinPurchase');
        
        // 서브타이틀
        document.getElementById('subtitle').textContent = chrome.i18n.getMessage('pixelCatExtension');
        
        // 가격
        document.getElementById('price').textContent = chrome.i18n.getMessage('priceKRW');
        
        // 기능 목록
        document.getElementById('featuresTitle').textContent = chrome.i18n.getMessage('includedPremiumSkins');
        document.getElementById('greydogSkin').textContent = chrome.i18n.getMessage('greydogSkin');
        document.getElementById('blackdogSkin').textContent = chrome.i18n.getMessage('blackdogSkin');
        document.getElementById('yellowdogSkin').textContent = chrome.i18n.getMessage('yellowdogSkin');
        document.getElementById('futureSkinsIncluded').textContent = chrome.i18n.getMessage('futureSkinsIncluded');
        document.getElementById('lifetimeAccess').textContent = chrome.i18n.getMessage('lifetimeAccess');
        
        // 결제 버튼
        document.getElementById('paypalBtn').textContent = chrome.i18n.getMessage('payWithPaypal');
        document.getElementById('tossBtn').textContent = chrome.i18n.getMessage('payWithToss');
        document.getElementById('backBtn').textContent = chrome.i18n.getMessage('goBack');
        
        // 성공 메시지
        document.getElementById('paymentCompletedTitle').textContent = chrome.i18n.getMessage('paymentCompleted');
        document.getElementById('purchaseCompletedMsg').textContent = chrome.i18n.getMessage('premiumSkinPurchaseCompleted');
        document.getElementById('autoActivationTitle').textContent = chrome.i18n.getMessage('autoActivationInProgress');
        document.getElementById('autoActivationMsg').textContent = chrome.i18n.getMessage('autoActivatingExtension');
        document.getElementById('activationStatus').textContent = chrome.i18n.getMessage('connectionAttempt');
        document.getElementById('licenseKeyLabel').textContent = chrome.i18n.getMessage('licenseKey');
        document.getElementById('copyBtn').textContent = chrome.i18n.getMessage('copyToClipboard');
        document.getElementById('failureNote').textContent = chrome.i18n.getMessage('autoActivationFailureNote');
    }
}

// DOM이 로드되면 i18n 초기화 실행
document.addEventListener('DOMContentLoaded', initializeI18n); 