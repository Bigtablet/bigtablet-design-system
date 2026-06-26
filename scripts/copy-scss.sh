#!/usr/bin/env sh
# copy-scss.sh — Copy SCSS token files to dist (domain-based structure)
set -e

SRC="src/styles"
OUT="dist/styles"

if [ ! -f "$SRC/token.scss" ]; then
  echo "❌ SCSS barrel을 찾을 수 없습니다: $SRC/token.scss" >&2
  exit 1
fi

# 과거 도메인 폴더가 빈 채로 잔류하지 않도록 매 빌드마다 정리(결정적 출력)
rm -rf "$OUT"
mkdir -p "$OUT"
cp "$SRC/token.scss" "$OUT/token.scss"

for dir in "$SRC"/*/; do
  domain=$(basename "$dir")
  if ls "$dir"/*.scss 1>/dev/null 2>&1; then
    mkdir -p "$OUT/$domain"
    cp "$dir"/*.scss "$OUT/$domain/"
  fi
done
