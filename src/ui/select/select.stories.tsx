import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Select, type SelectOption } from ".";

const options: SelectOption[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "disabled", label: "Disabled option", disabled: true },
];

const meta: Meta<typeof Select> = {
	title: "Components/Select",
	component: Select,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["outline", "filled", "ghost"],
			description: "겉모양 스타일입니다. 화면 톤에 맞춰 선택합니다.",
		},
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
		options,
		placeholder: "Choose a fruit",
		variant: "outline",
		size: "md",
		disabled: false,
		fullWidth: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Select**는 여러 항목 중 **하나를 고르는 드롭다운**입니다.

### 언제 사용하나요?
- 카테고리 / 국가 / 언어 / 정렬 방식처럼 "하나만 선택"하는 경우
- 선택지가 3개 이상일 때 (2개 이하면 Radio 고려)

### Radio와의 차이
| Select | Radio |
|--------|-------|
| 선택지가 많을 때 | 선택지가 2–4개일 때 |
| 공간을 절약해야 할 때 | 모든 옵션을 한눈에 보여줘야 할 때 |
| 드롭다운으로 숨겨도 괜찮을 때 | 옵션 비교가 중요할 때 |

### 구조 (fieldset + legend)
- 라벨은 \`<legend>\`로, 컨트롤은 \`<fieldset>\` 안의 \`<button>\`으로 구성됩니다.
- 브라우저가 legend 주변에서 fieldset border를 자동으로 끊어주므로 라벨에 배경색 처리가 필요 없습니다. Dim 배경 위에서도 자연스럽게 표시됩니다.
- 시각 언어는 TextField와 동일합니다 (같은 border / radius / hover / focus 토큰).

### 상태
| State | 설명 |
|-------|------|
| Enable | \`color_border_default\` |
| Hover | \`color_border_hover\` (TextField와 동일) |
| Open | \`color_border_focus\` (subtle, box-shadow 없음) |
| Keyboard focus | 컨트롤 버튼에 \`focus_ring\` (\`:focus-visible\`) — 마우스 클릭 시엔 표시되지 않음 |
| Disabled | 배경 \`color_bg_solid_dim\`, 텍스트 \`opacity_38\` |

### 사용 방법
- \`options\`: 선택지를 전달합니다.
- **제어형**: \`value\` + \`onChange\`로 상태 관리
- **비제어형**: \`defaultValue\`로 초기값만 설정

### 키보드 접근성
| 키 | 동작 |
|----|------|
| ↑ / ↓ | 항목 이동 (비활성 항목은 건너뜀) |
| Enter / Space | 선택 / 열기 |
| Esc | 닫기 |
| Home / End | 첫/마지막 비활성화되지 않은 항목 |
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Outline: Story = {
	name: "기본",
};

export const Filled: Story = {
	name: "filled",
	args: { variant: "filled" },
};

export const Ghost: Story = {
	name: "ghost",
	args: { variant: "ghost" },
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};

export const Sizes: Story = {
	name: "크기 비교",
	render: (args) => (
		<div style={{ display: "grid", gap: 12, width: 320 }}>
			<Select {...args} size="sm" />
			<Select {...args} size="md" />
			<Select {...args} size="lg" />
		</div>
	),
};

const longOptions: SelectOption[] = [
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
			<Select
				{...args}
				label="긴 옵션 텍스트 테스트"
				placeholder="선택해주세요"
				options={longOptions}
			/>
		</div>
	),
};

export const Controlled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "제어형",
	render: (args) => {
		const [value, setValue] = React.useState<string | null>("banana");

		return (
			<div style={{ width: 320 }}>
				<Select {...args} value={value} onChange={setValue} />
				<div style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
					현재 선택 값: {String(value)}
				</div>
			</div>
		);
	},
};
