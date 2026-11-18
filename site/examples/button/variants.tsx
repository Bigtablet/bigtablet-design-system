import { Button } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			<Button variant="filled">저장</Button>
			<Button variant="tonal">임시 저장</Button>
			<Button variant="outline">취소</Button>
			<Button variant="text">더 보기</Button>
		</div>
	);
}
