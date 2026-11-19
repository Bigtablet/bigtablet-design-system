import type { DocPage } from "../docs";

export const pagination: DocPage = {
	slug: "pagination",
	category: "내비게이션",
	order: 5,
	title: "Pagination",
	name: "페이지 번호",
	summary: "페이지 번호로 목록을 넘깁니다.",
	when: [
		["페이지 단위 목록", "Pagination", true],
		["목록 화면 전체", "DataView `pagination`", false],
	],
	examples: [
		{
			id: "pagination/basic",
			title: "페이지 이동 입력",
			desc: "`showPageJump` 면 번호를 입력해 바로 갑니다.",
		},
	],
	props: "PaginationProps",
};
