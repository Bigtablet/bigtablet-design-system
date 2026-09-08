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
**OtpInput** - OTP/2FA 코드 입력. 자동 포커스 이동, 백스페이스·화살표·붙여넣기를 지원한다.

주요 prop: \`length\`, \`value\`, \`onChange\`, \`error\`, \`supportingText\`, \`disabled\`.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof OtpInput>;

// ── Controlled ───────────────────────────────────────────────────────────────

export const Controlled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"값을 화면이 듭니다. 자동 포커스 이동·백스페이스·화살표·**붙여넣기**를 컴포넌트가 처리하므로, 화면은 `onValueChange` 로 받은 문자열만 다룹니다.\n\n코드를 문자 배열이 아니라 **문자열 하나**로 돌려줍니다 - 길이가 `length` 에 닿았는지로 제출 시점을 판단하면 됩니다.",
			},
		},
		chromatic: { disableSnapshot: true },
	},
	name: "제어형",
	render: ({ length, error, disabled }) => {
		const [val, setVal] = React.useState("");

		return (
			<div style={{ display: "grid", gap: 12, padding: 20 }}>
				<OtpInput
					length={length}
					value={val}
					onValueChange={setVal}
					error={error}
					disabled={disabled}
					supportingText="인증 코드를 입력하세요"
					autoFocus
				/>
				<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)" }}>
					입력된 값: "{val}"
				</p>
			</div>
		);
	},
};

// ── Lengths ──────────────────────────────────────────────────────────────────

export const Lengths: Story = {
	name: "자릿수 비교",
	parameters: {
		docs: {
			description: {
				story:
					"4자리와 6자리입니다. 자릿수는 보내는 코드에 맞추세요 - 화면이 6칸인데 4자리를 보내면 사용자가 남은 칸을 기다립니다.\n\n`supportingText` 로 몇 자리인지 알려 주면 붙여넣기 실패를 줄입니다.",
			},
		},
	},
	render: () => {
		const [val4, setVal4] = React.useState("");
		const [val6, setVal6] = React.useState("");

		return (
			<div style={{ display: "grid", gap: 24, padding: 20 }}>
				<div>
					<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>
						4자리
					</p>
					<OtpInput length={4} value={val4} onValueChange={setVal4} supportingText="4자리 코드" />
				</div>
				<div>
					<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>
						6자리
					</p>
					<OtpInput length={6} value={val6} onValueChange={setVal6} supportingText="6자리 코드" />
				</div>
			</div>
		);
	},
};

// ── States ───────────────────────────────────────────────────────────────────

export const States: Story = {
	name: "상태별 비교",
	parameters: {
		docs: {
			description: {
				story:
					'기본·에러·비활성 비교입니다. `error` 는 칸 테두리를 바꾸지만 **왜 틀렸는지는 말하지 못합니다** - "코드가 일치하지 않습니다" 같은 문구를 `supportingText` 에 같이 주세요.\n\n재전송 대기 중에는 `disabled` 로 잠가 중복 시도를 막습니다.',
			},
		},
	},
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
				<p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--bt-color-text-body)" }}>
					비활성화
				</p>
				<OtpInput length={6} disabled supportingText="Supporting text" />
			</div>
		</div>
	),
};
