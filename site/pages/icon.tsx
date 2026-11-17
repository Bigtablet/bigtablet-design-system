import type { DocPage } from "../docs";

export const icon: DocPage = {
	slug: "icon",
	category: "라벨 · 아이콘",
	order: 3,
	title: "Icon",
	summary: "lucide 아이콘을 그립니다. 크기는 `iconSize` 토큰으로 주고, 색은 글자색을 따릅니다. 이름이 없으면 스크린리더에서 숨깁니다.",
	when: [
		["토큰 크기로 아이콘 표시", "Icon", true],
		["아이콘만 있는 버튼", "IconButton", false],
	],
	examples: [{ id: "icon/basic", title: "크기" }],
	props: "IconProps",
	notes: ["뜻을 가진 아이콘이면 옆에 글자를 두거나 `aria-label` 을 줍니다"],
};
