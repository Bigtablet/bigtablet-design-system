import type { Meta, StoryObj } from "@storybook/react";
import { TextField } from ".";

const SearchIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="11" cy="11" r="8" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
);

const CloseIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={2}
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line x1="18" y1="6" x2="6" y2="18" />
		<line x1="6" y1="6" x2="18" y2="18" />
	</svg>
);

const meta: Meta<typeof TextField> = {
	title: "Components/Forms/TextField",
	component: TextField,
	tags: ["autodocs"],
	argTypes: {
		label: { control: "text" },
		showLabel: { control: "boolean" },
		supportingText: { control: "text" },
		variant: { control: "inline-radio", options: ["outline", "filled"] },
		error: { control: "boolean" },
		success: { control: "boolean" },
		disabled: { control: "boolean" },
		fullWidth: { control: "boolean" },
		onChangeAction: { control: false },
	},
	args: { label: "Label", placeholder: "Input" },
	parameters: {
		docs: {
			description: {
				component: `
**TextField** - Single-line text input. Floating label + leading/trailing icon + supporting text. / **TextField** - 한 줄 텍스트 입력. 플로팅 라벨 + leading/trailing 아이콘 + supporting text.

Sizes: \`sm\` / \`md\` (default) / \`lg\`. / Sizes: \`sm\` / \`md\` (기본) / \`lg\`.
Variants: \`outline\` (default, bordered) / \`filled\` (dim fill, no border — the border appears on hover or focus). / Variants: \`outline\` (기본, 테두리) / \`filled\` (dim 배경 채움, 테두리 없음 — hover 또는 포커스 시 테두리가 드러남).
\`error\` sets \`aria-invalid\`; \`aria-describedby\` is wired only when \`supportingText\` is given. / \`error\` 는 \`aria-invalid\` 를 설정하고, \`aria-describedby\` 는 \`supportingText\` 가 있을 때만 연결됩니다.
\`success\` marks a passing validation and never sets \`aria-invalid\`. When \`error\` and \`success\` are both set, \`error\` wins. / \`success\` 는 검증 통과 표시이며 \`aria-invalid\` 를 켜지 않습니다. \`error\` 와 \`success\` 를 동시에 주면 \`error\` 가 우선합니다.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {};

export const WithIcons: Story = {
	args: {
		label: "Search",
		placeholder: "Search…",
		leadingIcon: <SearchIcon />,
		trailingIcon: <CloseIcon />,
	},
};

export const Filled: Story = {
	args: {
		variant: "filled",
		label: "Search",
		placeholder: "검색어를 입력하세요",
		supportingText: "Hover or focus me — the border only appears while active.",
	},
	parameters: {
		docs: {
			description: {
				story:
					'`variant="filled"` swaps the border for a dim fill; hovering reveals the border, and focusing also restores the solid background. Mirrors Vanilla `.bt-text-field__input--filled`. / `variant="filled"` 는 테두리 대신 dim 배경으로 채웁니다. hover 하면 테두리가 드러나고, 포커스하면 배경도 solid 로 돌아옵니다. Vanilla `.bt-text-field__input--filled` 와 동일합니다.',
			},
		},
	},
};

export const Variants: Story = {
	render: (args) => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
			<TextField {...args} variant="outline" label="Outline (기본)" />
			<TextField {...args} variant="filled" label="Filled" />
		</div>
	),
	args: { placeholder: "Input" },
	parameters: {
		docs: {
			description: {
				story: "Side-by-side comparison of the two variants. / 두 variant 를 나란히 비교합니다.",
			},
		},
	},
};

export const SuccessState: Story = {
	name: "Success",
	args: {
		label: "Email",
		placeholder: "name@example.com",
		defaultValue: "name@example.com",
		supportingText: "사용 가능한 이메일입니다.",
		success: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					'`success` mirrors `error` (border + label + helper text recolored) but keeps `aria-invalid="false"`. / `success` 는 `error` 와 같은 구조(테두리 + 라벨 + 도움말 색 변경)이지만 `aria-invalid` 는 `false` 로 유지합니다.',
			},
		},
	},
};

export const ErrorWinsOverSuccess: Story = {
	args: {
		label: "Email",
		placeholder: "name@example.com",
		defaultValue: "not-an-email",
		supportingText: "이메일 형식이 올바르지 않습니다.",
		error: true,
		success: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					"With both `error` and `success` set, `error` wins — a failed validation must never be painted as a pass. / `error` 와 `success` 가 동시에 켜지면 `error` 가 이깁니다 - 검증 실패를 성공처럼 보여주면 안 되기 때문입니다.",
			},
		},
	},
};

export const ErrorState: Story = {
	name: "Error",
	args: {
		label: "Email",
		placeholder: "name@example.com",
		supportingText: "이메일 형식이 올바르지 않습니다.",
		error: true,
	},
};

export const DisabledState: Story = {
	name: "Disabled",
	args: { label: "이름", placeholder: "입력할 수 없습니다", disabled: true },
};

export const Clearable: Story = {
	args: {
		label: "Search",
		placeholder: "검색어를 입력하세요",
		defaultValue: "삭제 가능한 텍스트",
		clearable: true,
	},
};
