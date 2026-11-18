$ErrorActionPreference = 'Stop'
# Review before running. No elevation, shell profile changes, or hidden telemetry.
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 18+ first.' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Install Git first.' }
$Dest = Join-Path $HOME '.job-hunter-os-source'
if (Test-Path $Dest) {
    Write-Host "Existing checkout preserved: $Dest. No automatic Git updates."
    if (-not (Test-Path (Join-Path $Dest 'bin/job-hunter.mjs'))) { throw 'Missing CLI; use a fresh reviewed checkout.' }
} else {
    & git clone --depth 1 https://github.com/redasalem/job-hunter-os.git $Dest
    if ($LASTEXITCODE -ne 0) { throw 'Clone failed.' }
}
$Cli = Join-Path $Dest 'bin/job-hunter.mjs'
& node $Cli init --global
if ($LASTEXITCODE -ne 0) { throw 'Installation refused; existing files were preserved.' }
& node $Cli doctor --global
if ($LASTEXITCODE -ne 0) { Write-Host 'Installed; complete CV verification and manual login to become ready.' }
Write-Host "Next: node `"$Cli`" login --global; open your IDE and request /setup."
