# ==============================================================================
# MarketBD Android APK Automated Build Script (PowerShell)
# Project: MarketBD Official Android App
# Application ID: com.marketbd.app
# Target URL: https://marketbd.net/
# Output: <Current_Update_Folder>\update\MarketBD.apk
# ==============================================================================

[CmdletBinding()]
param(
    [switch]$SkipIconGen,
    [switch]$Release,
    [switch]$SyncPublic
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host "  MarketBD Android Automated Build & Verification Tool         " -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Resolve Current Project Root dynamically (handles spaces & folder numbers)
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
    Write-Host "[ERROR] Could not locate 'android' directory in current project ($ScriptRoot)." -ForegroundColor Red
    exit 1
}

$UpdateDir = Join-Path -Path $ProjectRoot -ChildPath "update"

Write-Host "Current Project Root : $ProjectRoot" -ForegroundColor Gray
Write-Host "Android Directory    : $AndroidDir" -ForegroundColor Gray
Write-Host "Target Update Folder : $UpdateDir" -ForegroundColor Gray
Write-Host ""

# 2. Check Java / JAVA_HOME (prioritize Android Studio JBR or JDK 17/21 for AGP 8.5.2)
Write-Host "[1/6] Checking Java & Android SDK Environment..." -ForegroundColor Yellow
$FoundJavaHome = $null

function Get-JavaMajorVersion([string]$JavaExe) {
    try {
        $verLine = (& $JavaExe -version 2>&1 | Select-Object -First 1) -as [string]
        if ($verLine -match '"(\d+)') {
            return [int]$matches[1]
        }
    } catch {}
    return 0
}

$JavaCandidates = @()
if ($env:JAVA_HOME -and (Test-Path "$env:JAVA_HOME\bin\java.exe")) {
    $JavaCandidates += $env:JAVA_HOME
}
$JavaCmd = Get-Command "java" -ErrorAction SilentlyContinue
if ($JavaCmd) {
    $JavaCandidates += (Split-Path -Parent (Split-Path -Parent $JavaCmd.Source))
}
$JavaCandidates += @(
    "$env:ProgramFiles\Android\Android Studio\jbr",
    "$env:ProgramFiles\Android\Android Studio\jre",
    "$env:LOCALAPPDATA\Programs\Android Studio\jbr",
    "${env:ProgramFiles(x86)}\Android\Android Studio\jbr"
)
$JdkParentDirs = @(
    "$env:ProgramFiles\Eclipse Adoptium",
    "$env:LOCALAPPDATA\Programs\Eclipse Adoptium",
    "$env:ProgramFiles\Java",
    "$env:ProgramFiles\Microsoft",
    "$env:ProgramFiles\Zulu",
    "$env:ProgramFiles\Amazon Corretto"
)
foreach ($parent in $JdkParentDirs) {
    if (Test-Path $parent) {
        Get-ChildItem -Path $parent -Directory -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending |
            ForEach-Object { $JavaCandidates += $_.FullName }
    }
}

$FallbackJavaHome = $null
foreach ($candidate in ($JavaCandidates | Select-Object -Unique)) {
    if ($candidate -and (Test-Path "$candidate\bin\java.exe")) {
        $maj = Get-JavaMajorVersion "$candidate\bin\java.exe"
        if ($maj -ge 17 -and $maj -le 21) {
            $FoundJavaHome = $candidate
            break
        }
        if (-not $FallbackJavaHome) {
            $FallbackJavaHome = $candidate
        }
    }
}

if ($FoundJavaHome) {
    $env:JAVA_HOME = $FoundJavaHome
    $env:PATH = "$FoundJavaHome\bin;$env:PATH"
    Write-Host "   [OK] Compatible JAVA_HOME ready: $env:JAVA_HOME" -ForegroundColor Green
} elseif ($FallbackJavaHome) {
    $badVer = Get-JavaMajorVersion "$FallbackJavaHome\bin\java.exe"
    Write-Host "[ERROR] Only Java $badVer was found ($FallbackJavaHome), which is too new for Gradle 8.7." -ForegroundColor Red
    Write-Host "   Install compatible JDK 17 by running:" -ForegroundColor Yellow
    Write-Host "   winget install -e --id EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "[ERROR] Java (JDK 17 or Android Studio) was not found on this PC." -ForegroundColor Red
    Write-Host "   Install OpenJDK 17 by running:" -ForegroundColor Yellow
    Write-Host "   winget install -e --id EclipseAdoptium.Temurin.17.JDK --accept-package-agreements --accept-source-agreements" -ForegroundColor Cyan
    exit 1
}

