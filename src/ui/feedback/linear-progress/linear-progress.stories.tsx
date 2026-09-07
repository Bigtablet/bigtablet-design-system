import type { Meta, StoryObj } from "@storybook/react";
import { LinearProgress } from ".";

const meta: Meta<typeof LinearProgress> = {
	title: "Components/Feedback/LinearProgress",
	component: LinearProgress,
	tags: ["autodocs"],
	argTypes: {
		totalSteps: { control: "number" },
		currentStep: { control: "number" },
	},
	args: { totalSteps: 4, currentStep: 2, "aria-label": "진행률" },
	parameters: {
		docs: {
			description: {
				component: `
**LinearProgress** - 단계 기반 진행률을 보여주는 수평 바. 회원가입·설문 Stepper 용.

주요 prop: \`totalSteps\`, \`currentStep\` (0 ~ totalSteps).
비동기 로딩은 \`Spinner\`, 페이지 전환은 \`TopLoading\` 을 참고.

#### 로딩 표시 4종 중 무엇을 쓰나

| 상황 | 컴포넌트 |
| --- | --- |
| 목록·카드가 뜨기 전, 들어올 내용의 **모양을 알 때** | \`Skeleton\` |
| 버튼·카드 안에서 **작게 돌려야 할 때** | \`Spinner\` |
| 페이지 전환처럼 **화면 전체가 바뀔 때** | \`TopLoading\` |
| 회원가입 3단계처럼 **끝이 정해진 진행률** | \`LinearProgress\` |

기다림이 아니라 결과를 알릴 때는 \`Toast\`(막지 않음)나 \`Alert\`(막음)입니다.

				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof LinearProgress>;

export const Default: Story = {
	args: { totalSteps: 4, currentStep: 2 },
};

export const AllSteps: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`currentStep` 을 0부터 끝까지 늘려 본 모습입니다. 단계 수를 미리 알 때만 쓰세요 - 언제 끝날지 모르는 로딩에 진행률 바를 두면 멈춘 것처럼 보입니다.",
			},
		},
	},
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
			{[0, 1, 2, 3, 4].map((step) => (
				<div key={step}>
					<p style={{ margin: "0 0 8px", fontSize: 14, color: "var(--bt-color-text-body)" }}>
						{step}/4 ({Math.round((step / 4) * 100)}%)
					</p>
					<LinearProgress totalSteps={4} currentStep={step} aria-label={`진행률 ${step}/4`} />
				</div>
			))}
		</div>
	),
};
