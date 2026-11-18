#!/usr/bin/env bash
set -euo pipefail
# Review this script before executing; no sudo, profile edits or hidden telemetry.
command -v node >/dev/null || { printf 'Install Node.js 18+ first.\n'; exit 1; }
command -v git >/dev/null || { printf 'Install Git first.\n'; exit 1; }
DEST="${HOME}/.job-hunter-os-source"
if [ -e "$DEST" ]; then
  printf 'Existing installer checkout preserved: %s\nNo automatic Git updates. Use a fresh reviewed checkout to upgrade.\n' "$DEST"
  [ -f "$DEST/bin/job-hunter.mjs" ] || { printf 'Missing CLI; choose a fresh checkout.\n'; exit 1; }
else
  git clone --depth 1 https://github.com/redasalem/job-hunter-os.git "$DEST"
fi
node "$DEST/bin/job-hunter.mjs" init --global
if node "$DEST/bin/job-hunter.mjs" doctor --global; then
  printf 'Checks passed.\n'
else
  printf 'Installed; readiness is incomplete until you supply verified CV/answers and log in.\n'
fi
printf 'Next: node "%s/bin/job-hunter.mjs" login --global; open your IDE and request /setup.\n' "$DEST"
