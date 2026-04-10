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

const iconMap = {
	Plus: <PlusIcon />,
	Close: <CloseIcon />,
	Search: <SearchIcon />,
};

const meta: Meta<typeof IconButton> = {
	title: "Components/IconButton",
	component: IconButton,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["standard", "filled", "tonal", "outlined"],
			description: "아이콘 버튼의 목적과 중요도에 따라 스타일을 선택합니다.",
		},
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "아이콘 버튼의 크기입니다.",
		},
		icon: {
			control: "select",
			options: Object.keys(iconMap),
			mapping: iconMap,
			description: "표시할 아이콘을 선택합니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		onClick: { action: "clicked" },
	},
	args: {
		icon: "Plus" as unknown as React.ReactNode,
		variant: "standard",
		size: "md",
		disabled: false,
		"aria-label": "추가",
	},
	parameters: {
		docs: {
			description: {
				component: `
**IconButton**은 아이콘만 포함하는 동작 버튼입니다. 라벨 없이 아이콘만으로 의미가 명확할 때 사용합니다.

### 언제 사용하나요?
- 닫기(X), 삭제, 설정 등 아이콘만으로 의미가 통하는 액션
- 툴바, 앱바 등 공간이 제한된 영역
- Button보다 시각적 비중을 줄이고 싶을 때

### variant 선택 가이드
| Variant | 용도 |
|---------|------|
| **standard** | 배경 없이 아이콘만 표시 (기본) |
| **filled** | 가장 중요한 행동, 브랜드 프라이머리 배경 |
| **tonal** | 중요도가 낮은 행동, 부드러운 배경 강조 |
| **outlined** | 테두리가 있는 보조 행동 |

### 사이즈
- **sm**: 40px — 밀집된 UI, 작은 아이콘(20px)
- **md**: 48px — 기본 크기, 아이콘(24px)

### 접근성 (구현 완료)
- \`aria-label\` **필수** — 스크린 리더 사용자에게 버튼 목적을 전달
- \`<button>\` 네이티브 요소 → Tab 포커스, Enter/Space 클릭 자동 지원
- 아이콘에 \`aria-hidden="true"\` 적용 → 스크린 리더가 중복 읽기 방지
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Standard: Story = {
	name: "Standard",
	args: { variant: "standard" },
};

export const Filled: Story = {
	name: "Filled",
	args: { variant: "filled" },
};

export const Tonal: Story = {
	name: "Tonal",
	args: { variant: "tonal" },
};

export const Outlined: Story = {
	name: "Outlined",
	args: { variant: "outlined" },
};

export const Sizes: Story = {
	name: "크기 비교",
	render: (args) => (
		<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
			<IconButton {...args} size="sm" aria-label="작은 버튼" />
			<IconButton {...args} size="md" aria-label="기본 버튼" />
		</div>
	),
	args: { variant: "filled" },
};

export const AllVariants: Story = {
	name: "전체 Variant 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			{(["standard", "filled", "tonal", "outlined"] as const).map((variant) => (
				<div key={variant} style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<span style={{ width: 80, fontSize: 12, color: "#666" }}>{variant}</span>
					<IconButton variant={variant} size="sm" icon={<PlusIcon />} aria-label={`${variant} sm`} />
					<IconButton variant={variant} size="md" icon={<PlusIcon />} aria-label={`${variant} md`} />
					<IconButton variant={variant} size="md" icon={<CloseIcon />} aria-label={`${variant} close`} />
					<IconButton variant={variant} size="md" icon={<SearchIcon />} aria-label={`${variant} search`} />
					<IconButton variant={variant} size="md" icon={<PlusIcon />} aria-label={`${variant} disabled`} disabled />
				</div>
			))}
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};
