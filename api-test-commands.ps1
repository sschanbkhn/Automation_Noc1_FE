# API Test Commands for I004 LSP Module
# Replace YOUR_TOKEN_HERE with actual token

$token = "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjVjZThlODI1LTE3MTctNDU5Ni1iOTE4LTVhNzM3YjUzYzJmMiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJhZG1pbiIsImV4cCI6MTc1OTQ4NjAyOCwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAxIiwiYXVkIjoiaHR0cDovL2xvY2FsaG9zdDo1MDAxIn0.p3JElVwEtZPbZlYLNM5KACiiokdHHf1L_iMCGGHpb4I"
$headers = @{ "Authorization" = "Bearer $token" }
$baseUrl = "http://localhost:5001/api"

Write-Host "🧪 Testing I004 LSP API Endpoints..." -ForegroundColor Cyan

# Test 1: Get P-Data List
Write-Host "`n📋 Test 1: Get P-Data List" -ForegroundColor Yellow
try {
    $pDataResult = Invoke-RestMethod -Uri "$baseUrl/I004_LSP/GetPDataList" -Headers $headers
    Write-Host "✅ P-Data Count: $($pDataResult.Data.Count)" -ForegroundColor Green
    Write-Host "Sample P-Data IPs:" -ForegroundColor Gray
    $pDataResult.Data[0..2] | ForEach-Object { Write-Host "  - $($_.HostName): $($_.IdNode)" -ForegroundColor Gray }
} catch {
    Write-Host "❌ P-Data Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get POP-Data List  
Write-Host "`n📋 Test 2: Get POP-Data List" -ForegroundColor Yellow
try {
    $popDataResult = Invoke-RestMethod -Uri "$baseUrl/I004_LSP/GetPOPDataList" -Headers $headers
    Write-Host "✅ POP-Data Count: $($popDataResult.Data.Count)" -ForegroundColor Green
    Write-Host "Sample POP-Data IPs:" -ForegroundColor Gray
    $popDataResult.Data[0..2] | ForEach-Object { Write-Host "  - $($_.HostName): $($_.IdNode)" -ForegroundColor Gray }
} catch {
    Write-Host "❌ POP-Data Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Single IP Bandwidth Query (Known working pair)
Write-Host "`n📊 Test 3: Single IP Bandwidth Query" -ForegroundColor Yellow
try {
    $bandwidthUrl = "$baseUrl/I004_LSP/bandwidthbypath?fromData=123.29.4.86&toData=123.29.4.1&timeRange=24h"
    $bandwidthResult = Invoke-RestMethod -Uri $bandwidthUrl -Headers $headers
    Write-Host "✅ Bandwidth Records: $($bandwidthResult.Data.Count)" -ForegroundColor Green
    if ($bandwidthResult.Data.Count -gt 0) {
        $sample = $bandwidthResult.Data[0]
        Write-Host "Sample Record:" -ForegroundColor Gray
        Write-Host "  - Time: $($sample.Ts)" -ForegroundColor Gray  
        Write-Host "  - From: $($sample.FromAddress)" -ForegroundColor Gray
        Write-Host "  - To: $($sample.ToAddress)" -ForegroundColor Gray
        Write-Host "  - Path: $($sample.PathLsp)" -ForegroundColor Gray
        Write-Host "  - Bandwidth: $($sample.Bandwidth) GB" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Bandwidth Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Multiple IP Bandwidth Query
Write-Host "`n📊 Test 4: Multiple IP Bandwidth Query (2x2 = 4 combinations)" -ForegroundColor Yellow
try {
    $multiUrl = "$baseUrl/I004_LSP/bandwidthbypath?fromData=123.29.4.86&fromData=123.29.4.1&toData=123.29.4.1&toData=123.29.4.8&timeRange=24h"
    $multiResult = Invoke-RestMethod -Uri $multiUrl -Headers $headers
    Write-Host "✅ Multiple IP Records: $($multiResult.Data.Count)" -ForegroundColor Green
    
    # Group by path to show unique paths
    $uniquePaths = $multiResult.Data | Select-Object -ExpandProperty PathLsp -Unique
    Write-Host "Unique Paths Found: $($uniquePaths.Count)" -ForegroundColor Gray
    $uniquePaths[0..4] | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
} catch {
    Write-Host "❌ Multiple IP Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Route PCEP Status
Write-Host "`n🔌 Test 5: Route PCEP Status" -ForegroundColor Yellow
try {
    $pcepResult = Invoke-RestMethod -Uri "$baseUrl/I004_LSP/GetRoutePCEPStatus" -Headers $headers
    Write-Host "✅ PCEP Status - UP: $($pcepResult.Data.UpCount), DOWN: $($pcepResult.Data.DownCount)" -ForegroundColor Green
} catch {
    Write-Host "❌ PCEP Status Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: LSP Delegated Status
Write-Host "`n📡 Test 6: LSP Delegated Status" -ForegroundColor Yellow
try {
    $lspResult = Invoke-RestMethod -Uri "$baseUrl/I004_LSP/GetLSPDelegatedStatus" -Headers $headers
    Write-Host "✅ LSP Status - Active: $($lspResult.Data.ActiveCount), Down: $($lspResult.Data.DownCount), Unknown: $($lspResult.Data.UnknownCount)" -ForegroundColor Green
} catch {
    Write-Host "❌ LSP Status Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Cyan
Write-Host "Use these IPs for frontend testing:" -ForegroundColor Cyan
Write-Host "✅ Working FROM IPs: 123.29.4.86, 123.29.4.1" -ForegroundColor Green
Write-Host "✅ Working TO IPs: 123.29.4.1, 123.29.4.8" -ForegroundColor Green