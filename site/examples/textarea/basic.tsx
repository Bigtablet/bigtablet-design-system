import { Textarea } from "@bigtablet/design-system";

export default function Example() {
	return (
		<div style={{ maxWidth: 480 }}>
			<Textarea
				label="메모"
				placeholder="고객에게 보이지 않습니다"
				minRows={3}
				maxRows={8}
				showCounter
				maxLength={200}
			/>
		</div>
	);
}