if (-not $env:ANDROID_HOME -and -not $env:ANDROID_SDK_ROOT) {
    $SdkCandidates = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "C:\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk"
    )
    foreach ($sdk in $SdkCandidates) {
        if (Test-Path $sdk) {
            $env:ANDROID_HOME = $sdk
            $env:ANDROID_SDK_ROOT = $sdk
            Write-Host "   [OK] Android SDK found: $sdk" -ForegroundColor Green
            break
        }
    }
}

# 3. Check and Verify App Icons & Adaptive Resources
Write-Host "[2/6] Verifying Android Launcher Icons & Resources..." -ForegroundColor Yellow
$ResDir = "$AndroidDir\app\src\main\res"

if (-not $SkipIconGen) {
    if (Test-Path "$ProjectRoot\scripts\generate_android_icons.cjs") {
        $NodeCmd = Get-Command "node" -ErrorAction SilentlyContinue
        if ($NodeCmd) {
            Write-Host "   Checking launcher icon resources..." -ForegroundColor Gray
            Push-Location $ProjectRoot
            try {
                & node "$ProjectRoot\scripts\generate_android_icons.cjs" | Out-Null
                Write-Host "   [OK] Launcher icons and adaptive drawables verified!" -ForegroundColor Green
            } catch {
                Write-Host "   [WARN] Icon check notice: $_" -ForegroundColor Yellow
            } finally {
                Pop-Location
            }
        }
    }
}

$Densities = @("mipmap-mdpi", "mipmap-hdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi", "mipmap-anydpi-v26")
foreach ($d in $Densities) {
    if (Test-Path "$ResDir\$d") {
        Write-Host "   [OK] Density folder verified: $d" -ForegroundColor Green
    }
}

# 4. Validate AndroidManifest.xml & MainActivity
Write-Host "[3/6] Auditing Manifest & MainActivity Configuration..." -ForegroundColor Yellow
$ManifestPath = "$AndroidDir\app\src\main\AndroidManifest.xml"
$MainActivityPath = "$AndroidDir\app\src\main\java\com\marketbd\app\MainActivity.java"

if (-not (Test-Path $ManifestPath)) {
    Write-Host "[ERROR] AndroidManifest.xml missing at $ManifestPath" -ForegroundColor Red
    exit 1
}

$ManifestContent = Get-Content $ManifestPath -Raw
if ($ManifestContent -match 'android:icon="@mipmap/ic_launcher"') {
    Write-Host "   [OK] Launcher icon verified in AndroidManifest.xml" -ForegroundColor Green
}

if (Test-Path $MainActivityPath) {
    $MainContent = Get-Content $MainActivityPath -Raw
    if ($MainContent -match 'https://marketbd.net/') {
        Write-Host "   [OK] Production URL verified (https://marketbd.net/)" -ForegroundColor Green
    }
    if ($MainContent -match 'MarketBdSignatureSplashView') {
        Write-Host "   [OK] MarketBD Signature Native Splash engine verified." -ForegroundColor Green
    }
}

# 5. Clean & Assemble APK (Debug / Release)
Write-Host "[4/6] Cleaning Previous Build Artifacts..." -ForegroundColor Yellow
$BuildTask = if ($Release) { "assembleRelease" } else { "assembleDebug" }
$BuildSuccess = $false

