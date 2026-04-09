import type { Meta, StoryObj } from "@storybook/react";
import { FAB } from ".";

const PlusIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

const meta: Meta<typeof FAB> = {
	title: "Components/FAB",
	component: FAB,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["primary", "additive"],
			description: "FAB의 스타일 변형입니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		onClick: { action: "clicked" },
	},
	args: {
		icon: <PlusIcon />,
		variant: "primary",
		disabled: false,
		"aria-label": "추가",
	},
	parameters: {
		docs: {
			description: {
				component: `
**FAB (Floating Action Button)**은 화면에서 가장 중요한 단일 액션을 강조하는 플로팅 버튼입니다.

### variant 선택 가이드
| Variant | 용도 |
|---------|------|
| **primary** | 가장 중요한 주 행동 (새 글 작성, 추가 등) |
| **additive** | primary보다 부드러운 강조, 보조적인 플로팅 액션 |

### 사이즈
- 56px 단일 사이즈 (패딩 16px, 아이콘 24px)
- 원형(pill) 형태
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof FAB>;

export const Primary: Story = {
	name: "Primary",
	args: { variant: "primary" },
};

export const Additive: Story = {
	name: "Additive",
	args: { variant: "additive" },
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};

export const FloatingPosition: Story = {
	name: "플로팅 위치 (실제 사용 예시)",
	render: () => (
		<div
			style={{
				position: "relative",
				width: "100%",
				height: 320,
				background: "#f5f5f5",
				borderRadius: 12,
				overflow: "hidden",
			}}
		>
			<div style={{ padding: 24 }}>
				<p style={{ margin: 0, fontSize: 14, color: "#666" }}>
					FAB는 보통 화면 우측 하단에 고정 배치합니다.
				</p>
			</div>
			<div style={{ position: "absolute", right: 24, bottom: 24 }}>
				<FAB variant="primary" icon={<PlusIcon />} aria-label="추가" />
			</div>
		</div>
	),
};

export const AllVariants: Story = {
	name: "전체 Variant 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			{(["primary", "additive"] as const).map((variant) => (
				<div key={variant} style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<span style={{ width: 80, fontSize: 12, color: "#666" }}>{variant}</span>
					<FAB variant={variant} icon={<PlusIcon />} aria-label="추가" />
					<FAB variant={variant} icon={<PlusIcon />} aria-label="추가" disabled />
				</div>
			))}
		</div>
	),
};
