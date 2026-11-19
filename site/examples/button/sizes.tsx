import { Button } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
			<Button size="sm">작게</Button>
			<Button size="md">보통</Button>
			<Button size="lg">크게</Button>
			<Button size="xl">아주 크게</Button>
		</div>
	);
}
