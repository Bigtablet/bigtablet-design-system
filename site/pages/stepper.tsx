import type { DocPage } from "../docs";

export const stepper: DocPage = {
	slug: "stepper",
	category: "내비게이션",
	order: 6,
	title: "Stepper",
	name: "단계 표시",
	summary:
		'가입 · 온보딩 · 결제처럼 "몇 단계 중 어디" 를 보여 줍니다. 상태는 `current` 하나에서 정해집니다.',
	when: [
		["사용자가 밟아 가는 절차 (가입, 결제)", "Stepper", true],
		["시간 순 기록 (주문 추적, 활동 로그)", "Timeline", false],
		["같은 화면 안의 보기 전환", "Tabs", false],
	],
	examples: [
		{
			id: "stepper/horizontal",
			title: "가로 (기본)",
			desc: "폭이 모자라면 목록이 가로로 스크롤되고 현재 단계가 보이게 맞춥니다.",
		},
		{
			id: "stepper/vertical",
			title: "세로",
			desc: "좁은 사이드 패널이나 설명이 긴 단계에 씁니다.",
		},
		{
			id: "stepper/clickable",
			title: "지나간 단계로 돌아가기",
			desc: "`onStepClick` 을 주면 지나간 단계만 눌립니다.",
		},
	],
	props: "StepperProps",
	notes: [
		'`<ol>` 로 렌더되고 현재 단계는 `aria-current="step"` 입니다. 지나간 단계는 "완료" 를 함께 읽습니다',
	],
};
