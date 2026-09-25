#!/usr/bin/env bash
# Renderar policydokumenten i docs/policy till PDF i public/policy, som Vite
# publicerar med spelet. Kör efter varje ändring i en policy och committa PDF:erna.
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p public/policy
for src in docs/policy/*.html; do
  name="$(basename "$src" .html)"
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="public/policy/$name.pdf" "file://$PWD/$src" 2>/dev/null
  echo "public/policy/$name.pdf"
done
