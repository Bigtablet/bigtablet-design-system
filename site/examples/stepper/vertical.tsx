import { Stepper } from "@bigtablet/design-system";

const steps = [
	{ id: "account", label: "계정", description: "이메일과 비밀번호" },
	{ id: "profile", label: "프로필", description: "이름과 소속" },
	{ id: "team", label: "팀 초대", description: "건너뛸 수 있어요" },
	{ id: "done", label: "완료" },
];

export default function Example() {
	return <Stepper steps={steps} current={2} orientation="vertical" />;
}
