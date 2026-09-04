#!/usr/bin/env sh
# build-css-parts.sh — 컴포넌트별 CSS 를 따로 내보낸다.
#
# `dist/index.css`(= `./style.css`)는 전부를 담은 묶음이라 컴포넌트 두 개를 쓰는 앱도 153KB 를
# 싣는다(#589). 여기서 만드는 조각은 그 앱이 필요한 것만 고를 수 있게 한다.
#
#   dist/css/base.css        토큰(:root/dark) + 전역 규칙. **항상 필요하다**
#   dist/css/<component>.css 컴포넌트 하나의 규칙
#
# `dist/styles/` 는 SCSS 토큰 원본(`./scss/token`)이 가는 자리라 CSS 조각은 `dist/css/` 에 둔다.
set -e

OUT="dist/css"
# 조각은 압축해서 낸다. 소비자가 그대로 싣는 파일이고, 확장으로 내면 SCSS 주석 30KB 가 그대로
# 실린다(전체 묶음은 tsup 이 걷어낸다) - 규칙 자체의 차이는 2KB 뿐인데 파일이 23% 커 보였다.
SASS="npx sass --no-source-map --load-path=. --load-path=src --style=compressed"

# 매 빌드마다 정리 - 컴포넌트를 지웠는데 조각이 남으면 소비자가 없는 것을 import 한다.
rm -rf "$OUT"
mkdir -p "$OUT"

# ── base: 토큰 + 전역 ──────────────────────────────────────────────────────────
# src/index.ts 가 번들에 넣는 것과 같은 셋이다. 순서도 같게 유지한다.
BASE_TMP=$(mktemp -t bt-base-XXXXXX).scss
{
  echo '@use "src/styles/theme";'
  echo '@use "src/styles/autofill";'
  echo '@use "src/styles/link";'
} > "$BASE_TMP"
$SASS "$BASE_TMP" "$OUT/base.css"
cat src/styles/global.css >> "$OUT/base.css"
rm -f "$BASE_TMP"

# ── 컴포넌트별 ────────────────────────────────────────────────────────────────
count=0
for style in src/ui/*/*/style.scss; do
  name=$(basename "$(dirname "$style")")
  $SASS "$style" "$OUT/$name.css"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "❌ 컴포넌트 style.scss 를 하나도 찾지 못했다 - 경로 규칙이 바뀌었는지 보라" >&2
  exit 1
fi

# 규약 밖에 놓인 style.scss 는 조각이 안 만들어지고 그 사실이 드러나지도 않는다 - 전체 개수와
# `src/ui/<category>/<component>/style.scss` 개수가 어긋나면 멈춘다.
all=$(find src/ui -name style.scss | wc -l | tr -d ' ')
if [ "$all" -ne "$count" ]; then
  echo "❌ style.scss $all 개 중 $count 개만 조각이 됐다 - src/ui/<카테고리>/<컴포넌트>/style.scss 규약 밖에 놓인 것이 있다" >&2
  find src/ui -name style.scss | grep -vE '^src/ui/[^/]+/[^/]+/style\.scss$' >&2
  exit 1
fi

base_size=$(wc -c < "$OUT/base.css" | tr -d ' ')
total_size=$(cat "$OUT"/*.css | wc -c | tr -d ' ')
echo "CSS 조각 $((count + 1))개 - base ${base_size}B + 컴포넌트 ${count}개 (합 ${total_size}B)"
