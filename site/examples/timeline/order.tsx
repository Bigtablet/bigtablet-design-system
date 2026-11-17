import { Timeline } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Timeline
			items={[
				{ id: 1, title: "주문 접수", time: "11:02", status: "done" },
				{ id: 2, title: "결제 완료", time: "11:03", status: "done" },
				{
					id: 3,
					title: "배송 준비",
					time: "13:40",
					description: "포장 중입니다",
					status: "active",
				},
				{ id: 4, title: "배송 시작", status: "pending" },
			]}
		/>
	);
}
