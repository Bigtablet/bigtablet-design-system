import { Button, Popover, TextField } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Popover
			aria-label="빠른 메모"
			trigger={<Button variant="outline">메모 추가</Button>}
			content={
				<div style={{ display: "grid", gap: 8, width: 240 }}>
					<TextField aria-label="메모" placeholder="메모를 적습니다" />
					<Button size="sm">저장</Button>
				</div>
			}
		/>
	);
}
