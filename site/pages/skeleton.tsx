import type { DocPage } from "../docs";

export const skeleton: DocPage = {
	slug: "skeleton",
	category: "로딩",
	order: 1,
	title: "Skeleton",
	name: "스켈레톤",
	summary: "불러오는 동안 내용 자리를 회색 모양으로 잡아 둡니다.",
	when: [
		["모양을 아는 내용을 불러오는 중", "Skeleton", true],
		["모양을 모르거나 아주 짧은 대기", "Spinner", false],
		["표 불러오기", "Table `isLoading`", false],
	],
	examples: [{ id: "skeleton/card", title: "카드 자리" }],
	props: "SkeletonProps",
};
