import { Spinner } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
			<Spinner size={16} />
			<Spinner size={24} />
			<Spinner size={32} ariaLabel="주문을 불러오는 중" />
		</div>
	);
}
