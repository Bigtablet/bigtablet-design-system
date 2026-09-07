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
		variant: { control: "inline-radio", options: ["outline", "filled"] },
		disabled: { control: "boolean" },
		fullWidth: {
			control: false,
			description:
				"**deprecated (v3.0.0)** - no-op 입니다. Dropdown 은 항상 부모 폭을 채웁니다. 인라인 폭은 부모를 `inline-block` + `width` 로 감싸세요.",
		},
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
**Dropdown** - 단일 선택 드롭다운. 값이 선택되거나 열릴 때 플로팅 라벨이 표시된다.

크기: \`sm\` / \`md\` (기본) / \`lg\`.
Variants: \`outline\` (기본, 테두리) / \`filled\` (dim 배경 채움, 테두리 없음 — 열려 있는 동안 테두리가 드러남). \`TextField\` 와 같은 어휘를 쓴다.
\`DropdownOption\` 필드: \`label\`, \`value\`, \`disabled\`, \`supportingText\`, \`leadingIcon\`, \`showDivider\`.
키보드: ↑↓/Enter/Esc/Home/End.

opt-in: \`searchable\` 은 라벨 필터(대소문자·공백 무시, 한글 IME 안전), \`multiple\` 은 다중 선택(토글, 리스트 유지, "N개 선택" 요약)을 켠다.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {};

export const WithValue: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"값이 있으면 플로팅 라벨이 위로 올라갑니다. 값이 없을 때는 `placeholder` 가 그 자리를 쓰므로, **라벨과 placeholder 에 같은 말을 넣지 마세요** - 선택 후 라벨만 남습니다.",
			},
		},
	},
	args: { defaultValue: "banana" },
};

export const Disabled: Story = {
	args: { disabled: true, defaultValue: "apple" },
};

export const Filled: Story = {
	args: { variant: "filled", defaultValue: "banana" },
	parameters: {
		docs: {
			description: {
				story:
					'`variant="filled"` swaps the border for a dim fill; opening the panel restores the solid background and reveals the border. Mirrors Vanilla `.bt-dropdown__control--filled`. / `variant="filled"` 는 테두리 대신 dim 배경으로 채웁니다. 패널을 열면 배경이 solid 로 돌아오며 테두리가 드러납니다. Vanilla `.bt-dropdown__control--filled` 와 동일합니다.',
			},
		},
	},
};

export const Variants: Story = {
	render: (args) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
			<Dropdown {...(args as DropdownSingleProps)} variant="outline" label="Outline (기본)" />
			<Dropdown {...(args as DropdownSingleProps)} variant="filled" label="Filled" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "두 variant 를 나란히 비교한다.",
			},
		},
	},
};

export const FullWidth: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Dropdown 은 **언제나 부모 폭을 채웁니다.** 이 스토리에 특별한 prop 은 없습니다 - 아래 padded 레이아웃이 부모이고, 컨트롤이 그 폭을 그대로 씁니다.\n\n`fullWidth` prop 은 v3.0.0 부터 no-op 입니다(타입만 남아 있고 구현이 읽지 않습니다). 인라인 폭이 필요하면 부모를 `inline-block` + `width` 로 감싸세요.",
			},
		},
		layout: "padded",
	},
};

export const RichOptions: Story = {
	name: "Rich options (icon + supporting + divider)",
	parameters: {
		docs: {
			description: {
				story:
					"옵션 하나에 아이콘·보조 텍스트·구분선을 붙입니다. `showDivider` 는 항목을 묶는 용도라 마지막 항목에는 주지 마세요.\n\n목록 폭은 트리거 폭이 **하한**이라 라벨이 길면 내용만큼 넓어집니다(3.18.1) - 긴 보조 텍스트를 넣어도 잘리지 않습니다.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"`value` + `onValueChange` 로 화면이 상태를 듭니다. 선택에 따라 다른 필드를 바꿔야 할 때 필요합니다.\n\n라벨·필수 표시·에러 문구가 필요하면 `Dropdown` 에는 `error` prop 이 없으므로 `Field` 로 감싸세요.",
			},
		},
		chromatic: { disableSnapshot: true },
	},
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
					"라벨로 옵션을 필터링한다(대소문자·공백 무시). 한글 IME 는 조합 완료 시점에 반영되어 조합 중 리스트가 흔들리지 않는다.",
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
					"검색과 다중 선택 조합: 필터가 걸린 상태에서 항목을 선택해도 필터가 유지되어 좁혀진 목록에서 계속 고를 수 있다.",
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
