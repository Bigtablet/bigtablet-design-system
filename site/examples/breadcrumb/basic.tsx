import { Breadcrumb } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Breadcrumb
			items={[{ label: "홈", href: "#" }, { label: "주문", href: "#" }, { label: "A-1024" }]}
		/>
	);
}
