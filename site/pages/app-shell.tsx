import type { DocPage } from "../docs";

export const appShell: DocPage = {
	slug: "app-shell",
	category: "Layout",
	title: "AppShell",
	summary:
		"관리자 · 대시보드 화면의 껍데기입니다. 사이드바 열 + 고정 헤더 + 본문을 한 곳에서 잡습니다.",
	when: [
		["사이드바나 헤더가 있는 관리 화면", "AppShell", true],
		["헤더가 사이드바 위까지 꽉 차야 함", "NavBar 를 AppShell 밖에", false],
		["마케팅 페이지", "Section + Container", false],
	],
	examples: [{ id: "app-shell/admin", title: "관리자 화면", frame: 420 }],
	props: "AppShellProps",
	notes: [
		"문서가 스크롤합니다 - 본문에 `overflow-y: auto` 를 주면 Modal 스크롤 잠금이 본문에 닿지 않습니다",
		"콘텐츠 열은 `minmax(0, 1fr)` 라 긴 자식이 열을 늘리지 않습니다",
		"600px 미만에서 Sidebar 가 하단 바로 바뀌면 본문 끝을 그만큼 띄웁니다",
		'첫 Tab 에 "본문으로 건너뛰기" 링크가 뜹니다',
	],
};
