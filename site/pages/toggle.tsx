import type { DocPage } from "../docs";

export const toggle: DocPage = {
	slug: "toggle",
	category: "선택",
	order: 4,
	title: "Toggle",
	name: "스위치",
	summary:
		"바로 적용되는 켜기 / 끄기 스위치입니다. 보이는 라벨이 없으므로 `ariaLabel` 이 필수입니다.",
	when: [
		["누르는 즉시 적용되는 설정", "Toggle", true],
		["저장 버튼을 눌러야 적용되는 동의 · 선택", "Checkbox", false],
	],
	examples: [{ id: "toggle/basic", title: "기본" }],
	props: "ToggleProps",
	playground: { base: { ariaLabel: "알림 받기" }, omit: ["checked", "defaultChecked"] },
};
