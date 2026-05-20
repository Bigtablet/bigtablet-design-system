import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from ".";

const meta: Meta<typeof Tooltip> = {
	title: "Components/Tooltip",
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
**Tooltip** — hover/focus 시 보조 설명을 띄우는 비차단 오버레이.

#### 언제 쓰는가
- 아이콘 버튼의 의미 (Save / Delete 등)
- 단축키 안내 (\`Cmd+S\`)
- ellipsis로 잘린 텍스트의 전체 내용

#### Tooltip vs Popover
- **Tooltip**: hover/focus, 짧은 텍스트만, \`pointer-events: none\`
- **Popover**: 클릭으로 열고 외부 클릭/Esc로 닫음, 상호작용 요소 포함 가능

#### Placement (4방향)
\`top\` (기본) / \`bottom\` / \`left\` / \`right\` — 자동 flipping은 없음, 뷰포트 경계 근처라면 직접 지정.

#### 접근성 (WAI-ARIA Tooltip pattern)
- 툴팁: \`role="tooltip"\`, \`useId()\` 기반 id
- 트리거: 열렸을 때 \`aria-describedby\` 자동 주입
- 키보드: Tab으로 포커스 시 노출, blur 시 닫힘
- IconButton trigger엔 별도 \`aria-label\` 권장 (tooltip은 보조)

#### 애니메이션
\`useSpringPresence\` 훅 — opacity \`0→1\` + translate(4px)→0. placement 별 진입 방향. 퇴출은 \`clamp: true\`로 단호하게.

#### Dismiss
mouseleave / blur 시 즉시 닫힘. \`pointer-events: none\`이라 외부 클릭/Esc 로직 없음.

#### Props
| Prop | Type | Default |
|------|------|---------|
| \`content\` | \`ReactNode\` | required |
| \`placement\` | \`'top' \\| 'bottom' \\| 'left' \\| 'right'\` | \`'top'\` |
| \`delay\` | \`number\` | \`200\` (ms) |
| \`disabled\` | \`boolean\` | \`false\` |
| \`children\` | \`ReactElement\` | required (단일) |

자세한 가이드는 [\`docs/COMPONENTS.md#tooltip\`](https://github.com/bigtablet/bigtablet-design-system/blob/main/docs/COMPONENTS.md#tooltip) 참고.
				`.trim(),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 content/placement/delay/disabled를 바꿔보세요.",
			},
		},
	},
	render: (args) => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Tooltip {...args}>
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
								background: "#f4f4f4",
								border: "1px solid #e5e5e5",
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
