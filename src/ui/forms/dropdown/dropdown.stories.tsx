import type { Meta, StoryObj } from "@storybook/react";
import { MapPin } from "lucide-react";
import * as React from "react";
import {
	Dropdown,
	type DropdownMultipleProps,
	type DropdownOption,
	type DropdownSingleProps,
} from ".";

const basicOptions: DropdownOption[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "cherry", label: "Cherry" },
	{ value: "disabled", label: "Disabled option", disabled: true },
];

const fruitOptions: DropdownOption[] = [
	{ value: "apple", label: "Apple" },
	{ value: "banana", label: "Banana" },
	{ value: "blueberry", label: "Blueberry" },
	{ value: "cherry", label: "Cherry" },
	{ value: "grape", label: "Grape" },
	{ value: "mango", label: "Mango" },
	{ value: "orange", label: "Orange" },
	{ value: "peach", label: "Peach" },
	{ value: "pear", label: "Pear" },
	{ value: "strawberry", label: "Strawberry" },
];

const meta: Meta<typeof Dropdown> = {
	title: "Components/Forms/Dropdown",
	component: Dropdown,
	tags: ["autodocs"],
	argTypes: {
		size: { control: "select", options: ["sm", "md", "lg"] },
		disabled: { control: "boolean" },
		fullWidth: { control: "boolean" },
		searchable: { control: "boolean" },
		multiple: { control: "boolean" },
		searchPlaceholder: { control: "text" },
		emptyText: { control: "text" },
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
**Dropdown** - Single-select dropdown. Floating label (shows when a value is selected/opened). / **Dropdown** - 단일 선택 드롭다운. 플로팅 라벨 (값 선택/열림 시 표시).

Sizes: \`sm\` / \`md\` (default) / \`lg\`. / Sizes: \`sm\` / \`md\` (기본) / \`lg\`.
\`DropdownOption\` fields: \`label\`, \`value\`, \`disabled\`, \`supportingText\`, \`leadingIcon\`, \`showDivider\`. / \`DropdownOption\` 필드: \`label\`, \`value\`, \`disabled\`, \`supportingText\`, \`leadingIcon\`, \`showDivider\`.
Keyboard: ↑↓/Enter/Esc/Home/End. / 키보드: ↑↓/Enter/Esc/Home/End.

Opt-in: \`searchable\` adds a label filter (case/whitespace-insensitive, Korean IME safe), \`multiple\` enables multi-select (toggle, list stays open, "N개 선택" summary). / opt-in: \`searchable\` 은 라벨 필터(대소문자·공백 무시, 한글 IME 안전), \`multiple\` 은 다중 선택(토글, 리스트 유지, "N개 선택" 요약)을 켭니다.
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
				{/* args 는 single/multiple 유니온이라 단일 모드 제어 prop 과 스프레드로 섞을 수 없음 - 단일로 단언.
				    multiple={false} 을 명시 고정해 Storybook Controls 에서 multiple 을 켜도
				    단일 문자열 value 에 .filter 를 호출해 크래시하지 않도록 방지. */}
				<Dropdown
					{...(args as DropdownSingleProps)}
					multiple={false}
					value={value}
					onValueChange={setValue}
				/>
				<div style={{ marginTop: 8, fontSize: 12, color: "var(--bt-color-text-caption)" }}>
					선택: <strong>{String(value)}</strong>
				</div>
			</div>
		);
	},
};

export const Searchable: Story = {
	name: "Searchable (label filter)",
	args: {
		label: "Fruit",
		options: fruitOptions,
		placeholder: "Choose a fruit",
		searchable: true,
		searchPlaceholder: "Search fruit…",
	},
	parameters: {
		docs: {
			description: {
				story:
					"Type to filter options by label (case- and whitespace-insensitive). Korean IME composition is committed on composition end so the list does not thrash mid-typing. / 라벨로 옵션을 필터링합니다(대소문자·공백 무시). 한글 IME 는 조합 완료 시점에 반영되어 조합 중 리스트가 흔들리지 않습니다.",
			},
		},
	},
};

export const Multiple: Story = {
	name: "Multiple (multi-select)",
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				story:
					'Clicking an option toggles it and the list stays open. Selected options show a left check mark; the control shows an "N개 선택" summary. / 옵션을 클릭하면 토글되고 리스트는 열린 채 유지됩니다. 선택 항목은 왼쪽 체크 표시가 붙고, 컨트롤에는 "N개 선택" 요약이 표시됩니다.',
			},
		},
	},
	render: (args) => {
		const [values, setValues] = React.useState<string[]>(["apple", "cherry"]);
		return (
			<div style={{ width: 320 }}>
				<Dropdown
					{...(args as DropdownMultipleProps)}
					multiple
					options={fruitOptions}
					label="Fruit"
					placeholder="Choose fruits"
					value={values}
					onValueChange={setValues}
				/>
				<div style={{ marginTop: 8, fontSize: 12, color: "var(--bt-color-text-caption)" }}>
					선택: <strong>{values.join(", ") || "(없음)"}</strong>
				</div>
			</div>
		);
	},
};

export const SearchableMultiple: Story = {
	name: "Searchable + Multiple",
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				story:
					"Search and multi-select combine: selecting an option while a filter is active keeps the filter so you can keep picking from the narrowed list. / 검색과 다중 선택 조합: 필터가 걸린 상태에서 항목을 선택해도 필터가 유지되어 좁혀진 목록에서 계속 고를 수 있습니다.",
			},
		},
	},
	render: (args) => {
		const [values, setValues] = React.useState<string[]>([]);
		return (
			<div style={{ width: 320 }}>
				<Dropdown
					{...(args as DropdownMultipleProps)}
					multiple
					searchable
					options={fruitOptions}
					label="Fruit"
					placeholder="Choose fruits"
					searchPlaceholder="Search fruit…"
					emptyText="No matching fruit"
					value={values}
					onValueChange={setValues}
				/>
				<div style={{ marginTop: 8, fontSize: 12, color: "var(--bt-color-text-caption)" }}>
					선택: <strong>{values.join(", ") || "(없음)"}</strong>
				</div>
			</div>
		);
	},
};
