import { MediaCard } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ maxWidth: 320 }}>
			<MediaCard
				image={{
					src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800",
					alt: "매장 계산대",
				}}
				eyebrow="사례"
				heading="카페 12곳이 주문 시간을 줄인 방법"
				meta="5분 읽기"
				bordered
			/>
		</div>
	);
}
