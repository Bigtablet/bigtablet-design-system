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

missing=$(LC_ALL=C comm -23 "$tmp/documented" "$tmp/built")

if [ -n "$missing" ]; then
	echo "문서에 있으나 어느 번들에도 없는 CSS 변수:"
	echo "$missing" | sed 's/^/  /'
	exit 1
fi

echo "문서의 CSS 변수 $(wc -l < "$tmp/documented" | tr -d ' ')개 - 모두 빌드 산출물에 존재합니다."

# ── 2단계: "React entry 는 이것만 내보낸다" 주장을 검증한다 ─────────────────────
#
# 1단계는 문서→빌드 한 방향만 본다. 그래서 새 변수를 추가하고 THEMING 에만 적으면 통과하는데,
# 아래 세 파일은 목록을 **전부**라고 주장하므로 조용히 거짓이 된다. 실제로
# --bt-bottom-inset-app 을 추가했을 때 세 파일 모두 낡은 채로 1단계를 통과했다.
#
# 검사 대상은 **주장 문장 한 줄** 이다. 파일 전체를 긁으면 코드 예시나 색상 표에 이미 나오는
# --bt-color-* / --bt-elevation-* 가 "언급됨"으로 잡혀, 정작 그 계열을 주장 문장에서 지워도
# 통과한다. 그래서 각 파일의 주장 문장 바로 앞에 sentinel 주석을 두고 그 다음 줄만 본다.
CLAIM_MARK='css-var-claim'
# 네 번째 주장 파일(THEMING)이 실제로 나타났다 - #511 이 예고한 한계다. 같은 주장을 하는
# 파일이 늘면 여기에 추가한다. sentinel 이 없는 파일은 검사가 실패로 알려준다.
CLAIM_FILES="docs/AGENT_GUIDE.md docs/THEMING.md README.md README_KR.md"

# 계열 추출을 awk 로 하는 이유: sed 의 `t` 분기는 BSD(macOS)와 GNU 에서 동작이 갈린다.
families_of() {
	awk '{
		while (match($0, /--bt-[a-z0-9-]*/)) {
			v = substr($0, RSTART + 5, RLENGTH - 5)
			$0 = substr($0, RSTART + RLENGTH)
			# bottom-nav 와 bottom-inset 은 별개 계약이라 한 단어로 합치면 안 된다
			if (v ~ /^bottom-nav/)   { print "bottom-nav";   continue }
			if (v ~ /^bottom-inset/) { print "bottom-inset"; continue }
			sub(/-.*/, "", v)
			if (v != "") print v
		}
	}' | LC_ALL=C sort -u
}

# 번들에서는 **선언**(--bt-x: ...)만 센다. var() 참조나 주석에 이름이 스쳐도 계열로 세지 않는다.
grep -oE -- '--bt-[a-z0-9-]*[[:space:]]*:' "$REACT_CSS" | families_of > "$tmp/families"

fail=0
for f in $CLAIM_FILES; do
	# sentinel 다음 줄 하나만 꺼낸다
	claim=$(grep -A1 -- "$CLAIM_MARK" "$f" | tail -n 1)
	if [ -z "$claim" ]; then
		echo "$f 에 '$CLAIM_MARK' sentinel 이 없습니다 - 주장 문장을 찾을 수 없어 검증 불가." >&2
		fail=1
		continue
	fi
	printf '%s\n' "$claim" | families_of > "$tmp/claimed"
	gap=$(LC_ALL=C comm -23 "$tmp/families" "$tmp/claimed")
	if [ -n "$gap" ]; then
		echo "$f 의 CSS 변수 주장 문장에 빠진 계열:" >&2
		echo "$gap" | sed 's/^/  --bt-/' >&2
		fail=1
	fi
done

[ "$fail" -eq 0 ] || exit 1
echo "React entry 변수 계열 $(wc -l < "$tmp/families" | tr -d ' ')개 - 주장 문장 $(echo $CLAIM_FILES | wc -w | tr -d ' ')곳이 모두 언급합니다."
