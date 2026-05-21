import type { Meta, StoryObj } from "@storybook/react";
import type * as React from "react";
import { AlertProvider, useAlert } from ".";

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
**Alert** — 즉각 확인이 필요한 모달 알림.

Variants: \`info\` / \`success\` / \`warning\` / \`error\`.
주요 prop: \`title\`, \`message\`, \`showCancel\`, \`actionsAlign\`, \`destructive\` (confirm 빨간 강조), \`showIcon\`.
사용: \`useAlert().showAlert({...})\` — \`AlertProvider\` 하위에서.
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
		<AlertDemo
			variant="warning"
			title="경고"
			message="이 작업을 진행하시겠습니까?"
			showCancel
		/>
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
