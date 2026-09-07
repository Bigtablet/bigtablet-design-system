import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../badge";
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
**ListItem** - 목록의 한 항목. \`leadingElement\` / \`trailingElement\` 슬롯 기반.

주요 prop: \`label\`, \`overline\` (위 작은 텍스트), \`supportingText\` (아래 보조 텍스트), \`metadata\` (하단 메타), \`alignment\` (\`top\` 멀티라인 / \`middle\` 한 줄 + 아이콘), \`onClick\` (인터랙티브).

텍스트 4종 슬롯은 **string 과 ReactNode 를 모두 허용**한다 — 인라인 \`<strong>\`, \`<a>\`, \`Badge\` 등.
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
			<path
				d="M8 4L14 10L8 16"
				stroke="#666"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
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
	parameters: {
		docs: {
			description: {
				story:
					"텍스트 슬롯 네 개를 모두 쓴 모습입니다 - `overline`(위 작은 글자) · `label` · `supportingText` · `metadata`.\n\n**넷을 다 채우는 것이 목표가 아닙니다.** 목록의 모든 행이 같은 슬롯만 쓰도록 맞추는 편이 훑어보기 쉽습니다.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"`onClick` 을 주면 행 전체가 눌립니다. 행 안에 버튼을 또 두면 클릭이 겹치므로, 보조 동작은 `trailingElement` 의 버튼 하나로 모으고 이벤트 전파를 막으세요.",
			},
		},
		chromatic: { disableSnapshot: true },
	},
	args: {
		label: "클릭 가능한 리스트 아이템",
		supportingText: "hover/focus/pressed 상태.",
		onClick: () => alert("리스트 아이템 클릭!"),
	},
};

export const RichContent: Story = {
	name: "Rich content (ReactNode)",
	parameters: {
		docs: {
			description: {
				story:
					"텍스트 슬롯은 string 뿐 아니라 ReactNode 도 받습니다. 인라인 `<strong>` 이나 `Badge` 를 라벨 안에 섞을 때 쓰세요.\n\n다만 슬롯 안에 레이아웃을 짜기 시작하면 `ListItem` 이 아니라 `Card` 를 봐야 할 신호입니다.",
			},
		},
	},
	args: {
		overline: (
			<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
				프로젝트
				<Badge variant="success" appearance="soft" shape="label">
					활성
				</Badge>
			</span>
		),
		label: (
			<span>
				디자인 시스템 <strong>v3.2</strong> 릴리스
			</span>
		),
		supportingText: (
			<span>
				자세한 내용은{" "}
				<a
					href="#changelog"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					체인지로그
				</a>
				를 확인하세요.
			</span>
		),
		metadata: "2026-06-16 · 박상민",
	},
};
