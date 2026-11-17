import type { DocPage } from "../docs";

export const filterBar: DocPage = {
	slug: "filter-bar",
	category: "Forms",
	title: "FilterBar",
	summary:
		"목록 화면 위의 필터 묶음입니다. 필터 상태는 갖지 않고 배치 · 초기화 · 적용 버튼만 맡습니다.",
	when: [
		["목록 위 검색 · 필터", "FilterBar", true],
		["목록 화면 전체 (필터 + 표 + 페이지)", "DataView `toolbar.filters`", false],
	],
	examples: [
		{
			id: "filter-bar/basic",
			title: "기본",
			desc: '기본은 Enter · 검색 버튼으로 적용합니다. `submitMode="instant"` 면 바꾸는 즉시 적용하고 버튼이 없습니다.',
		},
	],
	props: "FilterBarProps",
	notes: ["입력 중인 값과 적용된 값, URL 동기화는 앱이 가집니다"],
};
