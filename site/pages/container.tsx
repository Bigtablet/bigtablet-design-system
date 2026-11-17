import type { DocPage } from "../docs";

export const container: DocPage = {
	slug: "container",
	category: "레이아웃",
	order: 2,
	title: "Container",
	name: "폭 제한",
	summary: "가로 폭을 제한하고 가운데 정렬합니다. 화면 폭에 맞춰 좌우 여백이 바뀝니다.",
	when: [
		["페이지 · 섹션의 가로 폭 제한", "Container", true],
		["세로 여백 · 배경색이 필요함", "Section 을 한 단계 위에", false],
		["읽기 좋은 본문 폭", '`size="md"` (768px)', true],
	],
	examples: [{ id: "container/sizes", title: "크기" }],
	props: "ContainerProps",
};
