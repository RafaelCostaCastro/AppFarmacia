# Script PowerShell para testar conexão MongoDB
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
node test-connection.js

