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
**IconButton** — A button containing only an icon. \`aria-label\` required. / **IconButton** — 아이콘만 가진 버튼. \`aria-label\` 필수.

Variants: \`standard\` / \`filled\` / \`tonal\` / \`outlined\`.
Sizes: \`sm\` 40 (icon 20 / 아이콘 20) / \`md\` 48 (icon 24 / 아이콘 24).

> ⚠️ **Docs view note / Docs 뷰 안내** — The \`standard\` variant has a transparent background and depends on the parent color. Storybook Docs' story preview panel has a fixed white background, so toggling dark mode may render the icon white-on-white and invisible. To check actual behavior, open an individual story from the left sidebar in Canvas view. / \`standard\` variant 는 배경이 투명이라 부모 색에 의존. Storybook Docs 의 스토리 프리뷰 패널은 흰 배경 고정이라 다크 모드 토글 시 아이콘이 흰 위에 흰으로 안 보일 수 있다. 실제 동작은 좌측 사이드바에서 개별 스토리를 열어 Canvas 뷰에서 확인.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Standard: Story = { args: { variant: "standard" } };
export const Filled: Story = { args: { variant: "filled" } };
export const Tonal: Story = { args: { variant: "tonal" } };
export const Outlined: Story = { args: { variant: "outlined" } };
export const Disabled: Story = { args: { disabled: true } };
