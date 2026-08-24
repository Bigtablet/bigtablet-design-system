#!/bin/sh
# Prose 의 모든 제목이 bold(700)인지 빌드 산출물에서 대조한다.
#
# 배경: 제목 굵기는 타이포 믹스인의 **변형 선택**에서 나온다 - 접미사 없음(regular 400) ·
# _medium(500) · _bold(700). h1·h2 에 _bold 를 안 붙였던 적이 있고(#518), 그러면 최상위 제목
# 두 개가 본문과 같은 400 이 되어 h1 이 h3(700)보다 가늘어진다. 실수하기 쉽고 눈으로만 보이는
# 종류라 빌드 CSS 에서 직접 확인한다.
#
# "단조 증가" 대신 "전부 700" 을 본다 - 전자는 모든 제목이 400 이어도 통과한다.
#
# 단위 테스트로는 잡을 수 없다 - jsdom 은 스타일시트를 계산하지 않는다.
#
# 사용: pnpm build && scripts/check-prose-headings.sh  (= pnpm check:prose)
set -eu

REACT_CSS="dist/index.css"
[ -f "$REACT_CSS" ] || { echo "빌드 산출물이 없습니다: $REACT_CSS — 'pnpm build' 를 먼저 실행하세요." >&2; exit 1; }

EXPECTED=700

# 규칙 단위로 쪼개 "선택자|font-weight" 를 뽑는다.
#
# awk 로 하는 이유: `sed 's/}/}\n/g'` 의 치환 `\n` 은 GNU 확장이라 BSD sed 에서 동작이 갈린다
# (이 저장소에서 sed 의 `t` 분기로 이미 한 번 겪었다).
#
# 콜론 뒤 공백은 optional 이다. 지금 React entry 는 minify 를 켜지 않아(tsup.config.ts 의
# minify: true 는 vanilla entry 전용) dart-sass expanded 출력이 그대로 나오지만, 나중에
# minify 가 붙어 공백이 사라져도 이 검사가 조용히 "못 찾음" 으로 바뀌지 않게 한다.
rules() {
	awk '
		{ buf = buf " " $0 }
		END {
			n = split(buf, parts, "}")
			for (i = 1; i <= n; i++) {
				p = parts[i]
				if (index(p, "{") == 0) continue
				sel  = substr(p, 1, index(p, "{") - 1)
				body = substr(p, index(p, "{") + 1)
				if (match(body, /font-weight:[ ]*[0-9]+/) == 0) continue
				fw = substr(body, RSTART, RLENGTH)
				gsub(/[^0-9]/, "", fw)
				gsub(/[ \t]+/, " ", sel)
				print sel "|" fw
			}
		}
	' "$REACT_CSS"
}

RULES=$(rules)

fail=0
for scope in ".prose" ".prose_size_lg"; do
	for tag in h1 h2 h3 h4 h5 h6; do
		# 선택자 그룹(`.prose h4, .prose h5, .prose h6`) 안에 있어도 잡히도록 부분 일치로 찾되,
		# 콤마로 끊어 정확히 그 선택자인 항목만 본다.
		w=$(printf '%s\n' "$RULES" | awk -v want="$scope $tag" -F'|' '
			{
				n = split($1, sels, ",")
				for (i = 1; i <= n; i++) {
					s = sels[i]
					gsub(/^[ \t]+|[ \t]+$/, "", s)
					if (s == want) { print $2; exit }
				}
			}' | head -n 1)

		# lg 가 자기 규칙 없이 md 를 상속하는 태그는 md 값을 본다.
		if [ -z "$w" ] && [ "$scope" != ".prose" ]; then
			w=$(printf '%s\n' "$RULES" | awk -v want=".prose $tag" -F'|' '
				{
					n = split($1, sels, ",")
					for (i = 1; i <= n; i++) {
						s = sels[i]
						gsub(/^[ \t]+|[ \t]+$/, "", s)
						if (s == want) { print $2; exit }
					}
				}' | head -n 1)
		fi

		if [ -z "$w" ]; then
			echo "$scope $tag 의 font-weight 를 빌드 CSS 에서 찾지 못했습니다." >&2
			fail=1
			continue
		fi
		if [ "$w" != "$EXPECTED" ]; then
			echo "$scope $tag 의 font-weight 가 $w 입니다 (기대: $EXPECTED) - bold 변형을 쓰지 않았습니다." >&2
			fail=1
			continue
		fi
		echo "  $scope $tag  font-weight: $w"
	done
done

[ "$fail" -eq 0 ] || exit 1
echo "Prose 제목 12개(md·lg × h1~h6) 전부 font-weight: $EXPECTED 입니다."
