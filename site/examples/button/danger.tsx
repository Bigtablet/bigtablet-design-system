import { Button } from "@bigtablet/design-system";
import { Trash2 } from "lucide-react";

export default function Example() {
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
			<Button danger leadingIcon={<Trash2 size={16} />}>
				삭제
			</Button>
			<Button danger variant="outline">
				계정 해지
			</Button>
			<Button disabled>비활성</Button>
		</div>
	);
}
