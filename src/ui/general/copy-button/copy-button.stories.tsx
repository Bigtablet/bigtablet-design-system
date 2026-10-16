import type { Meta, StoryObj } from "@storybook/react";
import { useClipboard } from "../../../utils";
import { ToastProvider } from "../../feedback/toast";
import { useToast } from "../../feedback/toast/use-toast";
import { Button } from "../button";
import { CopyButton } from ".";

const meta: Meta<typeof CopyButton> = {
	title: "Components/General/CopyButton",
	component: CopyButton,
	tags: ["autodocs"],
	argTypes: {
		iconOnly: {
			control: "boolean",
			description: "아이콘만 (IconButton). `label` 이 접근성 이름이 됩니다.",
		},
		size: { control: "select", options: ["sm", "md"] },
		variant: { control: "select", options: ["filled", "tonal", "outline", "text"] },
	},
	args: {
		text: "https://bigtablet.com/invite/abc123",
		iconOnly: false,
		size: "sm",
		variant: "outline",
	},
	parameters: {
		docs: {
			description: {
				component: `
**CopyButton** - 텍스트 복사 버튼. 복사되면 2초간 체크 아이콘 · "복사됨" 으로 바뀌고, 결과를 숨긴 \`role="status"\` 로 스크린리더에도 알립니다. Clipboard API 가 없거나 거부되는 환경(인앱 브라우저 · HTTP 사내망)에서는 \`execCommand\` 폴백을 쓰고 사용자의 선택 영역과 포커스를 되돌립니다.

버튼 없이 복사만 필요하면 \`useClipboard()\` 훅(\`copy\` · \`status\` · \`error\` · \`reset\`) 또는 \`copyText()\` 를 쓰세요. 둘 다 Toast 에 의존하지 않습니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {};

export const IconOnly: Story = {
	name: "아이콘만",
	render: () => (
		<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
			<code style={{ fontSize: 13 }}>sk_live_••••••••3f9a</code>
			<CopyButton text="sk_live_example_3f9a" iconOnly label="API 키 복사" />
		</div>
	),
};

const WithToastDemo = () => {
	const toast = useToast();
	return (
		<CopyButton
			text="https://bigtablet.com/invite/abc123"
			label="초대 링크 복사"
			onCopy={() => toast.success("초대 링크를 복사했습니다")}
			onError={() => toast.error("복사하지 못했습니다. 링크를 길게 눌러 복사하세요.")}
		/>
	);
};

export const WithToast: Story = {
	name: "Toast 와 함께",
	render: () => (
		<ToastProvider>
			<WithToastDemo />
		</ToastProvider>
	),
};

export const Hook: Story = {
	name: "useClipboard 훅",
	render: () => {
		const { copy, status } = useClipboard();
		return (
			<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
				<Button size="sm" variant="tonal" onClick={() => copy("주문번호 2026-1016-0042")}>
					주문번호 복사
				</Button>
				<span style={{ fontSize: 13 }} aria-live="polite">
					상태: {status}
				</span>
			</div>
		);
	},
};