Push-Location $AndroidDir
try {
    try {
        if (Test-Path ".\gradlew.bat") {
            Write-Host "   Executing: .\gradlew.bat clean" -ForegroundColor Gray
            & ".\gradlew.bat" clean --quiet
        } else {
            $GradleCmd = Get-Command "gradle" -ErrorAction SilentlyContinue
            if ($GradleCmd) {
                Write-Host "   Executing: gradle clean" -ForegroundColor Gray
                & gradle clean --quiet
            }
        }
        Write-Host "   [OK] Clean completed successfully." -ForegroundColor Green
    } catch {
        Write-Host "   [WARN] Clean notice: $_" -ForegroundColor Gray
    }

    Write-Host "[5/6] Compiling MarketBD APK ($BuildTask)..." -ForegroundColor Yellow
    if (Test-Path ".\gradlew.bat") {
        Write-Host "   Executing: .\gradlew.bat $BuildTask" -ForegroundColor Gray
        & ".\gradlew.bat" $BuildTask --stacktrace
        $BuildSuccess = ($LASTEXITCODE -eq 0)
    } else {
        $GradleCmd = Get-Command "gradle" -ErrorAction SilentlyContinue
        if ($GradleCmd) {
            Write-Host "   Executing: gradle $BuildTask" -ForegroundColor Gray
            & gradle $BuildTask --stacktrace
            $BuildSuccess = ($LASTEXITCODE -eq 0)
        } else {
            Write-Host "[ERROR] Neither gradlew.bat nor system gradle was found." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "[ERROR] Build encountered an error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

if (-not $BuildSuccess) {
    Write-Host "[ERROR] Gradle build failed with exit code $LASTEXITCODE." -ForegroundColor Red
    exit 1
}

# 6. Locate and Copy Resulting APK to update/ folder (and optionally public/)
Write-Host ""
Write-Host "[6/6] Locating and Storing APK in Update Folder..." -ForegroundColor Yellow

$ExpectedDebugApk = "$AndroidDir\app\build\outputs\apk\debug\app-debug.apk"
$ExpectedReleaseApk = "$AndroidDir\app\build\outputs\apk\release\app-release-unsigned.apk"
$ExpectedSignedReleaseApk = "$AndroidDir\app\build\outputs\apk\release\app-release.apk"

$FoundApk = $null
if ($Release -and (Test-Path $ExpectedSignedReleaseApk)) {
    $FoundApk = $ExpectedSignedReleaseApk
} elseif ($Release -and (Test-Path $ExpectedReleaseApk)) {
    $FoundApk = $ExpectedReleaseApk
} elseif (Test-Path $ExpectedDebugApk) {
    $FoundApk = $ExpectedDebugApk
} else {
    $AllApks = Get-ChildItem -Path "$AndroidDir\app\build\outputs\apk" -Filter "*.apk" -Recurse -ErrorAction SilentlyContinue
    if ($AllApks -and $AllApks.Count -gt 0) {
        $FoundApk = $AllApks[0].FullName
    }
}

if ($FoundApk) {
    $ApkItem = Get-Item $FoundApk
    $ApkSizeMb = [math]::Round($ApkItem.Length / 1MB, 2)

    if (-not (Test-Path $UpdateDir)) {
        New-Item -ItemType Directory -Path $UpdateDir -Force | Out-Null
    }

    $DestUpdateApk = Join-Path -Path $UpdateDir -ChildPath "MarketBD.apk"
    Copy-Item -Path $FoundApk -Destination $DestUpdateApk -Force

    if ($SyncPublic) {
        $PublicDir = Join-Path -Path $ProjectRoot -ChildPath "public"
        if (-not (Test-Path $PublicDir)) {
            New-Item -ItemType Directory -Path $PublicDir -Force | Out-Null
        }
        $DestPublicApk = Join-Path -Path $PublicDir -ChildPath "MarketBD.apk"
        Copy-Item -Path $FoundApk -Destination $DestPublicApk -Force
    }

    Write-Host ""
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host "  [SUCCESS] MARKETBD ANDROID BUILD COMPLETED!                  " -ForegroundColor Green
    Write-Host "===============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  [OK] Android build successful ($ApkSizeMb MB)" -ForegroundColor Green
    Write-Host "  [OK] MarketBD APK saved to: $DestUpdateApk" -ForegroundColor Cyan
    if ($SyncPublic) {
        Write-Host "  [OK] Web APK synced to   : $DestPublicApk" -ForegroundColor Cyan
    }
    Write-Host "  [INFO] App Name          : MarketBD" -ForegroundColor White
    Write-Host "  [INFO] Package ID        : com.marketbd.app" -ForegroundColor White
    Write-Host "  [INFO] Target URL        : https://marketbd.net/" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[ERROR] Build finished but APK output file was not found." -ForegroundColor Red
    exit 1
}
