import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { OtpInput } from ".";

const meta: Meta<typeof OtpInput> = {
	title: "Components/OtpInput",
	component: OtpInput,
	tags: ["autodocs"],
	argTypes: {
		length: {
			control: "select",
			options: [4, 6],
			description: "OTP 자릿수입니다.",
		},
		error: {
			control: "boolean",
			description: "에러 상태입니다.",
		},
		disabled: {
			control: "boolean",
			description: "비활성화 상태입니다.",
		},
		supportingText: {
			control: "text",
			description: "하단 도움말 텍스트입니다.",
		},
	},
	args: {
		length: 6,
		error: false,
		disabled: false,
	},
	parameters: {
		docs: {
			description: {
				component: `
**OtpInput**은 일회용 비밀번호(OTP) 입력을 위한 컴포넌트입니다.

### 언제 사용하나요?
- 이메일/SMS 인증 코드 입력
- 2단계 인증(2FA) 코드 입력
- 결제 인증 번호 입력

### 주요 기능
- **자동 포커스 이동**: 숫자 입력 시 다음 칸으로 자동 이동
- **백스페이스**: 현재 칸 삭제 후 이전 칸으로 이동
- **붙여넣기**: 복사한 코드를 한 번에 붙여넣기
- **화살표 키**: 좌/우 키로 칸 간 이동

### 사용 방법
\`\`\`tsx
const [otp, setOtp] = React.useState("");

<OtpInput
  length={6}
  value={otp}
  onChange={setOtp}
  supportingText="인증 코드를 입력하세요"
/>

// 에러 상태
<OtpInput
  length={6}
  value={otp}
  onChange={setOtp}
  error
  supportingText="인증 코드가 올바르지 않습니다"
/>
\`\`\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof OtpInput>;

// ── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
	parameters: { chromatic: { disableSnapshot: true } },
	name: "제어형",
	render: ({ length, error, disabled }) => {
		const [val, setVal] = React.useState("");

		return (
			<div style={{ display: "grid", gap: 12, padding: 20 }}>
				<OtpInput
					length={length}
					value={val}
					onChange={setVal}
					error={error}
					disabled={disabled}
					supportingText="인증 코드를 입력하세요"
					autoFocus
				/>
				<p style={{ margin: 0, fontSize: 13, color: "#666" }}>입력된 값: "{val}"</p>
			</div>
		);
	},
};

// ── Lengths ──────────────────────────────────────────────────────────────────

export const Lengths: Story = {
	name: "자릿수 비교",
	render: () => {
		const [val4, setVal4] = React.useState("");
		const [val6, setVal6] = React.useState("");

		return (
			<div style={{ display: "grid", gap: 24, padding: 20 }}>
				<div>
					<p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>4자리</p>
					<OtpInput length={4} value={val4} onChange={setVal4} supportingText="4자리 코드" />
				</div>
				<div>
					<p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>6자리</p>
					<OtpInput length={6} value={val6} onChange={setVal6} supportingText="6자리 코드" />
				</div>
			</div>
		);
	},
};

// ── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
	name: "상태별 비교",
	render: () => (
		<div style={{ display: "grid", gap: 24, padding: 20 }}>
			<div>
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>기본</p>
				<OtpInput length={6} value="123456" supportingText="Supporting text" />
			</div>
			<div>
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>에러</p>
				<OtpInput length={6} value="123456" error supportingText="인증 코드가 올바르지 않습니다" />
			</div>
			<div>
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>비활성화</p>
				<OtpInput length={6} disabled supportingText="Supporting text" />
			</div>
		</div>
	),
};
