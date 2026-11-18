import { Button, Field, Modal, TextField } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				프로젝트 이름 바꾸기
			</Button>
			<Modal
				open={open}
				onClose={() => setOpen(false)}
				title="프로젝트 이름"
				footer={
					<>
						<Button variant="text" onClick={() => setOpen(false)}>
							취소
						</Button>
						<Button disabled={!name.trim()} onClick={() => setOpen(false)}>
							저장
						</Button>
					</>
				}
			>
				<Field name="project" label="새 이름" required>
					<TextField value={name} onValueChange={setName} />
				</Field>
			</Modal>
		</>
	);
}
