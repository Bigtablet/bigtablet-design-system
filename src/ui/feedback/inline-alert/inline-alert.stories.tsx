import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Button } from "../../general/button";
import { InlineAlert } from ".";

const meta: Meta<typeof InlineAlert> = {
	title: "Components/Feedback/InlineAlert",
	component: InlineAlert,
	tags: ["autodocs"],
	argTypes: {
		tone: {
			control: "select",
			options: ["neutral", "info", "success", "warning", "error"],
			description: "톤. 배경과 아이콘·제목 색이 함께 바뀝니다.",
		},
		title: { control: "text" },
	},
	args: { tone: "info", title: "점검 안내" },
	parameters: {
		docs: {
			description: {
				component: `
**InlineAlert** - 페이지 안에 **계속 남는** 안내·경고 블록.

| 상황 | 컴포넌트 |
| --- | --- |
| 잠깐 보였다 사라지는 결과 알림 (저장됨) | \`Toast\` |
| 진행 전에 확인을 받아야 함 (삭제할까요?) | \`AlertProvider\` (modal) |
| 화면·위젯 전체가 비었거나 실패 | \`EmptyState\` / \`ErrorState\` |
| 화면의 한 부분에 남아 읽혀야 하는 안내·경고 (만료 예정, 개발 환경) | \`InlineAlert\` |

라이브 리전을 강제하지 않습니다. 처음부터 있는 안내는 그대로 두고, 나중에 나타나는 알림만 \`role="status"\`(정보·성공) 또는 \`role="alert"\`(즉시 알아야 하는 오류)를 주세요.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof InlineAlert>;

export const Default: Story = {
	render: (args) => (
		<InlineAlert {...args}>10월 20일 02:00~04:00 에 서비스 점검이 있습니다.</InlineAlert>
	),
};

export const Tones: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
			<InlineAlert tone="neutral" title="개발 환경">
				실제 결제가 일어나지 않습니다.
			</InlineAlert>
			<InlineAlert tone="info" title="점검 안내">
				10월 20일 02:00~04:00 에 서비스 점검이 있습니다.
			</InlineAlert>
			<InlineAlert tone="success" title="연동 완료">
				캘린더가 연결되었습니다.
			</InlineAlert>
			<InlineAlert tone="warning" title="구독이 7일 뒤 만료됩니다">
				만료되면 팀원 초대가 막힙니다.
			</InlineAlert>
			<InlineAlert tone="error" title="결제 수단 확인 필요">
				지난 결제가 실패했습니다. 카드 정보를 확인하세요.
			</InlineAlert>
		</div>
	),
};

export const WithActionAndDismiss: Story = {
	name: "액션 + 닫기",
	render: () => {
		const [open, setOpen] = React.useState(true);
		if (!open) {
			return (
				<Button size="sm" variant="outline" onClick={() => setOpen(true)}>
					다시 보기
				</Button>
			);
		}
		return (
			<div style={{ maxWidth: 560 }}>
				<InlineAlert
					tone="warning"
					title="구독이 7일 뒤 만료됩니다"
					onDismiss={() => setOpen(false)}
					action={
						<>
							<Button size="sm">지금 갱신</Button>
							<Button size="sm" variant="text">
								요금제 보기
							</Button>
						</>
					}
				>
					만료되면 팀원 초대와 파일 업로드가 막힙니다.
				</InlineAlert>
			</div>
		);
	},
};

export const ActionBoundaries: Story = {
	name: "톤별 액션 경계",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
			{(["neutral", "info", "success", "warning", "error"] as const).map((tone) => (
				<InlineAlert
					key={tone}
					tone={tone}
					title={`${tone} 액션`}
					action={
						<>
							<Button size="sm" variant="outline">
								Outline
							</Button>
							<Button size="sm" variant="tonal">
								Tonal
							</Button>
						</>
					}
				>
					톤 배경에서도 액션의 클릭 영역을 구분할 수 있습니다.
				</InlineAlert>
			))}
		</div>
	),
};

export const DescriptionOnly: Story = {
	name: "본문만 · 아이콘 없음",
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
			<InlineAlert tone="info">변경 사항은 저장 후 다음 로그인부터 적용됩니다.</InlineAlert>
			<InlineAlert tone="neutral" icon={null}>
				이 목록은 매일 오전 6시에 갱신됩니다.
			</InlineAlert>
		</div>
	),
};

export const AppearsLater: Story = {
	name: "나중에 나타나는 알림 (role)",
	render: () => {
		const [state, setState] = React.useState<"idle" | "ok" | "fail">("idle");
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 }}>
				<div style={{ display: "flex", gap: 8 }}>
					<Button size="sm" onClick={() => setState("ok")}>
						저장 성공
					</Button>
					<Button size="sm" variant="outline" onClick={() => setState("fail")}>
						저장 실패
					</Button>
				</div>
				{state === "ok" && (
					<InlineAlert tone="success" role="status">
						저장했습니다.
					</InlineAlert>
				)}
				{state === "fail" && (
					<InlineAlert tone="error" role="alert" title="저장하지 못했습니다">
						네트워크 연결을 확인하고 다시 시도하세요.
					</InlineAlert>
				)}
			</div>
		);
	},
};
