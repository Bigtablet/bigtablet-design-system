import type { Meta, StoryObj } from "@storybook/react";
import type * as React from "react";
import { ToastProvider } from ".";
import { useToast } from "./use-toast";

const demo_wrap_style: React.CSSProperties = {
	display: "grid",
	gap: 12,
	padding: 20,
	maxWidth: 360,
};

const demo_btn_style: React.CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	justifyContent: "center",
	padding: "10px 12px",
	borderRadius: 8,
	border: "1px solid var(--bt-color-border-default)",
	background: "var(--bt-color-bg-solid)",
	color: "var(--bt-color-text-heading)",
	cursor: "pointer",
	fontSize: 14,
	fontWeight: 600,
};

function ToastDemoButtons() {
	const t = useToast();
	return (
		<div style={demo_wrap_style}>
			<button type="button" style={demo_btn_style} onClick={() => t.message("기본 메시지입니다.")}>
				Default
			</button>
			<button type="button" style={demo_btn_style} onClick={() => t.success("성공적으로 완료되었습니다.")}>
				Success
			</button>
			<button type="button" style={demo_btn_style} onClick={() => t.warning("주의가 필요한 상황입니다.")}>
				Warning
			</button>
			<button
				type="button"
				style={demo_btn_style}
				onClick={() => t.error("오류가 발생했습니다. 다시 시도해주세요.")}
			>
				Error
			</button>
			<button type="button" style={demo_btn_style} onClick={() => t.info("참고용 안내 메시지입니다.")}>
				Info
			</button>
		</div>
	);
}

const meta: Meta = {
	title: "Components/Feedback/Toast",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Toast** — Brief, non-blocking notification that auto-dismisses. / **Toast** — 화면을 막지 않는 짧은 알림. 자동 사라짐.

Types: \`message\` (default) / \`success\` / \`warning\` / \`error\` / \`info\`.
Usage / 사용: wrap with \`<ToastProvider>\` and use the \`useToast()\` hook — \`t.success("저장 완료", 5000)\`. / \`<ToastProvider>\` 감싸고 \`useToast()\` 훅.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	render: () => (
		<ToastProvider>
			<ToastDemoButtons />
		</ToastProvider>
	),
};
