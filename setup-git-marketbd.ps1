# ==============================================================================
# MarketBD Multi-Folder Safe Git Setup & Push Tool (PowerShell)
# Handles dynamic numbered folders: "MarketBD.Net (59)", "(60)", "(61)", "(62)", etc.
# ==============================================================================

[CmdletBinding()]
param(
    [string]$RepoUrl,
    [switch]$CheckOnly,
    [switch]$AutoPush
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  🛒 MarketBD Multi-Folder Git Safe Configuration Manager  " -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Resolve Current Working Directory dynamically
$CurrentFolder = (Get-Location).Path
Write-Host "📁 Current Active Folder: $CurrentFolder" -ForegroundColor Yellow
Write-Host ""

# 2. Check if git is installed
$GitCmd = Get-Command "git" -ErrorAction SilentlyContinue
if (-not $GitCmd) {
    Write-Host "❌ Error: Git is not installed or not in PATH." -ForegroundColor Red
    Write-Host "   Please install Git for Windows (https://git-scm.com/download/win)" -ForegroundColor Yellow
    exit 1
}

# 3. Check existing .git configuration
$GitDir = Join-Path $CurrentFolder ".git"
$HasGit = Test-Path $GitDir

if ($HasGit) {
    Write-Host "🔍 [1/3] Existing .git repository detected in current folder." -ForegroundColor Green
    $ExistingRemotes = & git remote -v
    Write-Host "   Current Configured Remotes:" -ForegroundColor Gray
    $ExistingRemotes | ForEach-Object { Write-Host "     $_" -ForegroundColor DarkCyan }
    Write-Host ""
} else {
    Write-Host "⚠️ [1/3] No .git repository found in current folder." -ForegroundColor Yellow
    Write-Host "   Initializing git safely..." -ForegroundColor Gray
    & git init
    & git branch -M main
    Write-Host "   ✓ Git initialized with default branch 'main'." -ForegroundColor Green
    Write-Host ""
}

# 4. Handle Remote Origin
$CurrentOrigin = ""
try {
    $CurrentOrigin = (& git remote get-url origin 2>$null).Trim()
} catch {
    $CurrentOrigin = ""
}

if ($RepoUrl) {
    if ($CurrentOrigin -eq "") {
        Write-Host "🔗 Adding remote origin: $RepoUrl" -ForegroundColor Cyan
        & git remote add origin $RepoUrl
    } elseif ($CurrentOrigin -ne $RepoUrl) {
        Write-Host "⚠️ Notice: Current origin is '$CurrentOrigin'" -ForegroundColor Yellow
        Write-Host "   Updating remote origin to: '$RepoUrl'" -ForegroundColor Cyan
        & git remote set-url origin $RepoUrl
    } else {
        Write-Host "✓ Remote origin already correctly set to: $CurrentOrigin" -ForegroundColor Green
    }
} else {
    if ($CurrentOrigin -ne "") {
        Write-Host "✓ Current Remote Origin: $CurrentOrigin" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No remote origin is configured yet." -ForegroundColor Yellow
        Write-Host "   Run this script with -RepoUrl <Your_GitHub_URL> or configure manually:" -ForegroundColor Gray
        Write-Host "   git remote add origin https://github.com/<Your-Username>/<Your-Repo>.git" -ForegroundColor Cyan
    }
}

# 5. Check Current Branch
$CurrentBranch = (& git branch --show-current 2>$null).Trim()
if (-not $CurrentBranch) {
    $CurrentBranch = "main"
    & git checkout -B main 2>$null
}
Write-Host "🌿 Current Branch: $CurrentBranch" -ForegroundColor Green
Write-Host ""

if ($CheckOnly) {
    Write-Host "✅ Inspection complete. No changes made." -ForegroundColor Green
    exit 0
}

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  🚀 Quick Workflow for Current Folder:                        " -ForegroundColor Yellow
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  1. npm run build" -ForegroundColor White
Write-Host "  2. git add ." -ForegroundColor White
Write-Host "  3. git commit -m `"Update MarketBD website`"" -ForegroundColor White
Write-Host "  4. git push origin main" -ForegroundColor White
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""
