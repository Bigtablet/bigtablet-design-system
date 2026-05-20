/**
 * @deprecated Select는 Dropdown으로 대체되었습니다.
 * 새 컴포넌트: Components/Dropdown
 */
import type { Meta } from "@storybook/react";
import { Select } from ".";

const meta: Meta<typeof Select> = {
	title: "Components/Select (Deprecated)",
	component: Select,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
> ⚠️ **Deprecated** — \`Select\`는 **Dropdown**으로 대체되었습니다.
>
> \`Select\` → \`Dropdown\`, \`SelectOption\` → \`DropdownOption\` 으로 교체하세요.
> 하위 호환성을 위해 유지되지만 향후 제거될 수 있습니다.

\`\`\`tsx
// Before
import { Select, SelectOption } from '@bigtablet/design-system';
<Select options={options} label="Label" />

// After
import { Dropdown, DropdownOption } from '@bigtablet/design-system';
<Dropdown options={options} label="Label" />
\`\`\`

실제 스토리는 **[Components/Dropdown](/story/components-dropdown--playground)** 에서 확인하세요.
        `,
			},
		},
	},
};

export default meta;
