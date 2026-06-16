import type { Meta, StoryObj } from "@storybook/react";
import { ListItem } from ".";

const meta: Meta<typeof ListItem> = {
	title: "Components/Display/ListItem",
	component: ListItem,
	tags: ["autodocs"],
	argTypes: {
		label: { control: "text" },
		overline: { control: "text" },
		supportingText: { control: "text" },
		metadata: { control: "text" },
		alignment: { control: "radio", options: ["top", "middle"] },
		disabled: { control: "boolean" },
		leadingElement: { control: false },
		trailingElement: { control: false },
		onClick: { control: false },
		className: { control: false },
	},
	args: { label: "리스트 아이템" },
	parameters: {
		docs: {
			description: {
				component: `
**ListItem** - A single row in a list. Slot-based (\`leadingElement\` / \`trailingElement\`). / **ListItem** - 목록 한 항목. 슬롯형.

Key props: \`label\`, \`overline\` (small text above), \`supportingText\` (secondary text below), \`metadata\` (bottom meta), \`alignment\` (\`top\` multi-line / \`middle\` single line + icon), \`onClick\` (interactive). / 주요 prop: \`label\`, \`overline\` (위 작은 텍스트), \`supportingText\` (아래 보조), \`metadata\` (하단 메타), \`alignment\` (\`top\` 멀티라인 / \`middle\` 한 줄+아이콘), \`onClick\` (인터랙티브).
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ListItem>;

const ChevronTrailing = (
	<button
		type="button"
		aria-label="더보기"
		style={{
			width: 40,
			height: 40,
			border: "none",
			background: "transparent",
			cursor: "pointer",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			borderRadius: 8,
		}}
		onClick={(e) => e.stopPropagation()}
	>
		<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
			<path d="M8 4L14 10L8 16" stroke="#666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	</button>
);

const Thumb = (
	<div
		style={{
			width: 56,
			height: 56,
			borderRadius: 8,
			background: "var(--bt-color-bg-solid-dim)",
			display: "flex",
			alignItems: "center",
			justifyContent: "center",
			fontSize: 12,
			color: "var(--bt-color-text-body)",
		}}
	>
		56×56
	</div>
);

export const OneLine: Story = {
	args: { label: "한 줄 리스트 아이템" },
};

export const TwoLine: Story = {
	args: {
		label: "두 줄 리스트 아이템",
		supportingText: "보조 텍스트가 라벨 아래에 표시됩니다.",
	},
};

export const WithOverlineAndMetadata: Story = {
	name: "Overline + Metadata",
	args: {
		overline: "카테고리",
		label: "오버라인이 있는 리스트 아이템",
		supportingText: "라벨 위 작은 텍스트와 하단 메타가 함께.",
		metadata: "2026-04-09 · 3분 전",
	},
};

export const WithLeading: Story = {
	args: {
		label: "이미지가 있는 리스트 아이템",
		supportingText: "왼쪽 이미지 플레이스홀더.",
		leadingElement: Thumb,
	},
};

export const WithTrailing: Story = {
	args: {
		label: "트레일링 아이콘이 있는 리스트 아이템",
		supportingText: "오른쪽 chevron 버튼.",
		trailingElement: ChevronTrailing,
	},
};

export const Interactive: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	args: {
		label: "클릭 가능한 리스트 아이템",
		supportingText: "hover/focus/pressed 상태.",
		onClick: () => alert("리스트 아이템 클릭!"),
	},
};
