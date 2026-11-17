import type { DocPage } from "../docs";

export const otpInput: DocPage = {
	slug: "otp-input",
	category: "텍스트 입력",
	order: 2,
	title: "OtpInput",
	name: "인증 코드 입력",
	summary: "인증 코드 입력입니다. 자리마다 칸이 나뉘고 붙여넣기 · 문자 자동완성을 지원합니다.",
	when: [
		["문자 · 메일 인증 코드", "OtpInput", true],
		["일반 숫자 입력", "TextField", false],
	],
	examples: [{ id: "otp-input/basic", title: "6자리" }],
	props: "OtpInputProps",
};
