import { Badge } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
			<Badge tone="success">결제 완료</Badge>
			<Badge tone="warning">대기</Badge>
			<Badge tone="error">실패</Badge>
			<Badge tone="neutral" appearance="soft">
				초안
			</Badge>
			<Badge shape="count" tone="error" count={128} max={99} />
			<Badge shape="dot" tone="success" aria-label="온라인" />
		</div>
	);
}
