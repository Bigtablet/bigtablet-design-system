import type { Meta, StoryObj } from "@storybook/react";
import { Divider } from "../../ui/display/divider";

const meta: Meta<typeof Divider> = {
	title: "Components/Divider",
	component: Divider,
	tags: ["autodocs"],
	argTypes: {
		weight: {
			control: "select",
			options: ["standard", "heavy"],
			description:
				"구분선의 두께입니다. standard는 1px, heavy는 2px입니다.",
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
**Divider**는 콘텐츠 영역을 시각적으로 분리하는 수평 구분선입니다.

### 언제 사용하나요?
- 섹션과 섹션 사이를 구분할 때
- 리스트 아이템 사이를 나눌 때
- 카드 내부 영역을 분리할 때

### 속성 가이드
| 속성 | 설명 |
|------|------|
| **weight** | 구분선 두께. standard(1px) 또는 heavy(2px) |

### 두께 선택 가이드
- **standard**: 일반적인 구분선. 콘텐츠 흐름을 끊지 않으면서 영역을 나눌 때
- **heavy**: 강조 구분선. 섹션 간 구분을 명확하게 하고 싶을 때
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
				<p style={{ margin: "0 0 8px", fontSize: 14, color: "#737373" }}>
					Standard (1px) — 일반적인 콘텐츠 구분
				</p>
				<Divider weight="standard" />
			</div>

			<div>
				<p style={{ margin: "0 0 8px", fontSize: 14, color: "#737373" }}>
					Heavy (2px) — 섹션 간 강조 구분
				</p>
				<Divider weight="heavy" />
			</div>
		</div>
	),
};
