import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Globe, User, Star, MapPin } from "lucide-react";
import { Dropdown, type DropdownOption } from ".";

const basicOptions: DropdownOption[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "disabled", label: "Disabled option", disabled: true },
];

const meta: Meta<typeof Dropdown> = {
	title: "Components/Dropdown",
	component: Dropdown,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "크기입니다. 높이/패딩/텍스트 크기가 함께 바뀝니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다. 열거나 선택할 수 없습니다.",
		},
		fullWidth: {
			control: "boolean",
			description: "부모 너비에 맞춰 100%로 확장합니다.",
		},
		options: { table: { disable: true } },
		onChange: { control: false },
		value: { control: false },
		defaultValue: { control: false },
	},
	args: {
		label: "Fruit",
		options: basicOptions,
		placeholder: "Choose a fruit",
		size: "md",
		disabled: false,
		fullWidth: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Dropdown**은 여러 항목 중 **하나를 고르는 드롭다운**입니다.

### 언제 사용하나요?
- 카테고리 / 국가 / 언어 / 정렬 방식처럼 "하나만 선택"하는 경우
- 선택지가 3개 이상일 때 (2개 이하면 Radio 고려)

### Radio와의 차이
| Dropdown | Radio |
|----------|-------|
| 선택지가 많을 때 | 선택지가 2–4개일 때 |
| 공간을 절약해야 할 때 | 모든 옵션을 한눈에 보여줘야 할 때 |
| 드롭다운으로 숨겨도 괜찮을 때 | 옵션 비교가 중요할 때 |

### 플로팅 라벨
- \`label\` prop을 주면 **값이 선택되거나 열릴 때** 상단에 플로팅으로 표시됩니다.
- 닫혀있고 값이 없으면 라벨은 숨겨집니다.

### 상태
| State | 설명 |
|-------|------|
| Enable | \`color_border_default\` — 기본 |
| Hover | \`color_border_hover\` |
| Focus (open) | \`color_border_focus\` + X 아이콘으로 전환 |
| Input (선택됨) | 플로팅 라벨 + 선택 값 표시 |
| Disabled | 배경 \`color_bg_solid_dim\`, \`opacity_38\` |

### 키보드 접근성
| 키 | 동작 |
|----|------|
| ↑ / ↓ | 항목 이동 (비활성 항목 건너뜀) |
| Enter / Space | 선택 / 열기 |
| Esc | 닫기 |
| Home / End | 첫/마지막 활성 항목 |
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// ── 기본 상태 ─────────────────────────────────────────────────────────────────

export const Playground: Story = {
	name: "기본 (Playground)",
};

export const NoLabel: Story = {
	name: "Label 없음",
	args: { label: undefined, placeholder: "Select an option" },
};

export const WithValue: Story = {
	name: "값 선택됨 (Input state)",
	args: { defaultValue: "banana" },
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true, defaultValue: "apple" },
};

// ── 크기 비교 ─────────────────────────────────────────────────────────────────

export const Sizes: Story = {
	name: "크기 비교",
	render: (args) => (
		<div style={{ display: "grid", gap: 12, width: 320 }}>
			<Dropdown {...args} size="sm" label={undefined} placeholder="Small (40px)" />
			<Dropdown {...args} size="md" label="Medium (56px)" />
			<Dropdown {...args} size="lg" label="Large (56px)" />
		</div>
	),
};

// ── 긴 텍스트 ─────────────────────────────────────────────────────────────────

const longOptions: DropdownOption[] = [
	{ value: "long1", label: "Lorem ipsum dolor sit amet, consectetur adipiscing elit" },
	{ value: "long2", label: "동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세" },
	{ value: "long3", label: "Very long option text that should test overflow and truncation behavior" },
	{ value: "long4", label: "아주 긴 옵션 텍스트 — 드롭다운과 선택 영역에서 어떻게 표시되는지 확인" },
];

export const LongText: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	name: "긴 텍스트",
	render: (args) => (
		<div style={{ width: 240 }}>
			<Dropdown
				{...args}
				label="긴 옵션 텍스트 테스트"
				placeholder="선택해주세요"
				options={longOptions}
			/>
		</div>
	),
};

// ── Full Width ────────────────────────────────────────────────────────────────

export const FullWidth: Story = {
	name: "Full Width",
	args: { fullWidth: true },
	parameters: { layout: "padded" },
};

// ── 신규 기능: 보조 텍스트 ────────────────────────────────────────────────────

export const WithSupportingText: Story = {
	name: "Supporting Text",
	parameters: {
		docs: {
			description: {
				story: "옵션에 보조 텍스트를 추가합니다. `DropdownOption.supportingText`를 사용하세요.",
			},
		},
	},
	args: {
		label: "도시",
		options: [
			{ value: "seoul", label: "서울", supportingText: "대한민국" },
			{ value: "tokyo", label: "도쿄", supportingText: "일본" },
			{ value: "nyc", label: "뉴욕", supportingText: "미국" },
			{ value: "london", label: "런던", supportingText: "영국" },
		],
		placeholder: "도시 선택",
	},
};

// ── 신규 기능: Leading Icon ───────────────────────────────────────────────────

export const WithLeadingIcon: Story = {
	name: "Leading Icon",
	parameters: {
		docs: {
			description: {
				story: "옵션 왼쪽에 아이콘을 추가합니다. `DropdownOption.leadingIcon`에 ReactNode를 전달하세요.",
			},
		},
	},
	args: {
		label: "카테고리",
		options: [
			{ value: "globe", label: "글로벌", leadingIcon: <Globe size={20} /> },
			{ value: "user", label: "개인", leadingIcon: <User size={20} /> },
			{ value: "star", label: "즐겨찾기", leadingIcon: <Star size={20} /> },
		],
		placeholder: "카테고리 선택",
	},
};

// ── 신규 기능: 모두 조합 ──────────────────────────────────────────────────────

export const FullFeatured: Story = {
	name: "모든 기능 조합",
	parameters: {
		docs: {
			description: {
				story: "아이콘 + 보조 텍스트 + 구분선을 함께 사용하는 예시입니다.",
			},
		},
	},
	args: {
		label: "지역",
		options: [
			{
				value: "kr",
				label: "서울",
				supportingText: "대한민국",
				leadingIcon: <MapPin size={20} />,
			},
			{
				value: "jp",
				label: "도쿄",
				supportingText: "일본",
				leadingIcon: <MapPin size={20} />,
				showDivider: true,
			},
			{
				value: "us",
				label: "뉴욕",
				supportingText: "미국",
				leadingIcon: <MapPin size={20} />,
			},
			{
				value: "disabled",
				label: "준비 중",
				supportingText: "서비스 예정",
				disabled: true,
			},
		],
		placeholder: "지역 선택",
	},
};

// ── 신규 기능: Divider ────────────────────────────────────────────────────────

export const WithDivider: Story = {
	name: "구분선 (Divider)",
	parameters: {
		docs: {
			description: {
				story: "`showDivider: true`를 설정한 아이템 아래에 구분선이 표시됩니다.",
			},
		},
	},
	args: {
		label: "액션",
		options: [
			{ value: "edit", label: "편집" },
			{ value: "copy", label: "복사", showDivider: true },
			{ value: "archive", label: "보관" },
			{ value: "delete", label: "삭제" },
		],
		placeholder: "액션 선택",
	},
};

// ── 제어형 ────────────────────────────────────────────────────────────────────

export const Controlled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	name: "제어형 (Controlled)",
	render: (args) => {
		const [value, setValue] = React.useState<string | null>("banana");

		return (
			<div style={{ width: 320 }}>
				<Dropdown {...args} value={value} onChange={setValue} />
				<div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
					현재 선택 값: <strong>{String(value)}</strong>
				</div>
			</div>
		);
	},
};
