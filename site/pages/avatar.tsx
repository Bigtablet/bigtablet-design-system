import type { DocPage } from "../docs";

export const avatar: DocPage = {
	slug: "avatar",
	category: "라벨 · 아이콘",
	order: 2,
	title: "Avatar",
	name: "아바타",
	summary:
		"사람 · 조직의 사진이나 이름 첫 글자를 보여 줍니다. 사진을 못 불러오면 첫 글자로 바뀝니다.",
	when: [
		["사용자 · 담당자 표시", "Avatar", true],
		["상태 점만", 'Badge `shape="dot"`', false],
	],
	examples: [{ id: "avatar/basic", title: "크기 · 모양" }],
	props: "AvatarProps",
	playground: { base: { name: "박상민" } },
};
