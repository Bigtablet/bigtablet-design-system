import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../ui/general/button";

const PlusIcon = () => (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
		<path d="M12 5v14M5 12h14" />
	</svg>
);

const meta: Meta<typeof Button> = {
	title: "Components/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["filled", "tonal", "outline", "text"],
			description: "버튼의 목적과 중요도에 따라 스타일을 선택합니다.",
		},
		size: {
			control: "select",
			options: ["sm", "md", "xl"],
			description: "버튼의 크기입니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		fullWidth: {
			control: "boolean",
			description: "전체 너비를 차지합니다.",
		},
		onClick: { action: "clicked" },
	},
	args: {
		children: "Button",
		variant: "filled",
		size: "md",
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Button**은 사용자가 어떤 행동(Action)을 실행할 때 사용하는 기본 컴포넌트입니다.

### variant 선택 가이드
| Variant | 용도 |
|---------|------|
| **filled** | 가장 중요한 행동 (저장, 확인) |
| **tonal** | 중요도가 낮은 행동, filled보다 부드러운 강조 |
| **outline** | 보조 행동 (취소, 이전) |
| **text** | UI를 최소화한 행동 (인라인 액션) |

### 사이즈
- **sm**: 36px — 밀집된 UI, 인라인 액션
- **md**: 40px — 기본 크기
- **xl**: 56px — 모바일 CTA, 강조 액션
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Filled: Story = {
	name: "Filled",
	args: { variant: "filled" },
};

export const Tonal: Story = {
	name: "Tonal",
	args: { variant: "tonal" },
};

export const Outline: Story = {
	name: "Outline",
	args: { variant: "outline" },
};

export const Text: Story = {
	name: "Text",
	args: { variant: "text" },
};

export const WithIcons: Story = {
	name: "아이콘 포함",
	render: (args) => (
		<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
			<Button {...args} leadingIcon={<PlusIcon />}>
				Leading
			</Button>
			<Button {...args} trailingIcon={<PlusIcon />}>
				Trailing
			</Button>
			<Button {...args} leadingIcon={<PlusIcon />} trailingIcon={<PlusIcon />}>
				Both
			</Button>
		</div>
	),
	args: { variant: "filled" },
};

export const Sizes: Story = {
	name: "크기 비교",
	render: (args) => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<Button {...args} size="sm">
				Small
			</Button>
			<Button {...args} size="md">
				Medium
			</Button>
			<Button {...args} size="xl">
				XLarge
			</Button>
		</div>
	),
	args: { variant: "filled" },
};

export const AllVariants: Story = {
	name: "전체 Variant 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			{(["filled", "tonal", "outline", "text"] as const).map((variant) => (
				<div key={variant} style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<span style={{ width: 60, fontSize: 12, color: "#888" }}>{variant}</span>
					<Button variant={variant} size="sm">Small</Button>
					<Button variant={variant} size="md">Medium</Button>
					<Button variant={variant} size="xl">XLarge</Button>
					<Button variant={variant} size="md" disabled>Disabled</Button>
				</div>
			))}
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};
