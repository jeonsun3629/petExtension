# Chrome Web Store 제출용 확장 프로그램 패키지 생성 스크립트

Write-Host "🔧 Chrome Web Store 제출용 확장 프로그램 패키지 생성 중..." -ForegroundColor Green

# 기존 패키지 파일 삭제
if (Test-Path "extension.zip") {
    Remove-Item "extension.zip" -Force
    Write-Host "✅ 기존 extension.zip 삭제됨" -ForegroundColor Yellow
}

# docs 폴더를 제외하고 확장 프로그램 패키지 생성
try {
    # extension 폴더의 내용을 임시로 복사 (docs 제외)
    $tempDir = "temp-extension"
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    
    # extension 폴더 복사
    Copy-Item "extension" $tempDir -Recurse
    
    # ZIP 파일 생성
    Compress-Archive -Path "$tempDir/*" -DestinationPath "extension.zip" -Force
    
    # 임시 폴더 정리
    Remove-Item $tempDir -Recurse -Force
    
    Write-Host "✅ extension.zip 생성 완료!" -ForegroundColor Green
    Write-Host "📦 패키지 크기: $((Get-Item 'extension.zip').Length / 1KB) KB" -ForegroundColor Cyan
    Write-Host "🚀 Chrome Web Store에 제출할 준비가 완료되었습니다!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ 패키지 생성 중 오류 발생: $($_.Exception.Message)" -ForegroundColor Red
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    exit 1
}

Write-Host ""
Write-Host "📋 다음 단계:" -ForegroundColor Yellow
Write-Host "1. Chrome Web Store Developer Dashboard에 로그인" -ForegroundColor White
Write-Host "2. extension.zip 파일을 업로드" -ForegroundColor White
Write-Host "3. 확장 프로그램 정보 업데이트" -ForegroundColor White
Write-Host "4. 제출 및 검토 대기" -ForegroundColor White 