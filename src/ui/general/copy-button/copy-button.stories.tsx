import type { Meta, StoryObj } from "@storybook/react";
import { useEffect, useState } from "react";
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

const FALLBACK_TEST_VALUE = "BTDS-copyText-iOS-fallback";

const FallbackVerificationDemo = () => {
	const [ready, setReady] = useState(false);
	const { copy, status, error } = useClipboard({ resetAfter: 0 });

	useEffect(() => {
		const ownDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
		try {
			// localhost 는 secure context 라 Clipboard API 가 존재한다. 이 story 에서만 가려
			// iOS Safari·인앱 웹뷰의 execCommand 폴백을 같은 조건으로 직접 검증한다.
			Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
			setReady(true);
		} catch {
			setReady(false);
		}

		return () => {
			if (ownDescriptor) Object.defineProperty(navigator, "clipboard", ownDescriptor);
			else Reflect.deleteProperty(navigator, "clipboard");
		};
	}, []);

	return (
		<div style={{ display: "grid", gap: 12, maxWidth: 420 }}>
			<p style={{ margin: 0, fontSize: 14 }}>
				아래 버튼은 Clipboard API를 가리고 execCommand 폴백만 사용합니다.
			</p>
			<Button
				size="sm"
				variant="outline"
				disabled={!ready}
				onClick={() => copy(FALLBACK_TEST_VALUE)}
			>
				폴백으로 복사
			</Button>
			<label style={{ display: "grid", gap: 4, fontSize: 13 }}>
				여기에 붙여넣어 확인
				<input
					aria-label="복사 결과 붙여넣기"
					style={{ minHeight: 40, padding: "4px 12px" }}
					placeholder={FALLBACK_TEST_VALUE}
				/>
			</label>
			<output aria-live="polite" style={{ fontSize: 13 }}>
				상태: {ready ? status : "이 브라우저에서는 API를 가릴 수 없음"}
				{error ? ` (${String(error)})` : ""}
			</output>
		</div>
	);
};

export const FallbackVerification: Story = {
	name: "폴백 수동 검증",
	render: () => <FallbackVerificationDemo />,
	parameters: {
		docs: {
			description: {
				story:
					"iOS Safari·인앱 브라우저 확인용입니다. 복사 버튼을 누르고 입력 칸에 붙여넣어 예상 문자열과 같은지 확인합니다.",
			},
		},
	},
};
