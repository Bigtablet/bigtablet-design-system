import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Chip } from ".";

const meta: Meta<typeof Chip> = {
	title: "Components/Display/Chip",
	component: Chip,
	tags: ["autodocs"],
	argTypes: {
		type: { control: "select", options: ["basic", "input", "filter", "static"] },
		tone: {
			control: "select",
			options: ["default", "accent", "info", "success", "warning", "error"],
		},
		size: { control: "select", options: [undefined, "sm", "md"] },
		label: { control: "text" },
		selected: { control: "boolean" },
		removable: { control: "boolean" },
		disabled: { control: "boolean" },
		onClick: { action: "onClick", control: false },
		onRemove: { action: "onRemove", control: false },
	},
	args: { type: "basic", label: "Chip" },
	parameters: {
		docs: {
			description: {
				component: `
**Chip** - 속성·필터·입력값을 표현하는 컴팩트 요소.

**Types**: \`basic\` (태그) / \`input\` (입력값, removable) / \`filter\` (드롭다운) / \`static\` (라벨, tone).
주요 prop: \`type\`, \`tone\`, \`size\` (sm 24 / md 28 / 기본 32), \`selected\`, \`removable\`.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Basic: Story = {
	args: { type: "basic", label: "Basic" },
};

export const InputChip: Story = {
	name: "Input (removable)",
	args: { type: "input", label: "Removable", removable: true },
};

export const Filter: Story = {
	args: { type: "filter", label: "Filter", selected: true },
};

export const Static: Story = {
	name: "Static (tone)",
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Chip type="static" tone="default" label="Default" />
			<Chip type="static" tone="accent" label="Accent" />
			<Chip type="static" tone="info" label="Info" />
			<Chip type="static" tone="success" label="Success" />
			<Chip type="static" tone="warning" label="Warning" />
			<Chip type="static" tone="error" label="Error" />
		</div>
	),
};

export const Disabled: Story = {
	name: "Disabled (type별)",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
				<Chip type="basic" label="Basic" disabled />
				<Chip type="input" label="Input" removable disabled />
				<Chip type="filter" label="Filter" disabled />
			</div>
			{/* static 은 컨트롤이 아니라 텍스트 라벨이라 흐려지지 않는다 - 흐리면 대비가 AA 미달. */}
			<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
				<Chip type="static" tone="default" label="Default" disabled />
				<Chip type="static" tone="accent" label="Accent" disabled />
				<Chip type="static" tone="info" label="Info" disabled />
				<Chip type="static" tone="success" label="Success" disabled />
				<Chip type="static" tone="warning" label="Warning" disabled />
				<Chip type="static" tone="error" label="Error" removable disabled />
			</div>
		</div>
	),
};

export const InteractiveSelect: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	name: "Interactive - basic 다중 선택",
	render: () => {
		const options = ["디자인", "개발", "기획", "마케팅", "데이터"];
		const [selected, setSelected] = React.useState<string[]>([]);
		const toggle = (label: string) =>
			setSelected((prev) =>
				prev.includes(label) ? prev.filter((v) => v !== label) : [...prev, label],
			);
		return (
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
		);
	},
};

export const InteractiveRemove: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	name: "Interactive - input 삭제",
	render: () => {
		const [items, setItems] = React.useState(["디자인", "개발", "기획"]);
		return (
			<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
				{items.map((label) => (
					<Chip
						key={label}
						type="input"
						label={label}
						removable
						onRemove={() => setItems((prev) => prev.filter((v) => v !== label))}
					/>
				))}
			</div>
		);
	},
};
