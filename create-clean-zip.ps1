# ============================================================
# MARKETBD.NET — CLEAN COMPLETE WEBSITE ZIP
# Version: (96)
# STRICT PRESERVATION — DO NOT MODIFY SOURCE
# ============================================================

[CmdletBinding()]
param(
    [string]$ProjectRoot = "F:\MarketBD.Net-2026\MarketBD.Net (96)",
    [string]$ZipPath = "F:\MarketBD.Net-2026\MarketBD.Net-Complete-Clean.zip",
    [string]$Stage = "F:\MarketBD.Net-2026\MarketBD.Net-Clean-Staging"
)

# Dynamic fallback if running directly inside the project directory
if (-not (Test-Path $ProjectRoot)) {
    $CurrentDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    if (Test-Path (Join-Path $CurrentDir "package.json")) {
        $ProjectRoot = $CurrentDir
        $ParentDir = Split-Path -Parent $CurrentDir
        $ZipPath = Join-Path $ParentDir "MarketBD.Net-Complete-Clean.zip"
        $Stage = Join-Path $ParentDir "MarketBD.Net-Clean-Staging"
    }
}

Write-Host "=== MARKETBD.NET CLEAN ZIP CREATION STARTED ===" -ForegroundColor Cyan
Write-Host "Project Source : $ProjectRoot" -ForegroundColor Gray
Write-Host "Target ZIP     : $ZipPath" -ForegroundColor Gray
Write-Host "Staging Temp   : $Stage" -ForegroundColor Gray
Write-Host ""

# 1. Verify project exists
if (!(Test-Path $ProjectRoot)) {
    throw "ERROR: MarketBD.Net project folder was not found: $ProjectRoot"
}

# 2. Remove previous temporary staging folder ONLY
if (Test-Path $Stage) {
    Remove-Item $Stage -Recurse -Force
}

# 3. Remove previous ZIP ONLY
if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}

# 4. Create clean staging folder
New-Item -ItemType Directory -Path $Stage | Out-Null

Write-Host "Copying complete website while excluding ONLY unnecessary files..." -ForegroundColor Yellow

# 5. COPY COMPLETE WEBSITE
# IMPORTANT:
# The source project itself is NOT modified.
# Only the temporary staging copy is cleaned.

robocopy $ProjectRoot $Stage /E `
    /XD `
    "node_modules" `
    ".git" `
    ".cache" `
    ".turbo" `
    ".vite" `
    "coverage" `
    ".idea" `
    ".vscode" `
    "__pycache__" `
    /XF `
    "*.log" `
    "*.tmp" `
    "*.temp" `
    ".DS_Store" `
    "Thumbs.db" `
    "*.zip"

if ($LASTEXITCODE -ge 8) {
    throw "ERROR: File copy failed. Source project has NOT been modified."
}

# 6. Remove temporary/unwanted development files from STAGING ONLY
$RemovePatterns = @(
    ".env.local",
    ".env.development",
    ".env.test",
    ".env.production.local",
    "*.log",
    "*.tmp",
    "*.temp",
    "Thumbs.db",
    ".DS_Store"
)

foreach ($pattern in $RemovePatterns) {
    Get-ChildItem -Path $Stage -Recurse -Force -File -Filter $pattern -ErrorAction SilentlyContinue |
        Remove-Item -Force -ErrorAction SilentlyContinue
}

# 7. IMPORTANT FILE PRESERVATION CHECK
$RequiredFiles = @(
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "index.html"
)

foreach ($file in $RequiredFiles) {
    if (Test-Path (Join-Path $Stage $file)) {
        Write-Host "OK: $file" -ForegroundColor Green
    }
    else {
        Write-Host "WARNING: $file not found in project root." -ForegroundColor Yellow
    }
}

# 8. Verify important project directories
$ImportantDirs = @(
    "src",
    "public",
    "api"
)

foreach ($dir in $ImportantDirs) {
    if (Test-Path (Join-Path $Stage $dir)) {
        Write-Host "OK: $dir preserved" -ForegroundColor Green
    }
}

# 9. Create ZIP
Write-Host "Creating ZIP..." -ForegroundColor Yellow

Compress-Archive `
    -Path "$Stage\*" `
    -DestinationPath $ZipPath `
    -CompressionLevel Optimal

# 10. Verify ZIP exists
if (!(Test-Path $ZipPath)) {
    throw "ERROR: ZIP creation failed."
}

# 11. Display ZIP size
$ZipInfo = Get-Item $ZipPath
$ZipSizeMB = [math]::Round($ZipInfo.Length / 1MB, 2)

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "MARKETBD.NET CLEAN COMPLETE ZIP CREATED" -ForegroundColor Green
Write-Host "ZIP: $ZipPath" -ForegroundColor White
Write-Host "SIZE: $ZipSizeMB MB" -ForegroundColor White
Write-Host "==================================================" -ForegroundColor Cyan

# 12. Verify ZIP contents
Write-Host ""
Write-Host "Checking ZIP contents..." -ForegroundColor Yellow

Add-Type -AssemblyName System.IO.Compression.FileSystem

$Archive = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)

$EntryCount = $Archive.Entries.Count

Write-Host "Total ZIP entries: $EntryCount" -ForegroundColor Green

# Check forbidden heavy folders
$ForbiddenFolders = @(
    "node_modules/",
    ".git/",
    ".cache/",
    ".turbo/",
    "coverage/"
)

foreach ($folder in $ForbiddenFolders) {

    $Found = $Archive.Entries | Where-Object {
        $_.FullName -like "$folder*" -or $_.FullName -like "*/$folder*"
    }

    if ($Found) {
        Write-Host "WARNING: Unwanted folder found in ZIP: $folder" -ForegroundColor Red
    }
    else {
        Write-Host "OK: $folder excluded" -ForegroundColor Green
    }
}

$Archive.Dispose()

# 13. IMPORTANT:
# Delete staging folder AFTER ZIP verification
Remove-Item $Stage -Recurse -Force

Write-Host ""
Write-Host "SOURCE PROJECT WAS NOT MODIFIED." -ForegroundColor Green
Write-Host "ONLY THE CLEAN ZIP AND TEMPORARY STAGING COPY WERE CREATED." -ForegroundColor Green
Write-Host ""
Write-Host "FINAL ZIP:" -ForegroundColor Cyan
Write-Host $ZipPath -ForegroundColor White
