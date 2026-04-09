import type { Meta, StoryObj } from "@storybook/react";
import { LinearProgress } from "../../ui/feedback/linear-progress";

const meta: Meta<typeof LinearProgress> = {
	title: "Components/LinearProgress",
	component: LinearProgress,
	tags: ["autodocs"],
	argTypes: {
		totalSteps: {
			control: "number",
			description: "전체 단계 수입니다.",
		},
		currentStep: {
			control: "number",
			description: "현재 진행 중인 단계입니다. 0부터 totalSteps까지의 값을 가집니다.",
		},
	},
	args: {
		totalSteps: 4,
		currentStep: 2,
		"aria-label": "진행률",
	},
	parameters: {
		docs: {
			description: {
				component: `
**LinearProgress**는 단계 기반 작업의 진행률을 **수평 바** 형태로 표시하는 컴포넌트입니다.

### 언제 사용하나요?
- 회원가입, 설문조사 등 **단계별 흐름(Stepper)**의 진행률을 표시할 때
- 전체 과정 중 현재 위치를 시각적으로 안내할 때
- 페이지 상단이나 섹션 사이에서 진행 상황을 간결하게 보여줄 때

### Spinner / TopLoading과의 차이
| LinearProgress | Spinner | TopLoading |
|----------------|---------|------------|
| 단계 기반 진행률 | 비동기 로딩 상태 | 페이지 전환 로딩 |
| 정적 바 형태 | 회전 애니메이션 | 상단 고정 바 |
| 명확한 진행률 표시 | 진행률 불명확 | 진행률 표시 가능 |

### 디자이너 체크 포인트
- 트랙 높이: 2px, 배경 #e5e5e5 (border_default)
- 인디케이터 높이: 2px, 배경 #121212 (text_heading), border-radius: 9999px
- 너비 변경 시 부드러운 전환 애니메이션 적용
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof LinearProgress>;

export const Empty: Story = {
	name: "0/4 (비어 있음)",
	args: {
		totalSteps: 4,
		currentStep: 0,
	},
};

export const Quarter: Story = {
	name: "1/4 (25%)",
	args: {
		totalSteps: 4,
		currentStep: 1,
	},
};

export const Half: Story = {
	name: "2/4 (50%)",
	args: {
		totalSteps: 4,
		currentStep: 2,
	},
};

export const ThreeQuarters: Story = {
	name: "3/4 (75%)",
	args: {
		totalSteps: 4,
		currentStep: 3,
	},
};

export const Complete: Story = {
	name: "4/4 (100%)",
	args: {
		totalSteps: 4,
		currentStep: 4,
	},
};

export const AllSteps: Story = {
	name: "모든 단계 비교",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
			{[0, 1, 2, 3, 4].map((step) => (
				<div key={step}>
					<p style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>
						{step}/4 ({Math.round((step / 4) * 100)}%)
					</p>
					<LinearProgress totalSteps={4} currentStep={step} aria-label={`진행률 ${step}/4`} />
				</div>
			))}
		</div>
	),
};
