import type { DocPage } from "../docs";

export const icon: DocPage = {
	slug: "icon",
	category: "Display",
	title: "Icon",
	summary: "lucide 아이콘을 icon 토큰 크기로 그립니다. 색은 글자색을 따릅니다.",
	when: [
		["토큰 크기로 아이콘 표시", "Icon", true],
		["아이콘만 있는 버튼", "IconButton", false],
	],
	examples: [{ id: "icon/basic", title: "크기" }],
	props: "IconProps",
	notes: ["뜻을 가진 아이콘이면 옆에 글자를 두거나 `aria-label` 을 줍니다"],
};
