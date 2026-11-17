import type { DocPage } from "../docs";

export const chip: DocPage = {
	slug: "chip",
	category: "Display",
	title: "Chip",
	summary: "누르거나 지울 수 있는 작은 라벨입니다. `type` 으로 필터 · 입력 · 고정을 고릅니다.",
	when: [
		["목록 필터 (하나 또는 여럿 선택)", 'Chip `type="filter"`', true],
		["입력된 값을 지우기", 'Chip `type="input"`', true],
		["읽기만 하는 상태 표시", "Badge", false],
	],
	examples: [{ id: "chip/filter", title: "필터 · 입력" }],
	props: "ChipProps",
};
