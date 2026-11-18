import { SegmentedControl } from "@bigtablet/design-system";

const items = [
	{ value: "list", label: "목록" },
	{ value: "board", label: "보드" },
	{ value: "calendar", label: "달력", disabled: true },
];

// 항목 하나만 막거나, 묶음 전체를 막습니다
export default function Example() {
	return (
		<div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
			<SegmentedControl aria-label="보기 방식" defaultValue="list" items={items} />
			<SegmentedControl aria-label="정렬" defaultValue="list" items={items} disabled />
		</div>
	);
}
