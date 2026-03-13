#!/usr/bin/env sh
# copy-scss.sh — Copy SCSS token files to dist
set -e

SRC="src/styles/scss"
OUT="dist/styles/scss"

if [ ! -d "$SRC" ]; then
  echo "❌ SCSS 소스 디렉터리를 찾을 수 없습니다: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT"
cp -r "$SRC/." "$OUT/"
