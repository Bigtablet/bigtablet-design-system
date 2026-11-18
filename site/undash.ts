/**
 * 소스 주석은 "라벨 - 설명" 처럼 대시로 잇는다. 문서에는 대시를 쓰지 않으므로 보여 줄 때만 바꾼다 -
 * 사이에 끼면 쌍점, 숫자 범위(2–4)는 물결. 원본 주석은 그대로 둔다
 */
export function undash(text: string) {
	return text
		.replace(/(\d)\s*[–—]\s*(\d)/g, "$1~$2")
		.replace(/\s+[-–—]\s+/g, ": ")
		.replace(/\s+[-–—]$/, "");
}
