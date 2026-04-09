import type { Meta, StoryObj } from "@storybook/react";
import { FAB } from "../../ui/general/fab";

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

export const AllVariants: Story = {
	name: "전체 Variant 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			{(["primary", "additive"] as const).map((variant) => (
				<div key={variant} style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<span style={{ width: 80, fontSize: 12, color: "#666" }}>{variant}</span>
					<FAB variant={variant} icon={<PlusIcon />} />
					<FAB variant={variant} icon={<PlusIcon />} disabled />
				</div>
			))}
		</div>
	),
};
