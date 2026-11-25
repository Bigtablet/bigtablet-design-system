import { Button, Modal, ModalStep, ModalSteps, TextField } from "@bigtablet/design-system";
import { useState } from "react";

type Step = "form" | "verify" | "done";

export default function Example() {
	const [open, setOpen] = useState(false);
	const [step, setStep] = useState<Step>("form");
	const close = () => setOpen(false);

	return (
		<>
			<Button onClick={() => setOpen(true)}>기기 등록</Button>
			<Modal
				open={open}
				onClose={close}
				// 닫힌 뒤 첫 단계로 - 닫히는 동안 되돌아가는 움직임이 보이지 않는다
				onExited={() => setStep("form")}
				title="기기 등록"
				footer={
					step === "form" ? (
						<Button onClick={() => setStep("verify")}>다음</Button>
					) : step === "verify" ? (
						<>
							<Button variant="text" onClick={() => setStep("form")}>
								이전
							</Button>
							<Button onClick={() => setStep("done")}>확인</Button>
						</>
					) : (
						<Button onClick={close}>닫기</Button>
					)
				}
			>
				<ModalSteps active={step}>
					<ModalStep name="form">
						<TextField label="기기 이름" placeholder="내 노트북" />
					</ModalStep>
					<ModalStep name="verify">
						<p>휴대폰으로 보낸 인증 번호 6자리를 입력하세요.</p>
						<TextField label="인증 번호" inputMode="numeric" />
					</ModalStep>
					<ModalStep name="done">
						<p>기기를 등록했습니다.</p>
					</ModalStep>
				</ModalSteps>
			</Modal>
		</>
	);
}
