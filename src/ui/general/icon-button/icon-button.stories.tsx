import type { Meta, StoryObj } from "@storybook/react";
import type * as React from "react";
import { IconButton } from ".";

const PlusIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
		<path d="M12 5v14M5 12h14" />
	</svg>
);
const CloseIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
		<path d="M18 6L6 18M6 6l12 12" />
	</svg>
);
const SearchIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
		<circle cx="11" cy="11" r="8" />
		<path d="M21 21l-4.35-4.35" />
	</svg>
);

const iconMap = { Plus: <PlusIcon />, Close: <CloseIcon />, Search: <SearchIcon /> };

const meta: Meta<typeof IconButton> = {
	title: "Components/General/IconButton",
	component: IconButton,
	tags: ["autodocs"],
	argTypes: {
		variant: { control: "select", options: ["standard", "filled", "tonal", "outlined"] },
		size: { control: "select", options: ["sm", "md"] },
		icon: { control: "select", options: Object.keys(iconMap), mapping: iconMap },
		disabled: { control: "boolean" },
		onClick: { action: "clicked" },
	},
	args: {
		icon: "Plus" as unknown as React.ReactNode,
		variant: "standard",
		size: "md",
		"aria-label": "추가",
	},
	parameters: {
		docs: {
			description: {
				component: `
**IconButton** - 아이콘만 가진 버튼. \`aria-label\` 이 필수다.

Variants: \`standard\` / \`filled\` / \`tonal\` / \`outlined\`.
크기: \`sm\` 40 (아이콘 20) / \`md\` 48 (아이콘 24).

> ⚠️ **Docs 뷰 안내** - \`standard\` variant 는 배경이 투명이라 부모 색에 의존한다. Storybook Docs 의 스토리 프리뷰 패널은 흰 배경 고정이라, 다크 모드로 토글하면 아이콘이 흰 위에 흰으로 보이지 않을 수 있다. 실제 동작은 좌측 사이드바에서 개별 스토리를 열어 Canvas 뷰에서 확인한다.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof IconButton>;

/**
 * 배경이 투명해 **부모 색을 그대로 물려받는다.** 툴바나 카드 헤더처럼 배경이 이미 정해진
 * 자리에 쓴다 - 색이 정해지지 않은 곳에 두면 대비를 보장할 수 없다.
 *
 * 접근성 이름은 `aria-label`(또는 `aria-labelledby`)이 **타입상 필수**다 - 아이콘만 있어
 * 화면에 읽을 글자가 없기 때문이다.
 */
export const Standard: Story = { args: { variant: "standard" } };

/**
 * 배경이 채워져 주 액션에 쓴다. 한 화면에 여러 개 두지 않는다 - 아이콘만으로 구분되는
 * 강조 버튼이 여럿이면 무엇이 주 액션인지 읽히지 않는다.
 */
export const Filled: Story = { args: { variant: "filled" } };

/** 옅은 강조. `filled` 만큼 튀지 않으면서 배경에 묻히지도 않는 중간 단계다. */
export const Tonal: Story = { args: { variant: "tonal" } };

/** 테두리로 경계를 만든다. `standard` 가 묻히는 자리(이미지 위, 색 배경 위)의 대안이다. */
export const Outlined: Story = { args: { variant: "outlined" } };

/**
 * 잠긴 상태. **`aria-label` 은 잠겨 있어도 그대로 둔다** - 스크린리더가 무엇이 잠겼는지
 * 알려야 한다. 왜 잠겼는지는 버튼이 말하지 못하므로 이유가 필요하면 옆에 문구를 두거나
 * `Tooltip` 을 붙인다(다만 Tooltip 은 터치에서 뜨지 않는다).
 */
export const Disabled: Story = { args: { disabled: true } };
