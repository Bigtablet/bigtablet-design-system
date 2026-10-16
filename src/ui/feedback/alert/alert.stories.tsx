import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { AlertProvider, useAlert, useConfirm } from ".";

type AlertDemoProps = {
	variant?: "info" | "success" | "warning" | "error";
	title?: React.ReactNode;
	message?: React.ReactNode;
	showCancel?: boolean;
	actionsAlign?: "left" | "center" | "right";
	destructive?: boolean;
	showIcon?: boolean;
	confirmText?: string;
	cancelText?: string;
};

const AlertDemo = ({
	variant = "info",
	title = "알림",
	message = "내용을 확인해주세요.",
	showCancel = false,
	actionsAlign = "right",
	destructive,
	showIcon,
	confirmText,
	cancelText,
}: AlertDemoProps) => {
	const { showAlert } = useAlert();
	return (
		<div style={{ padding: 20 }}>
			<button
				type="button"
				onClick={() =>
					showAlert({
						variant,
						title,
						message,
						showCancel,
						actionsAlign,
						destructive,
						showIcon,
						confirmText,
						cancelText,
					})
				}
				style={{
					padding: "10px 20px",
					backgroundColor: "#000",
					color: "#fff",
					border: "none",
					borderRadius: 8,
					cursor: "pointer",
					fontSize: 14,
					fontWeight: 600,
				}}
			>
				Alert 열기
			</button>
		</div>
	);
};

const meta: Meta<typeof AlertDemo> = {
	title: "Components/Feedback/Alert",
	component: AlertDemo,
	decorators: [
		(Story) => (
			<AlertProvider>
				<Story />
			</AlertProvider>
		),
	],
	tags: ["autodocs"],
	argTypes: {
		variant: { control: "select", options: ["info", "success", "warning", "error"] },
		title: { control: "text" },
		message: { control: "text" },
		showCancel: { control: "boolean" },
		actionsAlign: { control: "select", options: ["left", "center", "right"] },
	},
	args: {
		variant: "info",
		title: "알림",
		message: "이것은 정보 알림입니다.",
		showCancel: false,
		actionsAlign: "right",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Alert** - 즉각 확인이 필요한 동작을 위한 모달 알림.

Variants: \`info\` / \`success\` / \`warning\` / \`error\`.
주요 prop: \`title\`, \`message\`, \`showCancel\`, \`actionsAlign\`, \`destructive\` (confirm 을 빨간색으로 강조), \`showIcon\`.
사용: \`AlertProvider\` 하위에서 \`useAlert().showAlert({...})\`.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof AlertDemo>;

export const Info: Story = {
	render: () => <AlertDemo variant="info" title="알림" message="이것은 정보 알림입니다." />,
};

export const Success: Story = {
	render: () => (
		<AlertDemo variant="success" title="성공" message="작업이 성공적으로 완료되었습니다." />
	),
};

export const Warning: Story = {
	render: () => (
		<AlertDemo variant="warning" title="경고" message="이 작업을 진행하시겠습니까?" showCancel />
	),
};

export const ErrorAlert: Story = {
	name: "Error",
	render: () => (
		<AlertDemo
			variant="error"
			title="오류"
			message="작업을 처리하는 중 오류가 발생했습니다."
			showCancel
		/>
	),
};

export const Destructive: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"삭제·탈퇴처럼 **되돌릴 수 없는 확인**입니다. `destructive` 를 주면 confirm 버튼이 빨간색이 되어, 습관적으로 누르던 손을 한 번 멈추게 합니다.\n\n제목에는 대상 이름을 넣으세요 - '정말 삭제할까요?' 보다 '주문 #1024 를 삭제할까요?' 가 실수를 줄입니다.",
			},
		},
	},
	render: () => (
		<AlertDemo
			variant="error"
			title="계정을 삭제하시겠습니까?"
			message="이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구 삭제됩니다."
			showCancel
			destructive
			confirmText="삭제"
			cancelText="유지"
		/>
	),
};

const DiscardDemo = () => {
	const confirm = useConfirm();
	const [text, setText] = React.useState("작성 중인 메모");
	const [log, setLog] = React.useState("");
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 360 }}>
			<textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} aria-label="메모" />
			<button
				type="button"
				onClick={async () => {
					const ok = await confirm({
						variant: "warning",
						title: "변경사항을 버릴까요?",
						message: "저장하지 않은 내용은 복구할 수 없습니다.",
						confirmText: "버리기",
						cancelText: "계속 편집",
						destructive: true,
					});
					setLog(ok ? "버렸습니다" : "계속 편집합니다");
					if (ok) setText("");
				}}
			>
				닫기
			</button>
			<span aria-live="polite">{log}</span>
		</div>
	);
};

export const ConfirmDiscard: Story = {
	name: "useConfirm - 미저장 변경 버리기",
	parameters: {
		docs: {
			description: {
				story:
					"`const ok = await confirm({...})` - 확인하면 `true`, 취소 · Escape · 오버레이로 닫으면 `false` 입니다. 첫 포커스는 취소 버튼이라 Enter 한 번에 지워지지 않습니다.",
			},
		},
	},
	render: () => <DiscardDemo />,
};

const DeleteDemo = () => {
	const confirm = useConfirm();
	const [rows, setRows] = React.useState(["주문 #1024", "주문 #1025"]);
	return (
		<ul style={{ display: "flex", flexDirection: "column", gap: 8, padding: 0, listStyle: "none" }}>
			{rows.map((row) => (
				<li key={row} style={{ display: "flex", gap: 12, alignItems: "center" }}>
					{row}
					<button
						type="button"
						onClick={() =>
							confirm({
								variant: "error",
								title: `${row} 를 삭제할까요?`,
								message: "삭제한 주문은 되돌릴 수 없습니다.",
								confirmText: "삭제",
								destructive: true,
								// 서버 삭제가 끝날 때까지 열린 채 스피너 - 중복 클릭 · 취소가 막힌다
								onConfirm: () =>
									new Promise<void>((resolve) =>
										setTimeout(() => {
											setRows((r) => r.filter((x) => x !== row));
											resolve();
										}, 1200),
									),
							})
						}
					>
						삭제
					</button>
				</li>
			))}
		</ul>
	);
};

export const ConfirmDeleteAsync: Story = {
	name: "useConfirm - 비동기 삭제",
	parameters: {
		docs: {
			description: {
				story:
					"`onConfirm` 이 Promise 를 돌려주면 끝날 때까지 열린 채 확인 버튼에 스피너가 돌고 중복 클릭 · 취소 · Escape 가 막힙니다. 실패(reject)하면 열린 채 다시 시도하거나 취소할 수 있습니다.",
			},
		},
	},
	render: () => <DeleteDemo />,
};
