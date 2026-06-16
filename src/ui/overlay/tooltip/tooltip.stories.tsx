import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from ".";

const meta: Meta<typeof Tooltip> = {
	title: "Components/Overlay/Tooltip",
	component: Tooltip,
	tags: ["autodocs"],
	argTypes: {
		content: {
			control: "text",
			description: "툴팁에 표시할 콘텐츠.",
		},
		placement: {
			control: "select",
			options: ["top", "bottom", "left", "right"],
			description: "trigger 기준 툴팁 위치. 자동 flipping 없음.",
		},
		delay: {
			control: "number",
			description: "hover 후 노출 지연 시간 (ms).",
		},
		disabled: {
			control: "boolean",
			description: "true면 children만 렌더 — 툴팁 비활성.",
		},
		children: {
			control: false,
			description: "트리거가 될 단일 ReactElement.",
		},
	},
	args: {
		content: "저장하기 (Cmd+S)",
		placement: "top",
		delay: 200,
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Tooltip** — Non-blocking supplementary description on hover/focus. For click interactions use Popover. / hover/focus 시 비차단 보조 설명. 클릭 상호작용은 Popover.

Key props: \`content\`, \`placement\` (\`top\`/\`bottom\`/\`left\`/\`right\`, no auto-flip), \`delay\` (default 200ms), \`disabled\`. / 주요 prop: \`content\`, \`placement\` (\`top\`/\`bottom\`/\`left\`/\`right\`, 자동 flip 없음), \`delay\` (기본 200ms), \`disabled\`.
\`role="tooltip"\` + \`aria-describedby\` set automatically. / \`role="tooltip"\` + \`aria-describedby\` 자동.
				`.trim(),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
	name: "기본",
	render: () => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Tooltip content="저장하기 (Cmd+S)">
				<button
					type="button"
					style={{
						padding: "8px 16px",
						background: "#121212",
						color: "#fff",
						border: "none",
						borderRadius: 8,
						cursor: "pointer",
					}}
				>
					Hover me
				</button>
			</Tooltip>
		</div>
	),
};

export const Placements: Story = {
	name: "위치 비교",
	render: () => (
		<div style={{ padding: 100, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 60 }}>
			{(["top", "bottom", "left", "right"] as const).map((p) => (
				<div key={p} style={{ display: "flex", justifyContent: "center" }}>
					<Tooltip content={`placement=${p}`} placement={p}>
						<button
							type="button"
							style={{
								padding: "8px 16px",
								background: "var(--bt-color-bg-solid-dim)",
								border: "1px solid var(--bt-color-border-default)",
								color: "var(--bt-color-text-heading)",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							{p}
						</button>
					</Tooltip>
				</div>
			))}
		</div>
	),
};

export const LongText: Story = {
	name: "긴 텍스트",
	render: () => (
		<div style={{ padding: 80, textAlign: "center" }}>
			<Tooltip content="버튼을 누르면 데이터가 영구 삭제됩니다. 되돌릴 수 없습니다.">
				<button
					type="button"
					style={{
						padding: "8px 16px",
						background: "#EF4444",
						color: "#fff",
						border: "none",
						borderRadius: 8,
					}}
				>
					삭제
				</button>
			</Tooltip>
		</div>
	),
};
