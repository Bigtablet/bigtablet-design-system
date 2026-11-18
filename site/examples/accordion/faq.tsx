import { Accordion } from "@bigtablet/design-system";

const items = [
	{
		key: "refund",
		title: "환불은 언제 되나요?",
		content: "결제 취소 후 영업일 기준 3~5일 안에 처리됩니다.",
	},
	{
		key: "invoice",
		title: "세금계산서를 받을 수 있나요?",
		content: "설정 › 결제에서 사업자 정보를 등록하면 매월 발행됩니다.",
	},
	{ key: "seats", title: "인원은 몇 명까지인가요?", content: "팀 요금제부터 제한이 없습니다." },
];

export default function Example() {
	return <Accordion items={items} defaultOpenKeys={["refund"]} />;
}
