import { Button, Stepper } from "@bigtablet/design-system";
import { useState } from "react";

const steps = [
	{ id: "account", label: "계정" },
	{ id: "profile", label: "프로필" },
	{ id: "team", label: "팀 초대" },
	{ id: "done", label: "완료" },
];

export default function Example() {
	const [current, setCurrent] = useState(2);
	return (
		<div style={{ display: "grid", gap: 16 }}>
			<Stepper steps={steps} current={current} onStepClick={(index) => setCurrent(index)} />
			<div style={{ display: "flex", gap: 8 }}>
				<Button variant="outline" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
					이전
				</Button>
				<Button disabled={current === steps.length - 1} onClick={() => setCurrent(current + 1)}>
					다음
				</Button>
			</div>
		</div>
	);
}
