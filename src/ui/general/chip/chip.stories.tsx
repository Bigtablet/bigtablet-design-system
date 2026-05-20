import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Chip } from ".";

const meta: Meta<typeof Chip> = {
	title: "Components/Chip",
	component: Chip,
	tags: ["autodocs"],
	argTypes: {
		type: {
			control: "select",
			options: ["basic", "input", "filter", "static"],
			description: "칩의 유형입니다. static은 비인터랙티브 라벨 (구 Tag 대체).",
		},
		tone: {
			control: "select",
			options: ["default", "accent", "info", "success", "warning", "error"],
			description: "색조 (type='static'에서만 적용)",
		},
		size: {
			control: "select",
			options: [undefined, "sm", "md"],
			description: "칩의 크기입니다. 미지정 시 기본 32px.",
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
		onClick: { action: "onClick", control: false },
		onRemove: { action: "onRemove", control: false },
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

### 사이즈 (size)
| Size | Height | 사용처 |
|------|--------|--------|
| (미지정) | 32px | 기본값, 폼/리스트 내 일반 사용 |
| **sm** | 24px | 매우 컴팩트한 UI, 인라인 태그 |
| **md** | 28px | 컴팩트한 UI |
> Chip은 인라인 컴포넌트라 form control(sm=32/md=40/lg=48)과 별도 micro scale을 사용합니다.

### 접근성 (구현 완료)
- \`<button>\` 요소 사용 → Tab 포커스, Enter/Space 클릭 자동 지원
- 삭제 버튼에 \`aria-label="Remove"\` 제공
- 필터 칩 버튼에 \`aria-haspopup="listbox"\` 제공
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

export const LongText: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "긴 텍스트",
	render: () => (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 300 }}>
			<Chip type="basic" label="Lorem ipsum dolor sit amet consectetur" />
			<Chip type="input" label="아주 긴 칩 라벨 텍스트 테스트입니다" removable />
			<Chip type="filter" label="동해물과 백두산이 마르고 닳도록" selected />
		</div>
	),
};

export const InputRemovableInteractive: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "Input 삭제 (인터랙티브)",
	render: () => {
		const [items, setItems] = React.useState(["디자인", "개발", "기획", "마케팅"]);
		const remove = (label: string) => setItems((prev) => prev.filter((v) => v !== label));
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<p style={{ margin: 0, fontSize: 13, color: "#666" }}>X 버튼을 눌러 칩을 삭제해보세요.</p>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					{items.map((label) => (
						<Chip key={label} type="input" label={label} removable onRemove={() => remove(label)} />
					))}
					{items.length === 0 && (
						<p style={{ margin: 0, fontSize: 13, color: "#999" }}>모든 칩이 삭제되었습니다.</p>
					)}
				</div>
			</div>
		);
	},
};

export const Interactive: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "인터랙티브 (클릭해보세요)",
	render: () => {
		const options = ["디자인", "개발", "기획", "마케팅", "데이터"];
		const [selected, setSelected] = React.useState<string[]>([]);
		const toggle = (label: string) =>
			setSelected((prev) =>
				prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
			);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
				<p style={{ margin: 0, fontSize: 13, color: "#666" }}>
					칩을 클릭해 선택/해제해보세요. Chip은 controlled 컴포넌트로, 부모가 selected 상태를
					관리합니다.
				</p>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					{options.map((label) => (
						<Chip
							key={label}
							type="basic"
							label={label}
							selected={selected.includes(label)}
							onClick={() => toggle(label)}
						/>
					))}
				</div>
				<p style={{ margin: 0, fontSize: 12, color: "#999" }}>
					선택됨: {selected.length > 0 ? selected.join(", ") : "없음"}
				</p>
			</div>
		);
	},
};

export const Sizes: Story = {
	name: "크기 비교 (sm / md / default)",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>sm (24px)</span>
				<Chip type="basic" label="Basic" size="sm" />
				<Chip type="basic" label="Selected" size="sm" selected />
				<Chip type="input" label="Removable" size="sm" removable />
				<Chip type="filter" label="Filter" size="sm" />
			</div>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>md (28px)</span>
				<Chip type="basic" label="Basic" size="md" />
				<Chip type="basic" label="Selected" size="md" selected />
				<Chip type="input" label="Removable" size="md" removable />
				<Chip type="filter" label="Filter" size="md" />
			</div>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>default (32px)</span>
				<Chip type="basic" label="Basic" />
				<Chip type="basic" label="Selected" selected />
				<Chip type="input" label="Removable" removable />
				<Chip type="filter" label="Filter" />
			</div>
		</div>
	),
};

export const AllTypes: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

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

export const StaticTones: Story = {
	name: "Static · 색조 (구 Tag 대체)",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>default</span>
				<Chip type="static" tone="default" label="Frontend" />
				<Chip type="static" tone="accent" label="Featured" />
				<Chip type="static" tone="info" label="Beta" />
				<Chip type="static" tone="success" label="Active" />
				<Chip type="static" tone="warning" label="Pending" />
				<Chip type="static" tone="error" label="Deprecated" />
			</div>
			<div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>sm</span>
				<Chip type="static" size="sm" tone="default" label="처리 대기" />
				<Chip type="static" size="sm" tone="accent" label="처리중" />
				<Chip type="static" size="sm" tone="success" label="완료" />
				<Chip type="static" size="sm" tone="warning" label="대기" />
				<Chip type="static" size="sm" tone="error" label="실패" />
			</div>
			<div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
				<span style={{ width: 80, fontSize: 12, color: "#666" }}>removable</span>
				<Chip type="static" tone="accent" label="Open" removable onRemove={() => {}} />
				<Chip type="static" tone="success" label="In progress" removable onRemove={() => {}} />
				<Chip type="static" tone="error" label="Bug" removable onRemove={() => {}} />
			</div>
		</div>
	),
};
