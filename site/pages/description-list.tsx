import type { DocPage } from "../docs";

export const descriptionList: DocPage = {
	slug: "description-list",
	category: "데이터",
	order: 2,
	title: "DescriptionList",
	name: "상세 정보",
	summary: '한 항목의 속성을 "이름: 값" 으로 나열합니다. `<dl>` 로 렌더합니다.',
	when: [
		["주문 · 사용자 상세", "DescriptionList", true],
		["여러 항목을 열로 비교", "Table", false],
	],
	examples: [
		{
			id: "description-list/basic",
			title: "상세 정보",
			desc: "`full` 인 항목은 한 줄을 다 씁니다.",
		},
	],
	props: "DescriptionListProps",
};
