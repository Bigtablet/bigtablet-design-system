import type { DocPage } from "../docs";

export const switchPage: DocPage = {
	slug: "switch",
	category: "선택",
	order: 4,
	title: "Switch",
	name: "스위치",
	summary:
		"바로 적용되는 켜기 / 끄기 스위치입니다. 보이는 라벨이 없으므로 `ariaLabel` 이 필수입니다.",
	when: [
		["누르는 즉시 적용되는 설정", "Switch", true],
		["저장 버튼을 눌러야 적용되는 동의 · 선택", "Checkbox", false],
	],
	examples: [{ id: "switch/basic", title: "기본" }],
	props: "SwitchProps",
	notes: [
		"4.15.0 전 이름은 `Toggle` 입니다 - 같은 컴포넌트를 가리키는 deprecated 별칭으로 남아 있습니다",
	],
	playground: { base: { ariaLabel: "알림 받기" }, omit: ["checked", "defaultChecked"] },
};
