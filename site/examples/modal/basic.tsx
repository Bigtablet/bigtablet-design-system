import { Button, Modal } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>모달 열기</Button>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title="팀원 초대"
				description="초대 메일은 7일 동안 유효합니다."
				footer={
					<>
						<Button variant="text" onClick={() => setOpen(false)}>
							취소
						</Button>
						<Button onClick={() => setOpen(false)}>보내기</Button>
					</>
				}
			/>
		</>
	);
}
