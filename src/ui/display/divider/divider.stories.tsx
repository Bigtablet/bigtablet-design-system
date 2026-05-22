import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from ".";

const meta: Meta<typeof Divider> = {
	title: "Components/Display/Divider",
	component: Divider,
	tags: ["autodocs"],
	argTypes: {
		weight: {
			control: "select",
			options: ["standard", "heavy"],
			description: "구분선의 두께입니다. standard는 1px, heavy는 2px입니다.",
		},
		className: { control: false },
	},
	args: {
		weight: "standard",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Divider** — 콘텐츠 영역 수평 구분선.

\`weight\`: \`standard\` (1px, 기본) / \`heavy\` (2px, 섹션 강조).
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Standard: Story = {
	name: "Standard (1px)",
	args: {
		weight: "standard",
	},
};

export const Heavy: Story = {
	name: "Heavy (2px)",
	args: {
		weight: "heavy",
	},
};

export const AllWeights: Story = {
	name: "두께 비교",
	render: () => (
		<div style={{ display: "grid", gap: 24 }}>
			<div>
				<p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--bt-color-text-body)" }}>
					Standard (1px) — 일반적인 콘텐츠 구분
				</p>
				<Divider weight="standard" />
			</div>

			<div>
				<p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--bt-color-text-body)" }}>
					Heavy (2px) — 섹션 간 강조 구분
				</p>
				<Divider weight="heavy" />
			</div>
		</div>
	),
};
