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

# ── JS ────────────────────────────────────────────────────────────────────────
# bigtablet.js(비압축) · bigtablet.min.js 둘 다 tsup 이 IIFE(`var Bigtablet = …`)로 만든다 (tsup.config.ts) -
# 소스가 ES 모듈 여러 개라(#926) 원본 복사로는 <script> 에서 돌지 않는다.
# 예전 소스의 UMD 래퍼가 하던 CommonJS · AMD 경로를 파일 끝에 잇는다 - `exports["./vanilla"]` 로 공개된 파일이라
# <script> 밖(require · RequireJS) 소비도 깨지면 안 된다. 전역 `Bigtablet` 은 IIFE 가 그대로 만든다.
for f in "$OUT/bigtablet.js" "$OUT/bigtablet.min.js"; do
  if [ ! -f "$f" ]; then
    echo "❌ tsup 산출물이 없습니다: $f (pnpm build 는 tsup 을 먼저 돌린다)" >&2
    exit 1
  fi
  printf '%s\n' 'typeof module=="object"&&module.exports?module.exports=Bigtablet:typeof define=="function"&&define.amd&&define(function(){return Bigtablet});' >> "$f"
done
echo "✓ Vanilla JS UMD footer appended"

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
