# Script para iniciar o servidor backend
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green
Write-Host "📂 Diretório: $scriptPath" -ForegroundColor Cyan

# Verifica se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules não encontrado. Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Inicia o servidor
Write-Host "🔌 Conectando ao MongoDB e iniciando servidor na porta 3000..." -ForegroundColor Cyan
node server.js


