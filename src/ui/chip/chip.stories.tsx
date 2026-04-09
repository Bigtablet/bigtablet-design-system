import type { Meta, StoryObj } from "@storybook/react";
import { Chip } from ".";

const meta: Meta<typeof Chip> = {
	title: "Components/Chip",
	component: Chip,
	tags: ["autodocs"],
	argTypes: {
		type: {
			control: "select",
			options: ["basic", "input", "filter"],
			description: "칩의 유형입니다.",
		},
		label: {
			control: "text",
			description: "칩에 표시할 라벨 텍스트입니다.",
		},
		selected: {
			control: "boolean",
			description: "선택 상태입니다.",
		},
		removable: {
			control: "boolean",
			description: "삭제 가능 여부입니다. (input 타입에서만 사용)",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		onClick: { action: "clicked" },
		onRemove: { action: "removed" },
	},
	args: {
		type: "basic",
		label: "Chip",
		selected: false,
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Chip**은 속성, 필터, 입력값 등을 표현하는 컴팩트한 UI 요소입니다.

### 언제 사용하나요?
- 태그/카테고리 표시 (basic)
- 검색 필터 조건 선택 (filter)
- 사용자가 입력한 값 목록 (input) — 이메일 수신자, 태그 입력 등

### 유형 가이드
| Type | 용도 |
|------|------|
| **basic** | 속성 표시, 태그 (선택 가능) |
| **input** | 사용자 입력값 표시 (삭제 가능) |
| **filter** | 필터 조건 선택 (드롭다운 연결) |

### 상태
- **selected**: 체크 아이콘이 앞에 표시됩니다 (basic)
- **removable**: 닫기 아이콘이 뒤에 표시됩니다 (input)
- **disabled**: 투명도 0.38, 상호작용 불가

### 접근성 (구현 완료)
- \`<button>\` 요소 사용 → Tab 포커스, Enter/Space 클릭 자동 지원
- 삭제 버튼에 \`aria-label="Remove"\` 제공
- 필터 드롭다운 버튼에 \`aria-label="Toggle dropdown"\` 제공
- 장식 아이콘에 \`aria-hidden="true"\` 적용
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Basic: Story = {
	name: "Basic",
	args: { type: "basic", label: "Basic Chip" },
};

export const Selected: Story = {
	name: "선택됨",
	args: { type: "basic", label: "Selected", selected: true },
};

export const InputChip: Story = {
	name: "Input",
	args: { type: "input", label: "Input Chip" },
};

export const InputRemovable: Story = {
	name: "Input (삭제 가능)",
	args: { type: "input", label: "Removable", removable: true },
};

export const Filter: Story = {
	name: "Filter",
	args: { type: "filter", label: "Filter" },
};

export const FilterSelected: Story = {
	name: "Filter (선택됨)",
	args: { type: "filter", label: "Filter", selected: true },
};

export const Disabled: Story = {
	name: "비활성화",
	args: { type: "basic", label: "Disabled", disabled: true },
};

export const AllTypes: Story = {
	name: "전체 유형 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>basic</span>
				<Chip type="basic" label="Default" />
				<Chip type="basic" label="Selected" selected />
				<Chip type="basic" label="Disabled" disabled />
			</div>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>input</span>
				<Chip type="input" label="Input" />
				<Chip type="input" label="Removable" removable />
				<Chip type="input" label="Disabled" removable disabled />
			</div>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>filter</span>
				<Chip type="filter" label="Filter" />
				<Chip type="filter" label="Selected" selected />
				<Chip type="filter" label="Disabled" disabled />
			</div>
		</div>
	),
};
