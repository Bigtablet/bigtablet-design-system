import { Card, Skeleton } from "@bigtablet/design-system";

// 실제 내용의 모양대로 자리를 잡아 두면 불러온 뒤 화면이 덜 흔들립니다.
// 스켈레톤은 카드 같은 흰 표면 위에 둡니다 - 회색 페이지 바탕에서는 거의 보이지 않습니다
export default function Example() {
	return (
		<Card style={{ maxWidth: 360 }}>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Skeleton variant="avatar" />
				<div style={{ display: "grid", gap: 8, flex: 1 }}>
					<Skeleton variant="title" width="60%" />
					<Skeleton variant="text" />
				</div>
			</div>
		</Card>
	);
}
