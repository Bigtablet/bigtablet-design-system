import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from ".";

const meta: Meta<typeof Checkbox> = {
	title: "Components/Forms/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
	argTypes: {
		label: { control: "text" },
		disabled: { control: "boolean" },
		indeterminate: { control: "boolean" },
		error: { control: "boolean" },
		checked: { control: false },
		defaultChecked: { control: false },
		onChange: { control: false },
	},
	args: { label: "동의합니다" },
	parameters: {
		docs: {
			description: {
				component: `
**Checkbox** — Multi-select control (use Radio for single-select). / 다중 선택 (단일 선택은 Radio).

States: \`checked\` / \`indeterminate\` (part of a select-all) / \`disabled\` / \`error\`. / \`checked\` / \`indeterminate\` (전체 선택의 일부) / \`disabled\` / \`error\`.
Native \`<input type="checkbox">\` — Tab/Space handled automatically. / 네이티브 \`<input type="checkbox">\` — Tab/Space 자동.

> ⚠️ **Docs view note / Docs 뷰 안내** — Hover/focus/active interaction states are not visible in the static preview; open an individual story (e.g. Basic) from the left sidebar and use mouse/keyboard to see real behavior. Checked/Indeterminate box color auto-inverts in dark mode (black↔white). / Hover/focus/active 인터랙션 상태는 정적 미리보기에 안 보인다. 실제 동작은 좌측 사이드바에서 개별 스토리 (Basic 등) 를 열고 마우스/키보드 입력으로 확인. Checked/Indeterminate 박스 색은 다크 모드에서 자동 반전 (검정↔흰).
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Basic: Story = {};

export const Checked: Story = {
	args: { defaultChecked: true },
};

export const Indeterminate: Story = {
	args: { indeterminate: true },
};

export const Error: Story = {
	args: { error: true },
};

export const Disabled: Story = {
	args: { disabled: true },
};
