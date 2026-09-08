import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Checkbox } from "../../forms/checkbox";
import { Button } from "../../general/button";
import { Stack } from "../../layout/stack";
import { Popover } from ".";

const meta: Meta<typeof Popover> = {
	title: "Components/Overlay/Popover",
	component: Popover,
	tags: ["autodocs"],
	argTypes: {
		placement: {
			control: "select",
			options: ["top", "bottom", "left", "right"],
			description: "선호 위치. 뷰포트를 벗어나면 자동 flip/shift, body 로 포탈.",
		},
		trigger: {
			control: false,
			description: "팝오버를 여는 트리거 ReactElement.",
		},
		content: {
			control: false,
			description: "임의의 interactive 콘텐츠.",
		},
		open: {
			control: false,
			description: "제어 모드 열림 상태.",
		},
	},
	args: {
		placement: "bottom",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Popover** - 클릭으로 여는 non-modal 패널. 임의의 interactive 콘텐츠(폼·설명·액션)를 담는다. 액션 리스트는 \`Menu\`, hover 정보는 \`Tooltip\` 을 쓴다.

외부 클릭이나 \`Esc\` 로 닫힌다. 열려 있는 동안 **Tab 은 패널 안에서 순환한다** - \`body\` 로 포탈돼 트리거 뒤 tab 순서가 끊기므로 Modal·Drawer·Alert 와 같은 포커스 트랩을 쓴다. 닫히면 trigger 로 복귀한다.

실측(Chromium): 마우스로 열면 포커스가 트리거에 남아 있고 **첫 Tab 이 패널로 들어간다.**

\`role="dialog"\` (non-modal) - 접근성 이름을 위해 \`aria-label\` 또는 \`aria-labelledby\` 를 전달한다.
				`.trim(),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'클릭으로 여는 non-modal 패널입니다. **`role="dialog"` 인데 접근성 이름은 자동으로 붙지 않습니다** - `aria-label` 이나 `aria-labelledby` 를 반드시 주세요. 둘 다 비우면 이름 없는 대화상자가 됩니다.\n\n열려 있는 동안 **Tab 은 패널 안에서 순환합니다** - 실측으로 두 버튼 사이를 돌고 패널을 벗어나지 않았습니다. 배경을 막지는 않지만 키보드로는 나갈 수 없으니 오래 열어 두는 패널에는 맞지 않습니다.',
			},
		},
	},
	render: (args) => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Popover
				{...args}
				aria-label="필터 옵션"
				trigger={<Button variant="outline">필터</Button>}
				content={
					<Stack gap={12}>
						<strong style={{ color: "var(--bt-color-text-heading)" }}>상태 필터</strong>
						<Checkbox label="활성" defaultChecked />
						<Checkbox label="대기" />
						<Checkbox label="종료" />
						<Button size="sm">적용</Button>
					</Stack>
				}
			/>
		</div>
	),
};

export const Placements: Story = {
	name: "위치 (4방향)",
	parameters: {
		docs: {
			description: {
				story:
					"`placement` 는 **선호값**입니다. 뷰포트를 벗어나면 반대편으로 flip 하고 교차축으로 shift 되므로 경계 근처에서 직접 조정할 필요가 없습니다.\n\n`body` 로 포탈되므로 트리거의 `overflow: hidden` 조상에 잘리지 않습니다.",
			},
		},
	},
	render: () => (
		<div
			style={{
				padding: 120,
				display: "grid",
				gridTemplateColumns: "repeat(2, auto)",
				gap: 80,
				justifyItems: "center",
			}}
		>
			{(["top", "bottom", "left", "right"] as const).map((placement) => (
				<Popover
					key={placement}
					placement={placement}
					aria-label={`${placement} 팝오버`}
					trigger={<Button variant="outline">{placement}</Button>}
					content={
						<div style={{ color: "var(--bt-color-text-body)" }}>{`placement="${placement}"`}</div>
					}
				/>
			))}
		</div>
	),
};

export const RichContent: Story = {
	name: "리치 콘텐츠",
	parameters: {
		docs: {
			description: {
				story:
					"폼이나 액션처럼 **누를 수 있는 내용**을 담을 때 씁니다. 액션만 나열하는 것이면 `Menu`, hover 로 보여 주는 설명이면 `Tooltip` 쪽입니다.\n\n내용이 길어져 스크롤이 필요해지면 `Popover` 가 아니라 `Drawer`·`Modal` 을 볼 신호입니다.",
			},
		},
	},
	render: () => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Popover
				placement="bottom"
				aria-labelledby="pop-title"
				trigger={<Button>프로필</Button>}
				content={
					<Stack gap={8}>
						<strong id="pop-title" style={{ color: "var(--bt-color-text-heading)" }}>
							박상민
						</strong>
						<span style={{ color: "var(--bt-color-text-caption)" }}>sangmin@bigtablet.com</span>
						<Stack direction="horizontal" gap={8}>
							<Button size="sm" variant="outline">
								메시지
							</Button>
							<Button size="sm">팔로우</Button>
						</Stack>
					</Stack>
				}
			/>
		</div>
	),
};

export const Controlled: Story = {
	name: "제어 모드",
	parameters: {
		docs: {
			description: {
				story:
					"`open` 을 화면이 들면 다른 동작과 엮을 수 있습니다 - 저장 성공 뒤 자동으로 닫거나, 첫 방문에 한 번 열어 주는 식.\n\n제어 모드에서도 외부 클릭·`Esc` 는 `onOpenChange` 로 알려 주므로 닫기 로직을 다시 쓰지 않습니다.",
			},
		},
	},
	render: () => {
		const [open, setOpen] = React.useState(false);
		return (
			<div style={{ padding: 80, display: "flex", justifyContent: "center", gap: 16 }}>
				<Popover
					open={open}
					onOpenChange={setOpen}
					aria-label="제어 팝오버"
					trigger={<Button variant="outline">토글</Button>}
					content={
						<Stack gap={8}>
							<span style={{ color: "var(--bt-color-text-body)" }}>외부 state 로 제어됨.</span>
							<Button size="sm" onClick={() => setOpen(false)}>
								닫기
							</Button>
						</Stack>
					}
				/>
				<Button variant="text" onClick={() => setOpen((o) => !o)}>
					{open ? "열림" : "닫힘"} (외부 버튼)
				</Button>
			</div>
		);
	},
};
