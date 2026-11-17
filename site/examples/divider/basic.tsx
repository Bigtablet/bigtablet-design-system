import { Divider } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 12 }}>
			<span>계정 정보</span>
			<Divider />
			<span>결제 정보</span>
			<Divider weight="heavy" />
			<span>위험 구역</span>
		</div>
	);
}
