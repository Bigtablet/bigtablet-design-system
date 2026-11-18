import { Stat } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
			<Stat label="오늘 매출" value="1,284,000원" delta="+12%" deltaTone="positive" />
			<Stat label="주문" value="86건" delta="-3%" deltaTone="negative" />
			<Stat label="평균 대기" value="4분" />
		</div>
	);
}
