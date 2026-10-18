#!/usr/bin/env bash
# Live preview of the site at http://localhost:4321 while you edit in Obsidian.
# Runs inside a rootless Podman container that can only see this project folder.
# Stop with Ctrl+C.
set -euo pipefail
cd "$(dirname "$0")/.."
IMAGE=docker.io/library/node:22-slim
if [ ! -d node_modules ]; then
  echo "First run: installing the locked dependencies..."
  podman run --rm -v "$PWD":/app:Z -w /app "$IMAGE" npm ci
fi
echo "Preview: http://localhost:4321  (Ctrl+C to stop)"
podman run --rm -it -v "$PWD":/app:Z -w /app -p 127.0.0.1:4321:4321 "$IMAGE" npm run dev
