import type { Meta, StoryObj } from "@storybook/react";
import { ServerCrash } from "lucide-react";
import { Button } from "../../general/button";
import { ErrorState } from ".";

const meta: Meta<typeof ErrorState> = {
	title: "Components/Feedback/ErrorState",
	component: ErrorState,
	tags: ["autodocs"],
	argTypes: {
		variant: { control: "select", options: ["page", "widget"] },
		title: { control: "text" },
		description: { control: "text" },
	},
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**ErrorState** - Error display for error boundary / data load failure / widget fallback. Sister of \`EmptyState\`.
에러 표시 (error boundary / 데이터 로드 실패 / 위젯 fallback). \`EmptyState\` 의 형제.

- \`variant="page"\` (default) - full-screen fill, large icon + min-height. For error boundary fallback. / 전체 화면 채움.
- \`variant="widget"\` - inline compact, inside widget/card. / 인라인 컴팩트.
- Default warning icon + \`status-error\` token. Hide with \`icon={null}\`, replace via \`icon\`. / 기본 경고 아이콘, 숨김/교체 가능.
- Automatic \`role="alert"\`. / 자동 적용.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof ErrorState>;

export const Page: Story = {
	name: "Page (전체 화면)",
	render: () => (
		<div style={{ background: "var(--bt-color-bg-solid)", minHeight: 420 }}>
			<ErrorState
				title="페이지를 불러오지 못했습니다"
				description="일시적인 문제가 발생했어요. 잠시 후 다시 시도해 주세요."
				action={<Button variant="filled">다시 시도</Button>}
			/>
		</div>
	),
};

export const Widget: Story = {
	name: "Widget (인라인)",
	render: () => (
		<div style={{ padding: 24 }}>
			<div
				style={{
					width: 320,
					border: "1px solid var(--bt-color-border-default)",
					borderRadius: 12,
					background: "var(--bt-color-bg-solid)",
				}}
			>
				<ErrorState
					variant="widget"
					title="데이터를 불러오지 못했어요"
					action={<Button variant="outline" size="sm">재시도</Button>}
				/>
			</div>
		</div>
	),
};

export const CustomIcon: Story = {
	name: "커스텀 아이콘",
	render: () => (
		<div style={{ background: "var(--bt-color-bg-solid)", minHeight: 420 }}>
			<ErrorState
				icon={<ServerCrash size={48} strokeWidth={1.5} />}
				title="서버에 연결할 수 없습니다"
				description="네트워크 상태를 확인해 주세요."
				action={<Button variant="filled">새로고침</Button>}
			/>
		</div>
	),
};
