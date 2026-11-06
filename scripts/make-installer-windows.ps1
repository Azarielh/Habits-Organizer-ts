$ErrorActionPreference = "Stop"

Push-Location (Join-Path $PSScriptRoot "..")
try {
    & bun scripts/build-windows.ts
    if ($LASTEXITCODE -ne 0) {
        throw "Could not build the standalone Windows application."
    }

    $compiler = Get-Command ISCC.exe -ErrorAction SilentlyContinue
    $compilerPath = if ($compiler) { $compiler.Source } else { $null }

    if (-not $compilerPath) {
        $knownPaths = @(
            (Join-Path $env:ProgramFiles "Inno Setup 6\ISCC.exe"),
            (Join-Path ${env:ProgramFiles(x86)} "Inno Setup 6\ISCC.exe")
        )
        $compilerPath = $knownPaths | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    }

    if (-not $compilerPath) {
        throw "Inno Setup 6 was not found. Install it from https://jrsoftware.org/isinfo.php, then run this command again."
    }

    & $compilerPath "installer/HabitsOrganizer.iss"
    if ($LASTEXITCODE -ne 0) {
        throw "Inno Setup could not create the installer."
    }

    Write-Host "Installer created at dist/installer/HabitsOrganizer-Setup.exe"
}
finally {
    Pop-Location
}
