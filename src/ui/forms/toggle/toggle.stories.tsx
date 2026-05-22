import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Toggle } from ".";

const meta: Meta<typeof Toggle> = {
	title: "Components/Forms/Toggle",
	component: Toggle,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "토글 크기입니다. 화면에서 토글이 차지하는 크기(가로/세로)가 함께 바뀝니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다. 켜기/끄기 조작이 불가능하며 흐리게 표시됩니다.",
		},
		checked: { control: false },
		defaultChecked: { control: false },
		onChange: { control: false },
	},
	args: {
		size: "sm",
		disabled: false,
		ariaLabel: "토글",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Toggle** — ON/OFF 즉시 전환. 다중 선택은 Checkbox 사용.

Controlled: \`checked\` + \`onChange\` / Uncontrolled: \`defaultChecked\`.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Controlled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "제어형",
	render: ({ size, disabled }) => {
		const [isOn, setIsOn] = React.useState(true);

		return (
			<div style={{ display: "grid", gap: 10, padding: 20 }}>
				<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
					<Toggle
						size={size}
						disabled={disabled}
						checked={isOn}
						onChange={setIsOn}
						ariaLabel="토글"
					/>
					<span style={{ fontSize: 14, color: "var(--bt-color-text-body)" }}>현재 상태: {isOn ? "ON" : "OFF"}</span>
				</div>

				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)", lineHeight: 1.5 }}>
					이 예시는 Toggle의 상태가 화면의 텍스트와 항상 동일하게 유지되는 형태입니다.
					<br />
					(실서비스에서는 이 방식이 가장 안전합니다)
				</p>
			</div>
		);
	},
};

export const Uncontrolled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "비제어형",
	render: ({ size, disabled }) => (
		<div style={{ display: "grid", gap: 10, padding: 20 }}>
			<Toggle size={size} disabled={disabled} defaultChecked ariaLabel="토글" />
			<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)", lineHeight: 1.5 }}>
				이 예시는 처음에만 ON으로 시작하고, 이후에는 컴포넌트 내부에서 켜짐/꺼짐을 관리합니다.
			</p>
		</div>
	),
};

export const Sizes: Story = {
	name: "크기 비교",
	render: () => (
		<div style={{ display: "grid", gap: 10, padding: 20 }}>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Toggle size="sm" defaultChecked ariaLabel="sm 토글" />
				<span style={{ fontSize: 13, color: "var(--bt-color-text-body)" }}>sm (기본)</span>
			</div>

			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Toggle size="md" defaultChecked ariaLabel="md 토글" />
				<span style={{ fontSize: 13, color: "var(--bt-color-text-body)" }}>md</span>
			</div>
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화",
	render: () => (
		<div style={{ display: "grid", gap: 10, padding: 20 }}>
			<Toggle disabled defaultChecked ariaLabel="토글" />
			<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)", lineHeight: 1.5 }}>
				비활성화 상태에서는 토글을 눌러도 상태가 바뀌지 않습니다.
			</p>
		</div>
	),
};
