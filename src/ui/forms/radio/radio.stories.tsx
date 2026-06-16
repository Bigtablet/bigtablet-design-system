import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio } from ".";

const meta: Meta<typeof Radio> = {
	title: "Components/Forms/Radio",
	component: Radio,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "Radio button size. The text and the selection circle scale together. / 라디오 버튼의 크기입니다. 텍스트와 선택 원(circle)의 크기가 함께 변경됩니다.",
		},
		disabled: {
			control: "boolean",
			description: "Disabled state. Cannot be selected and appears dimmed. / 비활성화 상태입니다. 선택할 수 없으며 흐리게 표시됩니다.",
		},
	},
	args: {
		size: "md",
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Radio** — Single-select (use Checkbox for multi-select). / 단일 선택 (다중은 Checkbox).

Items in the same group share \`name\` and each has its own \`value\`. Control via \`checked\` / \`onChange\`. / 같은 그룹은 \`name\` 동일 + 각 \`value\`. \`checked\` / \`onChange\` 제어.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Group: Story = {
	name: "그룹 선택 예시",
	render: (args) => {
		const groupId = React.useId();
		const groupName = `radio_group_${groupId}`;
		const [value, setValue] = React.useState("b");

		return (
			<div style={{ display: "grid", gap: 8 }}>
				<Radio
					{...args}
					name={groupName}
					value="a"
					checked={value === "a"}
					onChange={() => setValue("a")}
					label="Option A"
				/>
				<Radio
					{...args}
					name={groupName}
					value="b"
					checked={value === "b"}
					onChange={() => setValue("b")}
					label="Option B (기본 선택)"
				/>
				<Radio
					{...args}
					name={groupName}
					value="c"
					checked={value === "c"}
					onChange={() => setValue("c")}
					label="Option C"
				/>
			</div>
		);
	},
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		<div style={{ display: "flex", gap: 24, alignItems: "center" }}>
			{(["sm", "md", "lg"] as const).map((size) => (
				<Radio
					key={size}
					size={size}
					label={size}
					name="size-demo"
					defaultChecked={size === "md"}
				/>
			))}
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	render: (args) => {
		const groupId = React.useId();
		const groupName = `radio_disabled_${groupId}`;

		return (
			<div style={{ display: "grid", gap: 8 }}>
				<Radio {...args} name={groupName} value="a" disabled label="Disabled A" />
				<Radio {...args} name={groupName} value="b" disabled checked label="Disabled B (선택됨)" />
			</div>
		);
	},
};
