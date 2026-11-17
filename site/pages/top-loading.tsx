import type { DocPage } from "../docs";

export const topLoading: DocPage = {
	slug: "top-loading",
	category: "Feedback",
	title: "TopLoading",
	summary: "화면 맨 위에 붙는 얇은 진행 줄입니다.",
	when: [
		["페이지 이동 · 큰 저장", "TopLoading", true],
		["영역 하나의 대기", "Spinner · Skeleton", false],
	],
	examples: [{ id: "top-loading/basic", title: "불러오기" }],
	props: "TopLoadingProps",
	notes: [
		"`progress`(0~100)를 주면 그 값만큼, 없으면 끝을 모르는 진행으로 흐릅니다. `isLoading` 이 false 면 사라집니다",
	],
};
