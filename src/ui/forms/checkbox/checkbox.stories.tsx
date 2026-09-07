import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from ".";
import { SELECTION_COMPARISON } from "../selection-comparison.docs";

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
**Checkbox** - 다중 선택 컨트롤 (단일 선택은 Radio 를 쓴다).

States: \`checked\` / \`indeterminate\` (전체 선택의 일부) / \`disabled\` / \`error\`.
네이티브 \`<input type="checkbox">\` 라 Tab/Space 가 자동으로 동작한다.

> ⚠️ **Docs 뷰 안내** - Hover/focus/active 인터랙션 상태는 정적 미리보기에 보이지 않는다. 실제 동작은 좌측 사이드바에서 개별 스토리(Basic 등)를 열고 마우스·키보드로 확인한다. Checked/Indeterminate 박스 색은 다크 모드에서 자동 반전된다(검정↔흰).

${SELECTION_COMPARISON}
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
	parameters: {
		docs: {
			description: {
				story:
					'"전체 선택" 이 일부만 켜진 상태를 나타냅니다. **세 번째 값이 아닙니다** - `indeterminate` 는 표시 전용이고 `checked` 는 따로 관리해야 합니다.\n\n네이티브 속성이라 폼 제출 값에는 영향이 없습니다. 클릭하면 브라우저가 `indeterminate` 를 스스로 해제하므로, 다음 상태를 화면이 정해 다시 내려 주세요.',
			},
		},
	},
	args: { indeterminate: true },
};

export const Error: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"검증 실패를 체크박스 자체에 표시합니다. 다만 **왜 실패했는지는 여기서 말할 수 없습니다** - 문구가 필요하면 `Field` 로 감싸세요.\n\n약관 동의처럼 하나만 필수인 경우가 이 상태의 주 용도입니다.",
			},
		},
	},
	args: { error: true },
};

export const Disabled: Story = {
	args: { disabled: true },
};
