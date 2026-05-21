import type { Meta, StoryObj } from "@storybook/react";
import { MapPin } from "lucide-react";
import * as React from "react";
import { Dropdown, type DropdownOption } from ".";

const basicOptions: DropdownOption[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "disabled", label: "Disabled option", disabled: true },
];

const meta: Meta<typeof Dropdown> = {
	title: "Components/Forms/Dropdown",
	component: Dropdown,
	tags: ["autodocs"],
	argTypes: {
		size: { control: "select", options: ["sm", "md", "lg"] },
		disabled: { control: "boolean" },
		fullWidth: { control: "boolean" },
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
	},
	parameters: {
		docs: {
			description: {
				component: `
**Dropdown** — 단일 선택 드롭다운. 플로팅 라벨 (값 선택/열림 시 표시).

Sizes: \`sm\` / \`md\` (기본) / \`lg\`.
\`DropdownOption\` 필드: \`label\`, \`value\`, \`disabled\`, \`supportingText\`, \`leadingIcon\`, \`showDivider\`.
키보드: ↑↓/Enter/Esc/Home/End.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};

export const WithValue: Story = {
	args: { defaultValue: "banana" },
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "apple" },
};

export const FullWidth: Story = {
	args: { fullWidth: true },
	parameters: { layout: "padded" },
};

export const RichOptions: Story = {
	name: "Rich options (icon + supporting + divider)",
	args: {
		label: "지역",
		options: [
			{ value: "kr", label: "서울", supportingText: "대한민국", leadingIcon: <MapPin size={20} /> },
			{
				value: "jp",
				label: "도쿄",
				supportingText: "일본",
				leadingIcon: <MapPin size={20} />,
				showDivider: true,
			},
			{ value: "us", label: "뉴욕", supportingText: "미국", leadingIcon: <MapPin size={20} /> },
			{ value: "disabled", label: "준비 중", supportingText: "서비스 예정", disabled: true },
		],
		placeholder: "지역 선택",
	},
};

export const Controlled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	render: (args) => {
		const [value, setValue] = React.useState<string | null>("banana");
		return (
			<div style={{ width: 320 }}>
				<Dropdown {...args} value={value} onChange={setValue} />
				<div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
					선택: <strong>{String(value)}</strong>
				</div>
			</div>
		);
	},
};
