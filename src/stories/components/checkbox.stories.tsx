import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "../../ui/form/checkbox";

const meta: Meta<typeof Checkbox> = {
	title: "Components/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: "text",
			description: "체크박스 오른쪽에 표시되는 텍스트(라벨)입니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		indeterminate: {
			control: "boolean",
			description: "중간 상태(일부 선택됨)를 표시합니다.",
		},
		error: {
			control: "boolean",
			description: "에러 상태입니다. 체크박스 테두리가 빨간색으로 변합니다.",
		},
		checked: { control: false },
		defaultChecked: { control: false },
		onChange: { control: false },
	},
	args: {
		label: "동의합니다",
		disabled: false,
		indeterminate: false,
		error: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Checkbox**는 사용자가 선택/해제를 할 수 있는 입력 요소입니다.

### 타입
| Type | 설명 |
|------|------|
| **Unselected** | 선택되지 않은 상태 |
| **Checked** | 선택된 상태 (체크마크) |
| **Indeterminate** | 중간 상태 (대시) — 전체 선택에서 일부만 선택된 경우 |

### 상태
- **Enable / Hover / Focus / Pressed**: State layer overlay로 시각적 피드백
- **Disabled**: 0.38 투명도
- **Error**: 빨간 테두리/배경
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {
	name: "기본",
};

export const Checked: Story = {
	name: "선택됨",
	args: { defaultChecked: true },
};

export const Indeterminate: Story = {
	name: "중간 상태",
	args: { indeterminate: true },
};

export const Error: Story = {
	name: "에러 상태",
	args: { error: true },
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true },
};

export const AllStates: Story = {
	name: "전체 상태 비교",
	render: () => (
		<div style={{ display: "grid", gap: 16 }}>
			<div style={{ display: "flex", gap: 16 }}>
				<Checkbox label="Unselected" />
				<Checkbox label="Checked" defaultChecked />
				<Checkbox label="Indeterminate" indeterminate />
			</div>
			<div style={{ display: "flex", gap: 16 }}>
				<Checkbox label="Disabled" disabled />
				<Checkbox label="Disabled Checked" disabled defaultChecked />
				<Checkbox label="Disabled Indeterminate" disabled indeterminate />
			</div>
			<div style={{ display: "flex", gap: 16 }}>
				<Checkbox label="Error" error />
				<Checkbox label="Error Checked" error defaultChecked />
				<Checkbox label="Error Indeterminate" error indeterminate />
			</div>
		</div>
	),
};

export const AllSelectExample: Story = {
	name: "전체 선택 예시",
	render: () => {
		const [items, setItems] = React.useState([true, false, false]);

		const checkedCount = items.filter(Boolean).length;
		const isAllChecked = checkedCount === items.length;
		const isIndeterminate = checkedCount > 0 && !isAllChecked;

		const toggleAll = (next: boolean) => setItems(items.map(() => next));
		const toggleOne = (index: number, next: boolean) =>
			setItems(items.map((v, i) => (i === index ? next : v)));

		return (
			<div style={{ display: "grid", gap: 10 }}>
				<Checkbox
					label="전체 선택"
					checked={isAllChecked}
					indeterminate={isIndeterminate}
					onChange={(e) => toggleAll(e.target.checked)}
				/>

				<div style={{ paddingLeft: 24, display: "grid", gap: 8 }}>
					{items.map((v, i) => (
						<Checkbox
							key={`item-${i}`}
							label={`항목 ${i + 1}`}
							checked={v}
							onChange={(e) => toggleOne(i, e.target.checked)}
						/>
					))}
				</div>
			</div>
		);
	},
};
