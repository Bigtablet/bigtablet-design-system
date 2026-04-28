import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Star, Globe, User } from "lucide-react";
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
				component:
					"드롭다운 컴포넌트입니다. 플로팅 라벨, 보조 텍스트, 아이콘 옵션을 지원합니다.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// ── 기본 ──────────────────────────────────────────────────────────────────────

export const Playground: Story = {};

export const NoLabel: Story = {
	name: "Label 없음",
	args: { label: undefined, placeholder: "Select option" },
};

export const WithValue: Story = {
	name: "선택된 값 (Input state)",
	args: { defaultValue: "banana" },
};

export const Disabled: Story = {
	name: "비활성화",
	args: { disabled: true, defaultValue: "apple" },
};

export const SmallSize: Story = {
	name: "Small 크기",
	args: { size: "sm", label: undefined },
};

export const FullWidth: Story = {
	name: "Full Width",
	args: { fullWidth: true },
	parameters: { layout: "padded" },
};

// ── 신규 기능 ─────────────────────────────────────────────────────────────────

export const WithSupportingText: Story = {
	name: "Supporting Text",
	args: {
		label: "Location",
		options: [
			{ value: "seoul", label: "Seoul", supportingText: "South Korea" },
			{ value: "tokyo", label: "Tokyo", supportingText: "Japan" },
			{ value: "nyc", label: "New York", supportingText: "United States" },
			{ value: "london", label: "London", supportingText: "United Kingdom" },
		],
		placeholder: "Select city",
	},
};

export const WithLeadingIcon: Story = {
	name: "Leading Icon",
	args: {
		label: "Category",
		options: [
			{ value: "globe", label: "Global", leadingIcon: <Globe size={20} /> },
			{ value: "user", label: "Personal", leadingIcon: <User size={20} /> },
			{ value: "star", label: "Favorites", leadingIcon: <Star size={20} /> },
		],
		placeholder: "Select category",
	},
};

export const WithSupportingAndIcon: Story = {
	name: "Icon + Supporting Text",
	args: {
		label: "Profile",
		options: [
			{
				value: "global",
				label: "Global",
				supportingText: "Visible to everyone",
				leadingIcon: <Globe size={20} />,
			},
			{
				value: "personal",
				label: "Personal",
				supportingText: "Visible to you only",
				leadingIcon: <User size={20} />,
			},
			{
				value: "favorites",
				label: "Favorites",
				supportingText: "Visible to favorites",
				leadingIcon: <Star size={20} />,
				showDivider: true,
			},
			{
				value: "disabled",
				label: "Disabled",
				supportingText: "Not available",
				disabled: true,
			},
		],
		placeholder: "Select visibility",
	},
};

export const WithDivider: Story = {
	name: "구분선 (Divider)",
	args: {
		label: "Action",
		options: [
			{ value: "edit", label: "Edit" },
			{ value: "copy", label: "Copy", showDivider: true },
			{ value: "archive", label: "Archive" },
			{ value: "delete", label: "Delete" },
		],
		placeholder: "Select action",
	},
};

// ── 제어형 ────────────────────────────────────────────────────────────────────

function ControlledExample() {
	const [value, setValue] = React.useState<string | null>(null);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<Dropdown
				label="Fruit"
				options={basicOptions}
				value={value}
				onChange={(v) => setValue(v)}
				placeholder="Choose a fruit"
			/>
			<p style={{ fontSize: 12, color: "#888" }}>
				Selected: <strong>{value ?? "none"}</strong>
			</p>
		</div>
	);
}

export const Controlled: Story = {
	name: "제어형 (Controlled)",
	render: () => <ControlledExample />,
};
