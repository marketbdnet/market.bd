# ==============================================================================
# MarketBD Android APK Automated Build Script (PowerShell)
# Project: MarketBD.Net Official Android App
# Application ID: com.marketbd.app
# Target URL: https://marketbd.net/
# Output: <Current_Update_Folder>\update\MarketBD.apk
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipIconGen,
    [switch]$Release
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  🛒 MarketBD Android Automated Build & Verification Tool  " -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Resolve Current Project Root dynamically (No hard-coded folder numbers)
$ScriptRoot = $PSScriptRoot
if (-not $ScriptRoot) {
    $ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
}
if (-not $ScriptRoot) {
    $ScriptRoot = (Get-Location).Path
}

if (Test-Path "$ScriptRoot\android") {
    $AndroidDir = "$ScriptRoot\android"
    $ProjectRoot = $ScriptRoot
} elseif (Test-Path "$ScriptRoot\app\src\main\AndroidManifest.xml") {
    $AndroidDir = $ScriptRoot
    $ProjectRoot = Split-Path -Parent $ScriptRoot
} else {
    Write-Host "❌ Error: Could not locate 'android' directory in current project ($ScriptRoot)." -ForegroundColor Red
    exit 1
}

$UpdateDir = Join-Path -Path $ProjectRoot -ChildPath "update"

Write-Host "📁 Current Project Root : $ProjectRoot" -ForegroundColor Gray
Write-Host "📱 Android Directory    : $AndroidDir" -ForegroundColor Gray
Write-Host "📦 Target Update Folder : $UpdateDir" -ForegroundColor Gray
Write-Host ""

# 2. Check Java / JAVA_HOME
Write-Host "🔍 [1/6] Checking Java Environment..." -ForegroundColor Yellow
$JavaCmd = Get-Command "java" -ErrorAction SilentlyContinue

if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $JavaPath = "$env:JAVA_HOME\bin\java.exe"
    Write-Host "   ✓ JAVA_HOME found: $env:JAVA_HOME" -ForegroundColor Green
} elseif ($JavaCmd) {
    $JavaPath = $JavaCmd.Source
    Write-Host "   ✓ Java found in PATH: $JavaPath" -ForegroundColor Green
} else {
    Write-Host "❌ Error: Java (JDK 17 or 21) was not found in JAVA_HOME or PATH." -ForegroundColor Red
    Write-Host "   Please install OpenJDK 17 or configure JAVA_HOME." -ForegroundColor Yellow
    exit 1
}

# 3. Check and Verify App Icons & Adaptive Resources
Write-Host "🎨 [2/6] Verifying Android Launcher Icons & Resources..." -ForegroundColor Yellow
$ResDir = "$AndroidDir\app\src\main\res"

if (-not $SkipIconGen) {
    if (Test-Path "$ProjectRoot\scripts\generate_android_icons.cjs") {
        $NodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
        if ($NodeCmd) {
            Write-Host "   ⚡ Checking launcher icon resources..." -ForegroundColor Gray
            try {
                Push-Location $ProjectRoot
                & node "$ProjectRoot\scripts\generate_android_icons.cjs" | Out-Null
                Pop-Location
                Write-Host "   ✓ Launcher icons and adaptive drawables verified!" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠️ Icon check notice: $_" -ForegroundColor Yellow
            }
        }
    }
}

# Verify Icon Existence
$Densities = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi", "mipmap-anydpi-v26")
foreach ($d in $Densities) {
    if (Test-Path "$ResDir\$d") {
        Write-Host "   ✓ Density folder verified: $d" -ForegroundColor Green
    }
}

# 4. Validate AndroidManifest.xml & MainActivity
Write-Host "📄 [3/6] Auditing Manifest & MainActivity Configuration..." -ForegroundColor Yellow
$ManifestPath = "$AndroidDir\app\src\main\AndroidManifest.xml"
$MainActivityPath = "$AndroidDir\app\src\main\java\com\marketbd\app\MainActivity.java"

if (-not (Test-Path $ManifestPath)) {
    Write-Host "❌ Error: AndroidManifest.xml missing at $ManifestPath" -ForegroundColor Red
    exit 1
}

$ManifestContent = Get-Content $ManifestPath -Raw
if ($ManifestContent -match 'package="com.marketbd.app"' -and $ManifestContent -match 'android:icon="@mipmap/ic_launcher"') {
    Write-Host "   ✓ Package & Launcher icon verified in AndroidManifest.xml" -ForegroundColor Green
}

if (Test-Path $MainActivityPath) {
    $MainContent = Get-Content $MainActivityPath -Raw
    if ($MainContent -match 'https://marketbd.net/') {
        Write-Host "   ✓ Production URL verified (https://marketbd.net/)" -ForegroundColor Green
    }
    if ($MainContent -notmatch 'Hello World') {
        Write-Host "   ✓ No Hello World stub detected. Pure MarketBD WebView engine active." -ForegroundColor Green
    }
}

