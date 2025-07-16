# 🪟 Windows 환경 설정 가이드

## ❌ 발생한 오류

```powershell
PS D:\Dev\petExtension> npm
npm : 'npm' 용어가 cmdlet, 함수, 스크립트 파일 또는 실행할 수 있는 프로그램 이름으로 인식되지 않습니다.
```

이 오류는 **Node.js가 설치되지 않았거나 환경변수가 제대로 설정되지 않았을 때** 발생합니다.

## 🔧 해결 방법

### 1. Node.js 설치 확인

먼저 Node.js가 설치되어 있는지 확인해보세요:

```powershell
# PowerShell에서 실행
node --version
npm --version
```

### 2. Node.js 설치 (없는 경우)

#### 방법 1: 공식 사이트에서 다운로드 (권장)

1. **Node.js 공식 사이트 방문**: https://nodejs.org/
2. **LTS 버전 다운로드** (안정적인 장기 지원 버전)
3. **설치 파일 실행** (.msi 파일)
4. **설치 마법사 따라하기**
   - ✅ "Add to PATH" 옵션 체크 (중요!)
   - ✅ "npm package manager" 옵션 체크
   - ✅ "Node.js runtime" 옵션 체크

#### 방법 2: Chocolatey 사용 (고급 사용자)

```powershell
# Chocolatey 설치 (관리자 권한 필요)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Node.js 설치
choco install nodejs
```

#### 방법 3: winget 사용 (Windows 10/11)

```powershell
# winget으로 Node.js 설치
winget install OpenJS.NodeJS
```

### 3. 설치 확인

Node.js 설치 완료 후 **새 PowerShell 창을 열고** 확인:

```powershell
# 버전 확인
node --version
npm --version

# 결과 예시:
# v18.17.0
# 9.8.1
```

### 4. 환경변수 수동 설정 (필요시)

설치 후에도 인식되지 않는 경우:

1. **시스템 환경변수 열기**:
   - `Windows + R` → `sysdm.cpl` → 고급 → 환경변수

2. **PATH 변수에 Node.js 경로 추가**:
   ```
   C:\Program Files\nodejs\
   C:\Users\[사용자명]\AppData\Roaming\npm
   ```

3. **PowerShell 재시작**

## 🚀 프로젝트 빌드 시작

Node.js 설치 완료 후 프로젝트 빌드:

```powershell
# 1. 프로젝트 디렉터리로 이동
cd D:\Dev\petExtension

# 2. 의존성 설치
npm install

# 3. 환경변수 파일 생성
copy env.example .env.development

# 4. 개발 환경 빌드
npm run build:dev
```

## 🔍 문제 해결

### npm install 실패 시

```powershell
# 1. 캐시 정리
npm cache clean --force

# 2. node_modules 삭제 후 재설치
rmdir /s node_modules
npm install

# 3. 관리자 권한으로 실행
```

### 권한 오류 시

```powershell
# PowerShell 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 또는 관리자 권한으로 PowerShell 실행
```

### 프록시 환경에서 npm 설정

```powershell
# 프록시 설정 (회사 네트워크 등)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 프록시 해제
npm config delete proxy
npm config delete https-proxy
```

## 📋 설치 확인 체크리스트

설치 완료 후 다음 명령어들이 모두 정상 작동하는지 확인:

- [ ] `node --version` ✅
- [ ] `npm --version` ✅
- [ ] `npm install` ✅
- [ ] `npm run build:dev` ✅

## 🎯 추천 개발 환경

Windows에서 개발할 때 추천하는 추가 도구들:

### 1. Visual Studio Code
```powershell
# winget으로 설치
winget install Microsoft.VisualStudioCode
```

### 2. Git for Windows
```powershell
# winget으로 설치
winget install Git.Git
```

### 3. Windows Terminal
```powershell
# winget으로 설치 (Windows 10/11)
winget install Microsoft.WindowsTerminal
```

## 🚨 여전히 문제가 있다면

1. **PowerShell 관리자 권한으로 실행**
2. **Windows 재부팅**
3. **Node.js 완전 삭제 후 재설치**
4. **개발자 도구 설치**:
   ```powershell
   # Visual Studio Build Tools 설치
   npm install --global --production windows-build-tools
   ```

---

**이 가이드를 따라하시면 Windows 환경에서 안전하게 개발 환경을 구축할 수 있습니다!** 🎉

문제가 계속되면 구체적인 오류 메시지와 함께 문의해주세요. 