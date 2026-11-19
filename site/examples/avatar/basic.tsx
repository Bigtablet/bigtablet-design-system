import { Avatar } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
			<Avatar name="박상민" size="xs" />
			<Avatar name="박상민" size="sm" />
			<Avatar name="김지원" size="md" />
			<Avatar
				src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200"
				name="이수아"
				size="lg"
			/>
			<Avatar name="Bigtablet" size="lg" shape="square" />
		</div>
	);
}
