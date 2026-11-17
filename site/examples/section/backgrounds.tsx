import { Container, Section } from "@bigtablet/design-system";

// 배경은 Section 이 끝까지 칠하고, 글 폭은 안쪽 Container 가 제한합니다
export default function Example() {
	return (
		<div>
			{(["default", "dim", "inverted"] as const).map((bg) => (
				<Section key={bg} bg={bg} spacing="sm">
					<Container size="md">bg="{bg}"</Container>
				</Section>
			))}
		</div>
	);
}
