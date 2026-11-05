#!/usr/bin/env sh
# build-vanilla.sh — Compile vanilla CSS and copy JS/examples to dist
set -e

SRC="src/vanilla"
OUT="dist/vanilla"

# ── Source validation ─────────────────────────────────────────────────────────
if [ ! -f "$SRC/bigtablet.scss" ]; then
  echo "❌ 소스 파일을 찾을 수 없습니다: $SRC/bigtablet.scss" >&2
  exit 1
fi

if [ ! -f "$SRC/bigtablet.js" ]; then
  echo "❌ 소스 파일을 찾을 수 없습니다: $SRC/bigtablet.js" >&2
  exit 1
fi

# ── Error trap ────────────────────────────────────────────────────────────────
cleanup() {
  echo "❌ 빌드 중 오류가 발생했습니다. dist/vanilla 출력이 불완전할 수 있습니다." >&2
}
trap cleanup EXIT

mkdir -p "$OUT"

# ── Compile SCSS → CSS (full + minified) ──────────────────────────────────────
npx sass --no-source-map --load-path=. --load-path=src \
  "$SRC/bigtablet.scss" "$OUT/bigtablet.css"

npx sass --no-source-map --load-path=. --load-path=src --style=compressed \
  "$SRC/bigtablet.scss" "$OUT/bigtablet.min.css"

echo "✓ Vanilla CSS compiled"

# ── Bundle JS (비압축본 - examples/ 가 읽는다. 배포물은 tsup 이 만드는 bigtablet.min.js) ──────────
# 소스는 ES 모듈 여러 개라(#926) 원본 복사로는 <script> 에서 돌지 않는다 - tsup 과 같은 IIFE 로 묶는다.
npx esbuild "$SRC/bigtablet.js" --bundle --format=iife --global-name=Bigtablet \
  --legal-comments=inline --log-level=warning --outfile="$OUT/bigtablet.js"
echo "✓ Vanilla JS bundled"

# ── Copy examples (if present) ────────────────────────────────────────────────
if [ -d "$SRC/examples" ]; then
  mkdir -p "$OUT/examples"
  cp -r "$SRC/examples/." "$OUT/examples/"
  echo "✓ Examples copied"
fi

# ── Done (clear error trap) ───────────────────────────────────────────────────
trap - EXIT

printf "\n📦 Vanilla build complete!\n"
printf "  %s\n" \
  "dist/vanilla/bigtablet.css" \
  "dist/vanilla/bigtablet.min.css" \
  "dist/vanilla/bigtablet.js" \
  "dist/vanilla/bigtablet.min.js"
