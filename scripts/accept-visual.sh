#!/bin/sh
# 시각 회귀 기준 이미지를 CI 실행의 스크린샷으로 갱신한다 (#879).
#
# 기준 이미지는 CI 와 같은 Playwright 이미지(linux)에서 만든 것만 쓴다 - 로컬(맥) 렌더는 폰트·안티앨리어싱이
# 달라 기준이 될 수 없다. 그래서 갱신은 "CI 가 실패하며 남긴 스크린샷을 받아 기준 자리에 넣는" 방식이다.
#
#   - 기준이 없던 스크린샷: `<name>-reference-chromium-linux.png` 로 남는다
#   - 기준과 달라진 스크린샷: `<name>-actual-chromium-linux.png` 로 남는다 (차이 이미지는 `-diff-`)
#
# 둘 다 `<name>-chromium-linux.png` 로 이름을 바꿔 `src/test/__visual__/<테스트파일>/` 에 넣는다.
# **의도한 렌더 변경일 때만** 쓴다 - 받은 이미지를 열어 보고 커밋한다.
#
# 사용: pnpm visual:accept <run-id>     (run-id 는 실패한 CI 실행의 Actions URL 숫자)
set -eu

RUN_ID=${1:?"사용: pnpm visual:accept <run-id>"}
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

gh run download "$RUN_ID" --name visual-screenshots --dir "$TMP"

count=0
for file in $(find "$TMP" -name '*-reference-chromium-linux.png' -o -name '*-actual-chromium-linux.png'); do
	test_file=$(basename "$(dirname "$file")")
	name=$(basename "$file" | sed -e 's/-reference-chromium-linux\.png$/-chromium-linux.png/' -e 's/-actual-chromium-linux\.png$/-chromium-linux.png/')
	dest="src/test/__visual__/$test_file"
	mkdir -p "$dest"
	cp "$file" "$dest/$name"
	echo "  $dest/$name"
	count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
	echo "artifact 에 갱신할 스크린샷이 없다 - 실패한 visual 실행의 run-id 인지 확인할 것" >&2
	exit 1
fi
echo "기준 이미지 $count 개를 갱신했다. 열어 보고 의도한 변경이면 커밋한다."
