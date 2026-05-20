import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from ".";

const meta: Meta<typeof Badge> = {
	title: "Components/Badge",
	component: Badge,
	tags: ["autodocs"],
	argTypes: {
		shape: {
			control: "select",
			options: ["dot", "count", "label"],
			description: "Badge 모양 — dot: 점, count: 숫자, label: 텍스트",
		},
		variant: {
			control: "select",
			options: ["accent", "neutral", "info", "success", "warning", "error"],
			description: "색상 variant — navy brand 또는 status 색",
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "사이즈 — sm: 컴팩트/모바일, md: 웹 기본, lg: 강조",
		},
		count: {
			control: "number",
			description: 'shape="count"일 때 표시할 숫자',
		},
		max: {
			control: "number",
			description: "count 최댓값 (초과 시 max+로 표시)",
		},
		children: {
			control: "text",
			description: 'shape="label"일 때 표시할 텍스트',
		},
	},
	args: {
		shape: "label",
		variant: "accent",
		size: "md",
		children: "New",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Badge**는 작은 상태/카운트 표시. \`dot\` / \`count\` / \`label\` 3가지 shape × 6가지 variant (accent/neutral + 4 status).

### 언제 사용하나요?
- 읽지 않은 알림 개수 → \`shape="count"\` (예: 5, 99+)
- 단순 활성/상태 점 (온라인, 새 항목) → \`shape="dot"\`
- "New", "Beta", "Pro" 라벨 → \`shape="label"\`

> 가독성 있는 태그/필터 칩이 필요하면 [Chip](./?path=/docs/components-chip--docs)을, 도움말 토글이면 Tooltip을 사용하세요. Badge는 정적 표시 전용 (클릭/삭제 X).

### shape × size
3가지 size — **md가 웹 기본** (admin/marketing). 사이즈 매트릭스:

| shape \\ size | sm (모바일/컴팩트) | **md (웹 기본)** | lg (강조) |
|---|---|---|---|
| \`dot\` | 6×6 | **8×8** | 10×10 |
| \`count\` | 16h / 10px | **20h / 12px** | 24h / 13px |
| \`label\` | 2×6 pad / 10px | **3×10 pad / 12px** | 5×12 pad / 13px |

count는 \`count > max\` 시 \`\${max}+\` 로 표시.

### variant 의미
- \`accent\` — 브랜드 navy / \`neutral\` — 메타 라벨
- \`info\` / \`success\` / \`warning\` / \`error\` — 상태 색상 매핑

### 접근성
- Badge는 \`<span>\`이라 시멘틱이 없음 — **의미가 있다면 \`aria-label\`을 직접 부여**하세요
- 특히 \`shape="dot"\`은 텍스트가 없어 SR이 무시함
- 부모 버튼이 \`aria-label\`로 의미를 전달하면 Badge는 \`aria-hidden\`으로 중복 발음 차단

\`\`\`tsx
<button aria-label={\`알림 \${count}개\`}>
  <BellIcon />
  <Badge shape="count" count={count} variant="error" aria-hidden="true" />
</button>
\`\`\`
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story:
					"우측 Controls 패널에서 shape/variant/size를 직접 바꿔보세요. 각 prop이 어떻게 영향을 주는지 실시간 확인.",
			},
		},
	},
};

export const Labels: Story = {
	name: "Label (variant 비교)",
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
			<Badge variant="accent">New</Badge>
			<Badge variant="neutral">Beta</Badge>
			<Badge variant="info">Info</Badge>
			<Badge variant="success">Active</Badge>
			<Badge variant="warning">Pending</Badge>
			<Badge variant="error">Error</Badge>
		</div>
	),
};

export const Counts: Story = {
	name: "Count",
	render: () => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<Badge shape="count" count={1} />
			<Badge shape="count" count={9} />
			<Badge shape="count" count={42} />
			<Badge shape="count" count={150} max={99} />
			<Badge shape="count" count={5} variant="error" />
		</div>
	),
};

export const Dots: Story = {
	name: "Dot",
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Badge shape="dot" variant="success" />
			<Badge shape="dot" variant="warning" />
			<Badge shape="dot" variant="error" />
			<Badge shape="dot" variant="accent" />
		</div>
	),
};

export const NotificationExample: Story = {
	name: "사용 예 — 알림 표시",
	render: () => (
		<div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
			<span style={{ fontSize: 20 }}>🔔</span>
			<Badge shape="count" count={3} variant="error" />
		</div>
	),
};

export const SizeComparison: Story = {
	name: "사이즈 비교 (sm / md / lg)",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
			{(["sm", "md", "lg"] as const).map((size) => (
				<div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
					<code
						style={{
							width: 30,
							fontSize: 12,
							color: "var(--bt-color-text-caption)",
						}}
					>
						{size}
					</code>
					<Badge shape="dot" variant="error" size={size} />
					<Badge shape="count" count={3} variant="error" size={size} />
					<Badge shape="count" count={99} variant="info" size={size} />
					<Badge shape="count" count={1234} max={999} variant="warning" size={size} />
					<Badge shape="label" variant="accent" size={size}>
						New
					</Badge>
					<Badge shape="label" variant="success" size={size}>
						Beta
					</Badge>
					<Badge shape="label" variant="neutral" size={size}>
						Draft
					</Badge>
				</div>
			))}
		</div>
	),
};
