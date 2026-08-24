#!/bin/sh
# Prose 제목의 굵기 계층이 단조로운지 빌드 산출물에서 대조한다.
#
# 배경: 제목 굵기는 타이포 믹스인의 **변형 선택**에서 나온다 - 접미사 없음(regular 400) ·
# _medium(500) · _bold(700). h1·h2 에 _bold 를 안 붙였던 적이 있고, 그러면 최상위 제목 두 개가
# 본문과 같은 400 이 되어 h1 이 h3(700)보다 가늘어진다. 실수하기 쉽고 눈으로만 보이는 종류라
# 빌드 CSS 에서 직접 확인한다.
#
# 단위 테스트로는 잡을 수 없다 - jsdom 은 스타일시트를 계산하지 않는다.
#
# 사용: pnpm build && scripts/check-prose-headings.sh
set -eu

REACT_CSS="dist/index.css"
[ -f "$REACT_CSS" ] || { echo "빌드 산출물이 없습니다: $REACT_CSS — 'pnpm build' 를 먼저 실행하세요." >&2; exit 1; }

# 선택자 그룹(`.prose h4,\n.prose h5,\n.prose h6 {`)과 개행을 정규화해 한 줄 = 한 규칙으로 만든다.
norm() {
	tr '\n' ' ' < "$REACT_CSS" | sed -e 's/}/}\n/g' -e 's/  */ /g'
}

# $1 = 접두사(".prose" 또는 ".prose_size_lg"), $2 = 태그
weight_of() {
	norm | grep -F "$1 $2" | grep -o 'font-weight: [0-9]*' | head -n 1 | tr -cd '0-9'
}

fail=0
for scope in ".prose" ".prose_size_lg"; do
	prev=""
	for tag in h1 h2 h3 h4; do
		w=$(weight_of "$scope" "$tag" || true)
		if [ -z "$w" ]; then
			# lg 는 md 규칙을 상속하는 태그가 있을 수 있다 - 그 경우 md 값을 본다.
			w=$(weight_of ".prose" "$tag" || true)
		fi
		if [ -z "$w" ]; then
			echo "$scope $tag 의 font-weight 를 빌드 CSS 에서 찾지 못했습니다." >&2
			fail=1
			continue
		fi
		echo "  $scope $tag  font-weight: $w"
		# 굵기는 위에서 아래로 감소하지 않아야 한다 (h1 >= h2 >= ... )
		if [ -n "$prev" ] && [ "$w" -gt "$prev" ]; then
			echo "$scope: $tag($w) 이 바로 위 단계($prev)보다 굵습니다 - 제목 굵기 계층이 뒤집혔습니다." >&2
			fail=1
		fi
		prev="$w"
	done
done

[ "$fail" -eq 0 ] || exit 1
echo "Prose 제목 굵기 계층 - md · lg 양쪽에서 단조롭습니다."
