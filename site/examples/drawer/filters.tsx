import { Button, Checkbox, Drawer } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				필터 열기
			</Button>
			<Drawer
				open={open}
				onClose={() => setOpen(false)}
				title="필터"
				footer={<Button onClick={() => setOpen(false)}>적용</Button>}
			>
				<div style={{ display: "grid", gap: 12 }}>
					<Checkbox label="결제 완료" defaultChecked />
					<Checkbox label="환불" />
					<Checkbox label="취소" />
				</div>
			</Drawer>
		</>
	);
}
