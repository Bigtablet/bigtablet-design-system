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
			description:
				"선호 위치. 뷰포트를 벗어나면 반대편으로 flip + 교차축 shift 되어 실제 위치는 계산 결과를 따른다.",
		},
		delay: {
			control: "number",
			description: "hover 후 노출 지연 시간 (ms).",
		},
		disabled: {
			control: "boolean",
			description: "true면 children만 렌더 - 툴팁 비활성.",
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
**Tooltip** - hover·focus 시 화면을 막지 않고 보조 설명을 띄운다. 클릭 상호작용은 Popover 를 쓴다.

주요 prop: \`content\`, \`placement\` (선호 위치 — 뷰포트를 벗어나면 자동 flip/shift, \`body\` 로 포탈), \`delay\` (기본 200ms), \`disabled\`.
\`role="tooltip"\` + \`aria-describedby\` 가 자동으로 설정된다.
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

export const ViewportCollision: Story = {
	name: "뷰포트 경계 (flip/shift)",
	parameters: {
		docs: {
			description: {
				story:
					'화면 왼쪽 끝 트리거에 `placement="left"`. left 로 두면 화면 밖이라 자동으로 right 로 flip 되어 온전히 보인다. 좁은 뷰포트(모바일 프리뷰)에서 확인. / Trigger at the left edge with `placement="left"` auto-flips to `right` so it stays fully visible.',
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", justifyContent: "flex-start", padding: "80px 0 0 4px" }}>
			<Tooltip content="왼쪽 끝이라 right 로 flip 됩니다" placement="left">
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
					왼쪽 끝
				</button>
			</Tooltip>
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
						background: "var(--bt-color-status-error)",
						color: "var(--bt-color-status-error-on-default)",
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
