#!/bin/sh
# 문서에 적힌 --bt-* CSS 변수가 실제 빌드 산출물에 있는지 대조한다.
#
# 배경: 컴포넌트가 내보내는 CSS 변수 목록은 손으로 관리하면 반드시 낡는다.
# React 번들(dist/index.css)과 Vanilla 번들(dist/vanilla/bigtablet.min.css)이
# 서로 다른 변수 집합을 갖기 때문에 둘 다 대조해야 한다.
#
# 사용: pnpm build && scripts/check-css-vars.sh
set -eu

REACT_CSS="dist/index.css"
VANILLA_CSS="dist/vanilla/bigtablet.min.css"

for f in "$REACT_CSS" "$VANILLA_CSS"; do
	[ -f "$f" ] || { echo "빌드 산출물이 없습니다: $f — 'pnpm build' 를 먼저 실행하세요." >&2; exit 1; }
done

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# 루트 README 도 같은 변수 목록을 싣고 있어 함께 본다 - 한쪽만 갱신하면 문서끼리 갈린다.
#
# 이름이 잘린 조각(`--bt-`, `--bt-color-` 같은 접두사 표기)은 대조 대상이 아니다.
# 반대로 `--bt-focus-ring-error` / `-success` 같은 축약 표기의 뒷부분은 `--bt-` 로 시작하지
# 않아 여기 걸리지 않는다. 문서에서는 풀네임으로 적어야 검증 대상이 된다.
#
# comm 은 두 입력이 같은 바이트 순서라고 가정하므로 로케일을 C 로 고정한다.
grep -rho -- '--bt-[a-z0-9-]*' docs/*.md README.md README_KR.md \
	| grep -v -- '-$' | LC_ALL=C sort -u > "$tmp/documented"
cat "$REACT_CSS" "$VANILLA_CSS" | grep -o -- '--bt-[a-z0-9-]*' | LC_ALL=C sort -u > "$tmp/built"

missing=$(comm -23 "$tmp/documented" "$tmp/built")

if [ -n "$missing" ]; then
	echo "문서에 있으나 어느 번들에도 없는 CSS 변수:"
	echo "$missing" | sed 's/^/  /'
	exit 1
fi

echo "문서의 CSS 변수 $(wc -l < "$tmp/documented" | tr -d ' ')개 - 모두 빌드 산출물에 존재합니다."
