#!/usr/bin/env sh
# copy-scss.sh — Copy SCSS token files to dist (domain-based structure)
set -e

SRC="src/styles"
OUT="dist/styles"

if [ ! -f "$SRC/token.scss" ]; then
  echo "❌ SCSS barrel을 찾을 수 없습니다: $SRC/token.scss" >&2
  exit 1
fi

mkdir -p "$OUT"
cp "$SRC/token.scss" "$OUT/token.scss"

for dir in "$SRC"/*/; do
  domain=$(basename "$dir")
  if ls "$dir"/*.scss 1>/dev/null 2>&1; then
    mkdir -p "$OUT/$domain"
    cp "$dir"/*.scss "$OUT/$domain/"
  fi
done
