import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../general/button";
import { Stack } from "../../layout/stack";
import { Stepper, type StepperStep } from ".";

const STEPS: StepperStep[] = [
	{ id: "account", label: "계정", description: "이메일과 비밀번호" },
	{ id: "profile", label: "프로필", description: "이름과 소속" },
	{ id: "team", label: "팀 초대", description: "건너뛸 수 있어요" },
	{ id: "done", label: "완료" },
];

const meta: Meta<typeof Stepper> = {
	title: "Components/Navigation/Stepper",
	component: Stepper,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Stepper** - 다단계 폼의 진행 표시. 가입·온보딩·결제처럼 "몇 단계 중 어디" 를 보여 준다.

\`<ol>\` 로 렌더한다 - 스크린리더가 "4개 중 2번째" 를 읽고, 현재 단계는 \`aria-current="step"\` 이다.
지나간 단계는 시각 숨김 텍스트 "완료" 를 함께 가진다 - 색·체크 모양만으로 상태를 전하지 않는다.

상태는 \`current\` 인덱스 하나에서 파생된다. 앞은 \`done\`(체크), 지금은 \`active\`(번호·강조),
뒤는 \`pending\`(빈 원·번호). 소비자가 단계마다 상태를 관리하지 않는다.

\`Timeline\` 과의 경계 - 시간 순 **기록**(주문 추적, 활동 로그)은 Timeline, 사용자가 **밟아 가는
절차**는 Stepper.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Stepper>;

export const Default: Story = {
	name: "가로 (기본)",
	args: { steps: STEPS, current: 1 },
};

export const Vertical: Story = {
	name: "세로",
	parameters: {
		docs: {
			description: {
				story:
					"좁은 사이드 패널이나 설명이 긴 단계에 씁니다. 연결선이 인디케이터 아래로 이어집니다.",
			},
		},
	},
	render: () => (
		<div style={{ maxWidth: 320 }}>
			<Stepper steps={STEPS} current={2} orientation="vertical" />
		</div>
	),
};

function ClickableDemo() {
	const [current, setCurrent] = useState(2);
	return (
		<Stack gap={24}>
			<Stepper steps={STEPS} current={current} onStepClick={setCurrent} />
			<Stack direction="horizontal" gap={8}>
				<Button
					variant="outline"
					size="sm"
					disabled={current === 0}
					onClick={() => setCurrent((c) => c - 1)}
				>
					이전
				</Button>
				<Button
					size="sm"
					disabled={current === STEPS.length - 1}
					onClick={() => setCurrent((c) => c + 1)}
				>
					다음
				</Button>
			</Stack>
		</Stack>
	);
}

export const Clickable: Story = {
	name: "지나간 단계로 되돌아가기",
	parameters: {
		docs: {
			description: {
				story:
					'`onStepClick` 을 주면 **지나간 단계만** 버튼이 됩니다. 아직 오지 않은 단계로 건너뛰는 것은 그 사이 폼 검증을 우회하는 일이라 열지 않습니다 - 앞으로 가는 길은 화면의 "다음" 버튼이 담당합니다.',
			},
		},
	},
	render: () => <ClickableDemo />,
};
