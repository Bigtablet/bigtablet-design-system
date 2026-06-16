import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Radio } from "../radio";
import { RadioGroup } from ".";

const meta: Meta<typeof RadioGroup> = {
	title: "Components/Forms/RadioGroup",
	component: RadioGroup,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description:
				"Group size, propagated to child Radios. / 그룹 사이즈. 자식 Radio 에 전파됩니다.",
		},
		orientation: {
			control: "select",
			options: ["vertical", "horizontal"],
			description: "Layout direction. / 배치 방향.",
		},
		error: {
			control: "boolean",
			description: "Error state (label/helper turn red). / 에러 상태 (라벨/보조 텍스트가 빨간색).",
		},
		disabled: {
			control: "boolean",
			description: "Disable the whole group. / 그룹 전체 비활성화.",
		},
		label: { control: "text" },
		supportingText: { control: "text" },
	},
	args: {
		label: "크기 / Size",
		size: "md",
		orientation: "vertical",
		error: false,
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**RadioGroup** - Composite wrapper that groups \`Radio\`s via Context (name/value/size/disabled). / Context 로 \`Radio\` 들을 묶는 합성 래퍼 (name/value/size/disabled 공유).

- Controlled (\`value\` + \`onValueChange\`) or uncontrolled (\`defaultValue\`). / 제어형 또는 비제어형.
- \`role="radiogroup"\` + label/supportingText/error. native radio 라 방향키 이동 기본 지원. / 방향키 이동 기본 지원.
- Child \`Radio\` needs a \`value\` prop; size/name/disabled are inherited. / 자식 Radio 는 \`value\` 필요, 나머지는 상속.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const SIZE_OPTIONS = [
	{ value: "sm", label: "작게 / Small" },
	{ value: "md", label: "보통 / Medium" },
	{ value: "lg", label: "크게 / Large" },
];

export const Default: Story = {
	name: "기본 (비제어) / Uncontrolled",
	render: (args) => (
		<RadioGroup {...args} defaultValue="md">
			{SIZE_OPTIONS.map((o) => (
				<Radio key={o.value} value={o.value} label={o.label} />
			))}
		</RadioGroup>
	),
};

export const Controlled: Story = {
	name: "제어형 / Controlled",
	render: (args) => {
		const [value, setValue] = React.useState("md");
		return (
			<div style={{ display: "grid", gap: 12 }}>
				<RadioGroup {...args} value={value} onValueChange={setValue}>
					{SIZE_OPTIONS.map((o) => (
						<Radio key={o.value} value={o.value} label={o.label} />
					))}
				</RadioGroup>
				<span style={{ fontSize: 13, color: "var(--bt-color-text-caption)" }}>
					선택됨 / selected: <strong>{value}</strong>
				</span>
			</div>
		);
	},
};

export const Horizontal: Story = {
	name: "가로 배치 / Horizontal",
	args: { orientation: "horizontal", label: "정렬 / Alignment" },
	render: (args) => (
		<RadioGroup {...args} defaultValue="left">
			<Radio value="left" label="왼쪽 / Left" />
			<Radio value="center" label="가운데 / Center" />
			<Radio value="right" label="오른쪽 / Right" />
		</RadioGroup>
	),
};

export const WithError: Story = {
	name: "에러 + 보조 텍스트 / Error",
	args: {
		error: true,
		label: "결제 수단 / Payment",
		supportingText: "결제 수단을 선택해 주세요. / Please select a payment method.",
	},
	render: (args) => (
		<RadioGroup {...args}>
			<Radio value="card" label="카드 / Card" />
			<Radio value="bank" label="계좌이체 / Bank transfer" />
		</RadioGroup>
	),
};

export const Sizes: Story = {
	name: "사이즈 / Sizes",
	render: () => (
		<div style={{ display: "grid", gap: 24 }}>
			{(["sm", "md", "lg"] as const).map((s) => (
				<RadioGroup key={s} size={s} label={s} orientation="horizontal" defaultValue="md">
					{SIZE_OPTIONS.map((o) => (
						<Radio key={o.value} value={o.value} label={o.label} />
					))}
				</RadioGroup>
			))}
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성화 / Disabled",
	args: { disabled: true, label: "비활성 그룹 / Disabled group" },
	render: (args) => (
		<RadioGroup {...args} defaultValue="md">
			{SIZE_OPTIONS.map((o) => (
				<Radio key={o.value} value={o.value} label={o.label} />
			))}
		</RadioGroup>
	),
};
