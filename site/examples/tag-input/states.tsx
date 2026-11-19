import { TagInput } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ maxWidth: 360 }}>
			<TagInput ariaLabel="태그" defaultValue={["신상품", "할인"]} disabled />
		</div>
	);
}