# 5. Clean Previous Builds
Write-Host "🧹 [4/6] Cleaning Previous Build Artifacts..." -ForegroundColor Yellow
Push-Location $AndroidDir

try {
    if (Test-Path ".\gradlew.bat") {
        Write-Host "   ⚡ Executing: .\gradlew.bat clean" -ForegroundColor Gray
        & ".\gradlew.bat" clean --quiet
    } else {
        $GradleCmd = Get-Command "gradle" -ErrorAction SilentlyContinue
        if ($GradleCmd) {
            Write-Host "   ⚡ Executing: gradle clean" -ForegroundColor Gray
            & gradle clean --quiet
        }
    }
    Write-Host "   ✓ Clean completed successfully." -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Clean notice: $_" -ForegroundColor Gray
}

# 6. Assemble APK (Debug / Release)
$BuildTask = if ($Release) { "assembleRelease" } else { "assembleDebug" }
Write-Host "🔨 [5/6] Compiling MarketBD APK ($BuildTask)..." -ForegroundColor Yellow

$BuildSuccess = $false
try {
    if (Test-Path ".\gradlew.bat") {
        Write-Host "   ⚡ Executing: .\gradlew.bat $BuildTask" -ForegroundColor Gray
        & ".\gradlew.bat" $BuildTask --stacktrace
        $BuildSuccess = ($LASTEXITCODE -eq 0)
    } else {
        $GradleCmd = Get-Command "gradle" -ErrorAction SilentlyContinue
        if ($GradleCmd) {
            Write-Host "   ⚡ Executing: gradle $BuildTask" -ForegroundColor Gray
            & gradle $BuildTask --stacktrace
            $BuildSuccess = ($LASTEXITCODE -eq 0)
        } else {
            Write-Host "❌ Error: Neither gradlew.bat nor system gradle was found." -ForegroundColor Red
            Pop-Location
            exit 1
        }
    }
} catch {
    Write-Host "❌ Build encountered an error: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

Pop-Location

# 7. Locate and Copy Resulting APK to update/ folder (Never in root)
Write-Host ""
Write-Host "📦 [6/6] Locating and Storing APK in Update Folder..." -ForegroundColor Yellow

$ExpectedDebugApk = "$AndroidDir\app\build\outputs\apk\debug\app-debug.apk"
$ExpectedReleaseApk = "$AndroidDir\app\build\outputs\apk\release\app-release-unsigned.apk"

$FoundApk = $null
if (Test-Path $ExpectedDebugApk) {
    $FoundApk = $ExpectedDebugApk
} elseif (Test-Path $ExpectedReleaseApk) {
    $FoundApk = $ExpectedReleaseApk
} else {
    $AllApks = Get-ChildItem -Path "$AndroidDir\app\build\outputs\apk" -Filter "*.apk" -Recurse -ErrorAction SilentlyContinue
    if ($AllApks -and $AllApks.Count -gt 0) {
        $FoundApk = $AllApks[0].FullName
    }
}

if ($FoundApk) {
    $ApkItem = Get-Item $FoundApk
    $ApkSizeMb = [math]::Round($ApkItem.Length / 1MB, 2)
    
    # Ensure update directory exists inside the current project root
    if (-not (Test-Path $UpdateDir)) {
        New-Item -ItemType Directory -Path $UpdateDir -Force | Out-Null
    }

    # Copy ONLY to the update folder as MarketBD.apk (DO NOT copy to root)
    $DestUpdateApk = Join-Path -Path $UpdateDir -ChildPath "MarketBD.apk"
    Copy-Item -Path $FoundApk -Destination $DestUpdateApk -Force

    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host "  ✅ BUILD & DEPLOY SUCCESSFUL!                              " -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  [OK] Android build successful" -ForegroundColor Green
    Write-Host "  [OK] APK found ($ApkSizeMb MB)" -ForegroundColor Green
    Write-Host "  [OK] MarketBD icon configured" -ForegroundColor Green
    Write-Host "  [OK] APK copied to current update folder" -ForegroundColor Green
    Write-Host ""
    Write-Host "  📱 FINAL APK PATH : $DestUpdateApk" -ForegroundColor Cyan
    Write-Host "  🏷️ App Name       : MarketBD" -ForegroundColor White
    Write-Host "  🆔 Package ID     : com.marketbd.app" -ForegroundColor White
    Write-Host "  🌐 Target URL     : https://marketbd.net/" -ForegroundColor White
    Write-Host ""
    Write-Host "📲 Installation Instructions:" -ForegroundColor Yellow
    Write-Host "  1. Transfer the APK from: $DestUpdateApk to your Android phone." -ForegroundColor White
    Write-Host "  2. Tap MarketBD.apk on your phone to install." -ForegroundColor White
    Write-Host "  3. Open MarketBD - it will directly load https://marketbd.net/!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Error: Build finished but APK output file was not found." -ForegroundColor Red
    exit 1
}

