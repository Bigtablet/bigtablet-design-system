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
**LinearProgress** — Horizontal step-based progress bar. / **LinearProgress** — 단계 기반 진행률 수평 바. For signup/survey steppers. / 회원가입·설문 Stepper 용.

Key props / 주요 prop: \`totalSteps\`, \`currentStep\` (0 ~ totalSteps).
For async loading see \`Spinner\`, for page transitions see \`TopLoading\`. / 비동기 로딩은 \`Spinner\`, 페이지 전환은 \`TopLoading\` 참고.
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
