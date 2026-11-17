import { Skeleton } from "@bigtablet/design-system";

// 실제 내용의 모양대로 자리를 잡아 두면 불러온 뒤 화면이 덜 흔들립니다
export default function Example() {
	return (
		<div style={{ display: "flex", gap: 12, alignItems: "center", maxWidth: 360 }}>
			<Skeleton variant="avatar" />
			<div style={{ display: "grid", gap: 8, flex: 1 }}>
				<Skeleton variant="title" width="60%" />
				<Skeleton variant="text" />
			</div>
		</div>
	);
}
