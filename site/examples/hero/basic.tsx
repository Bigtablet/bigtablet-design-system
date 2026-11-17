import { Hero } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Hero
			height="sm"
			eyebrow="Bigtablet"
			title="매장 운영을 한 화면에서"
			subtitle="주문 · 재고 · 매출을 실시간으로 봅니다"
			primaryAction={{ label: "시작하기", href: "#" }}
			secondaryAction={{ label: "자세히", href: "#" }}
		/>
	);
}
