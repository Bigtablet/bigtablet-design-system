import { DescriptionList } from "@bigtablet/design-system";

export default function Example() {
	return (
		<DescriptionList
			divided
			items={[
				{ label: "주문 번호", value: "A-1024" },
				{ label: "고객", value: "박상민" },
				{ label: "결제 수단", value: "신용카드 (국민 1234)" },
				{ label: "배송지", value: "서울시 강남구 테헤란로 123, 4층", full: true },
			]}
		/>
	);
}
