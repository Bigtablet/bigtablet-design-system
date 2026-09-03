import type { Meta, StoryObj } from "@storybook/react";
import { CheckCircle2, Circle, Truck } from "lucide-react";
import { Button } from "../../general/button";
import { Card } from "../card";
import { Timeline } from ".";

const meta: Meta<typeof Timeline> = {
	title: "Components/Display/Timeline",
	component: Timeline,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Timeline** - 시간 순서로 흐르는 진행 상황. 주문 추적, 승인 단계, 활동 기록.

\`<ol>\` 로 렌더한다 — 순서가 있는 목록이고, 스크린리더가 "3개 중 2번째" 를 읽어 준다.
\`<div>\` 로 만들면 그 순서 정보가 남지 않는다.

연결선은 마지막 항목에서 끊는다. 손으로 만들면 마지막 점 아래로 선이 흘러나오거나
\`isLast\` 판정을 화면마다 다시 쓴다.

상태는 셋 — \`done\` · \`active\` · \`pending\`. 지나간 단계와 아직 오지 않은 단계를 색 하나로만
구분하지 않고 \`pending\` 은 제목까지 약하게 둔다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const OrderTracking: Story = {
	name: "주문 추적",
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 420 }}>
			<Timeline
				items={[
					{
						id: 1,
						title: "주문 접수",
						time: "오후 1:32",
						description: "고객이 #1024 주문을 결제했습니다.",
						status: "done",
						icon: <CheckCircle2 size={16} />,
					},
					{
						id: 2,
						title: "픽업 준비",
						time: "오후 1:35",
						description: "주방에서 메뉴 준비를 시작했어요.",
						status: "done",
						icon: <CheckCircle2 size={16} />,
					},
					{
						id: 3,
						title: "배송 출발",
						time: "오후 1:48",
						description: "라이더가 매장에서 픽업 후 이동 중입니다.",
						status: "active",
						icon: <Truck size={16} />,
					},
					{
						id: 4,
						title: "배송 완료",
						time: "예상 오후 2:05",
						description: "고객 주소지에 도착 예정.",
						icon: <Circle size={16} />,
					},
				]}
			/>
		</Card>
	),
};

export const Minimal: Story = {
	name: "아이콘 없이 (기본 글리프)",
	parameters: {
		docs: {
			description: {
				story:
					"`icon` 을 주지 않아도 상태가 **모양**으로 갈린다 — `done` 은 체크, `active` 는 꽉 찬 점, `pending` 은 빈 원. 배경색만 다르면 색을 구분하지 못하는 사용자에게 `done` 과 `active` 가 같아 보인다(WCAG 1.4.1). 흑백으로 보아도 셋이 구분된다.",
			},
		},
	},
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 360 }}>
			<Timeline
				items={[
					{ id: 1, title: "초안 작성", time: "05.18", status: "done" },
					{ id: 2, title: "검토 요청", time: "05.19", status: "done" },
					{ id: 3, title: "승인 대기", time: "05.20", status: "active" },
					{ id: 4, title: "배포", time: "미정" },
				]}
			/>
		</Card>
	),
};

export const WithContent: Story = {
	name: "항목 아래에 내용 붙이기",
	parameters: {
		docs: {
			description: { story: "`children` 으로 첨부·액션을 항목에 붙인다." },
		},
	},
	render: () => (
		<Card bordered padding="lg" style={{ maxWidth: 420 }}>
			<Timeline
				items={[
					{
						id: 1,
						title: "결제 완료",
						time: "오후 1:32",
						status: "done",
						children: (
							<Button size="sm" variant="outline">
								영수증 보기
							</Button>
						),
					},
					{ id: 2, title: "정산 예정", time: "05.31" },
				]}
			/>
		</Card>
	),
};
