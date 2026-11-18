import { Button, Card } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
			<Card heading="팀 요금제" footer={<Button size="sm">변경</Button>}>
				인원 제한 없이 월 9만 원입니다.
			</Card>
			<Card variant="outline" shadow="none" heading="테두리만">
				배경이 흰 화면 위에 놓을 때 씁니다.
			</Card>
		</div>
	);
}
