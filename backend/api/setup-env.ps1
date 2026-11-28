# =============================================================================
# UrbanShop API — cria o arquivo .env com as configurações secretas.
#
# Como usar (PowerShell, dentro de backend\api):
#   powershell -ExecutionPolicy Bypass -File .\setup-env.ps1
#
# - Pede a senha do MongoDB Atlas (não aparece na tela e não fica no histórico).
# - Gera chaves aleatórias seguras para o JWT e para a criptografia do CPF.
# - O .env é ignorado pelo Git: nunca envie este arquivo para ninguém.
# =============================================================================

$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '.env'

function New-SecretKey {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $rng.Dispose()
    return [Convert]::ToBase64String($bytes)
}

function Read-ExistingValue([string]$name) {
    if (-not (Test-Path $envFile)) { return $null }
    $line = Get-Content $envFile | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
    if ($line) { return $line.Substring($name.Length + 1) }
    return $null
}

Write-Host ''
Write-Host 'UrbanShop API - configuracao do arquivo .env' -ForegroundColor Yellow
Write-Host ''

# ---- MongoDB Atlas ----
$user = Read-Host 'Usuario do MongoDB Atlas [feliperossidev_db_user]'
if ([string]::IsNullOrWhiteSpace($user)) { $user = 'feliperossidev_db_user' }

$cluster = Read-Host 'Endereco do cluster [cluster0.ktanmop.mongodb.net]'
if ([string]::IsNullOrWhiteSpace($cluster)) { $cluster = 'cluster0.ktanmop.mongodb.net' }

$secure = Read-Host 'Senha do usuario no Atlas' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if ([string]::IsNullOrWhiteSpace($plain)) {
    Write-Host 'Senha vazia. Nada foi alterado.' -ForegroundColor Red
    exit 1
}
# Caracteres especiais da senha precisam ser codificados na URL de conexão.
$encodedUser = [uri]::EscapeDataString($user)
$encodedPassword = [uri]::EscapeDataString($plain)
$plain = $null

$mongoUri = "mongodb+srv://${encodedUser}:${encodedPassword}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0"

# ---- Chaves ----
# IMPORTANTE: a chave de criptografia NUNCA pode mudar depois que houver clientes,
# senão os CPFs já salvos não poderão mais ser lidos. Por isso ela é reaproveitada.
$jwtSecret = Read-ExistingValue 'JWT_SECRET'
if (-not $jwtSecret) { $jwtSecret = New-SecretKey }

$dataKey = Read-ExistingValue 'DATA_ENCRYPTION_KEY'
if (-not $dataKey) { $dataKey = New-SecretKey }

$content = @"
# Arquivo gerado pelo setup-env.ps1 - NAO envie para o GitHub nem para ninguem.
MONGODB_URI=$mongoUri
MONGODB_DATABASE=urbanshop
JWT_SECRET=$jwtSecret
DATA_ENCRYPTION_KEY=$dataKey
FRONTEND_URL=http://localhost:8081
API_URL=http://localhost:8080
# E-mail (opcional). Sem MAIL_HOST, os links aparecem no console da API.
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
"@

Set-Content -Path $envFile -Value $content -Encoding ASCII
Write-Host ''
Write-Host "Arquivo .env criado em $envFile" -ForegroundColor Green
Write-Host 'Guarde uma copia da linha DATA_ENCRYPTION_KEY em local seguro (ex.: gerenciador de senhas).' -ForegroundColor Yellow
Write-Host ''
