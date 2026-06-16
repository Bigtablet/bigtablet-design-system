import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { OtpInput } from ".";

const meta: Meta<typeof OtpInput> = {
	title: "Components/Forms/OtpInput",
	component: OtpInput,
	tags: ["autodocs"],
	argTypes: {
		length: {
			control: "select",
			options: [4, 6],
			description: "Number of OTP digits. / OTP 자릿수입니다.",
		},
		error: {
			control: "boolean",
			description: "Error state. / 에러 상태입니다.",
		},
		disabled: {
			control: "boolean",
			description: "Disabled state. / 비활성화 상태입니다.",
		},
		supportingText: {
			control: "text",
			description: "Helper text shown below. / 하단 도움말 텍스트입니다.",
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
**OtpInput** - OTP/2FA code entry. Auto focus advance, backspace/arrow/paste support. / **OtpInput** - OTP/2FA 코드 입력. 자동 포커스 이동, 백스페이스/화살표/붙여넣기 지원.

Key props: \`length\`, \`value\`, \`onChange\`, \`error\`, \`supportingText\`, \`disabled\`. / 주요 prop: \`length\`, \`value\`, \`onChange\`, \`error\`, \`supportingText\`, \`disabled\`.
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
				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)" }}>입력된 값: "{val}"</p>
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
					<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>4자리</p>
					<OtpInput length={4} value={val4} onChange={setVal4} supportingText="4자리 코드" />
				</div>
				<div>
					<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>6자리</p>
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
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>기본</p>
				<OtpInput length={6} value="123456" supportingText="Supporting text" />
			</div>
			<div>
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>에러</p>
				<OtpInput length={6} value="123456" error supportingText="인증 코드가 올바르지 않습니다" />
			</div>
			<div>
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>비활성화</p>
				<OtpInput length={6} disabled supportingText="Supporting text" />
			</div>
		</div>
	),
};
