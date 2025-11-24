# Script para iniciar o projeto completo
Write-Host "🚀 Iniciando Projeto Farmácia" -ForegroundColor Green
Write-Host ""

# Verifica se estamos no diretório correto
$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Diretório backend não encontrado!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Diretório frontend não encontrado!" -ForegroundColor Red
    exit 1
}

# Função para verificar se uma porta está em uso
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
    return $connection
}

# Verifica se a porta 3000 está em uso
if (Test-Port -Port 3000) {
    Write-Host "⚠️  Porta 3000 já está em uso. O servidor pode já estar rodando." -ForegroundColor Yellow
    Write-Host "   Para verificar: http://localhost:3000/medicamentos" -ForegroundColor Cyan
} else {
    Write-Host "📦 Verificando dependências do backend..." -ForegroundColor Cyan
    Set-Location $backendPath
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "   Instalando dependências do backend..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host ""
    Write-Host "🔌 Iniciando servidor backend na porta 3000..." -ForegroundColor Green
    Write-Host "   MongoDB: mongodb+srv://rafaelcastro2_db_user:****@farmacia.6y8ri0b.mongodb.net/farmacia" -ForegroundColor Cyan
    Write-Host ""
    
    # Inicia o servidor em background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; node server.js" -WindowStyle Normal
    
    Write-Host "✅ Servidor backend iniciado!" -ForegroundColor Green
    Write-Host "   Aguarde alguns segundos para a conexão com MongoDB..." -ForegroundColor Yellow
    Write-Host ""
}

# Frontend
Write-Host "📱 Para iniciar o frontend, execute:" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "📝 Ou use: npm run android / npm run ios / npm run web" -ForegroundColor Cyan
Write-Host ""

# Aguarda um pouco para verificar se o servidor iniciou
Start-Sleep -Seconds 3

# Testa a conexão
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/medicamentos" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Servidor backend está respondendo!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Servidor ainda não está respondendo. Aguarde alguns segundos..." -ForegroundColor Yellow
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green


