#!/usr/bin/env bash
# Publish your changes to aleksandrivanov.com:
#   1. shows what changed   2. checks for private data   3. test-builds the site offline
#   4. commits   5. pushes to GitHub -> Cloudflare publishes in about 2 minutes.
# Nothing is pushed if any step fails.
set -euo pipefail
cd "$(dirname "$0")/.."
IMAGE=docker.io/library/node:22-slim

git add -A
if git diff --cached --quiet; then echo "Nothing changed. Nothing to publish."; exit 0; fi

echo "== Changes to publish =="
git diff --cached --stat
echo

# Private data check: internal IP addresses and MAC addresses in the new text.
if git diff --cached -U0 -- . ':(exclude)package-lock.json' | grep '^+' \
   | grep -nE '\b(10\.[0-9]+|192\.168|172\.(1[6-9]|2[0-9]|3[01]))\.[0-9]+\.[0-9]+\b|\b([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}\b'; then
  echo
  echo "!! The lines above look like internal IP or MAC addresses. The repo is public."
  read -rp "Publish anyway? [y/N] " a; [ "$a" = y ] || { git reset -q; echo "Stopped. Nothing published."; exit 1; }
fi

# Photos can carry GPS location in their metadata. Screenshots usually don't.
photos=$(git diff --cached --name-only --diff-filter=A | grep -iE '\.(jpe?g|heic)$' || true)
if [ -n "$photos" ]; then
  echo "!! New photos: they may contain GPS/location data in the file itself:"
  echo "$photos"
  echo "   Remove it first with:  exiftool -all= <file>   (or export without location)."
  read -rp "Location data already removed? [y/N] " a; [ "$a" = y ] || { git reset -q; echo "Stopped. Nothing published."; exit 1; }
fi
echo "Reminder: check that screenshots don't show IPs, hostnames, usernames or tokens."
echo

echo "== Test build (offline) =="
if ! podman run --rm --network none -v "$PWD":/app:Z -w /app "$IMAGE" npm run build >/tmp/portfolio-build.log 2>&1; then
  tail -n 25 /tmp/portfolio-build.log
  git reset -q
  echo; echo "Build FAILED (details above). Nothing published. The live site is unchanged."
  exit 1
fi
echo "Build OK."
echo

read -rp "Short description of the change [Update content]: " msg
git commit -q -m "${msg:-Update content}"
git push -q
echo "Published. Live at https://aleksandrivanov.com in about 2 minutes."
