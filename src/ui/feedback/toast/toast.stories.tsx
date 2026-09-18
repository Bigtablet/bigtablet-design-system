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
			<button
				type="button"
				style={demo_btn_style}
				onClick={() => t.success("성공적으로 완료되었습니다.")}
			>
				Success
			</button>
			<button
				type="button"
				style={demo_btn_style}
				onClick={() => t.warning("주의가 필요한 상황입니다.")}
			>
				Warning
			</button>
			<button
				type="button"
				style={demo_btn_style}
				onClick={() => t.error("오류가 발생했습니다. 다시 시도해주세요.")}
			>
				Error
			</button>
			<button
				type="button"
				style={demo_btn_style}
				onClick={() => t.info("참고용 안내 메시지입니다.")}
			>
				Info
			</button>
		</div>
	);
}

function ToastControlButtons() {
	const t = useToast();
	return (
		<div style={demo_wrap_style}>
			<button
				type="button"
				style={demo_btn_style}
				onClick={async () => {
					// 진행 토스트 - 같은 토스트를 갱신한다. duration: Infinity 는 진행 바 없이 떠 있다.
					const id = t.info("업로드 중…", { duration: Infinity });
					await new Promise((r) => setTimeout(r, 1500));
					t.update(id, { variant: "success", message: "업로드 완료", duration: 3000 });
				}}
			>
				진행 토스트 (update)
			</button>
			<button
				type="button"
				style={demo_btn_style}
				onClick={() =>
					t.message("항목 3개가 삭제되었습니다.", {
						duration: 6000,
						action: { label: "실행 취소", onClick: () => t.success("복구했습니다.") },
					})
				}
			>
				실행 취소 (action)
			</button>
			<button
				type="button"
				style={demo_btn_style}
				onClick={() => {
					const id = t.warning("3초 뒤 프로그램으로 닫힙니다.", { duration: Infinity });
					setTimeout(() => t.dismiss(id), 3000);
				}}
			>
				프로그램으로 닫기 (dismiss)
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
**Toast** - 화면을 막지 않는 짧은 알림. 일정 시간 뒤 자동으로 사라진다.

Types: \`message\` (기본) / \`success\` / \`warning\` / \`error\` / \`info\`.
사용: \`<ToastProvider>\` 로 감싸고 \`useToast()\` 훅을 쓴다 - \`t.success("저장 완료", 5000)\`.

표시 함수는 **id** 를 반환한다. \`t.update(id, patch)\` 로 떠 있는 토스트를 바꾸고(진행 토스트),
\`t.dismiss(id)\` 로 닫는다. \`{ duration: Infinity }\` 는 저절로 닫히지 않고, \`{ action }\` 은
메시지 옆에 한 번 누를 수 있는 버튼("실행 취소")을 둔다.
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

export const ProgrammaticControl: Story = {
	name: "dismiss · update · action",
	render: () => (
		<ToastProvider>
			<ToastControlButtons />
		</ToastProvider>
	),
};
