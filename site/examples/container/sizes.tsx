import { Container } from "@bigtablet/design-system";

const box = { padding: 12, borderRadius: 8, background: "var(--bt-color-bg-solid-dim)" };

export default function Example() {
	return (
		<div style={{ display: "grid", gap: 8 }}>
			<Container size="sm">
				<div style={box}>sm: 폼 · 로그인</div>
			</Container>
			<Container size="md">
				<div style={box}>md (768px): 블로그 본문</div>
			</Container>
			<Container size="xl">
				<div style={box}>xl (기본): 일반 페이지</div>
			</Container>
		</div>
	);
}
