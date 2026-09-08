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
**Divider** - 콘텐츠 영역을 나누는 수평 구분선.

\`weight\`: \`standard\` (1px, 기본) / \`heavy\` (2px, 섹션 강조).

**간격만으로 구분이 되면 넣지 마세요.** 선은 "여기까지가 한 묶음"을 말해야 할 때만 값을 합니다 -
설정 화면의 성격이 다른 항목 사이, 카드 안의 본문과 푸터 사이처럼.
여백을 벌리는 것이 목적이라면 \`Stack\` 의 \`gap\` 이나 \`Section\` 의 \`spacing\` 이 맞습니다.
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
	parameters: {
		docs: {
			description: {
				story:
					"2px 입니다. 같은 화면에서 1px 과 섞어 **위계를 만들 때만** 쓰세요 - 큰 묶음은 `heavy`, 그 안의 항목 사이는 `standard`. 전부 `heavy` 로 두면 위계가 사라집니다.",
			},
		},
	},
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
					Standard (1px) - 일반적인 콘텐츠 구분
				</p>
				<Divider weight="standard" />
			</div>

			<div>
				<p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--bt-color-text-body)" }}>
					Heavy (2px) - 섹션 간 강조 구분
				</p>
				<Divider weight="heavy" />
			</div>
		</div>
	),
};
