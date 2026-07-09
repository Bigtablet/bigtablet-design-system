import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../general/button";
import { Drawer } from ".";

const meta: Meta<typeof Drawer> = {
	title: "Components/Overlay/Drawer",
	component: Drawer,
	tags: ["autodocs"],
	argTypes: {
		placement: {
			control: "radio",
			options: ["left", "right", "bottom"],
			description: "슬라이드 방향 / Slide direction",
		},
		size: {
			control: "text",
			description: "패널 크기 - left/right 는 너비, bottom 은 높이 / Panel size (width for left/right, height for bottom)",
		},
		closeOnOverlay: {
			control: "boolean",
			description: "배경(오버레이)을 클릭했을 때 닫을지 여부 / Close on overlay click",
		},
		showCloseIcon: {
			control: "boolean",
			description: "우상단 X 닫기 아이콘 표시 여부 / Show close icon",
		},
	},
	args: {
		placement: "right",
		size: 360,
		closeOnOverlay: true,
		showCloseIcon: true,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Drawer** - Panel that slides in from a screen edge. Automatic focus trap + Esc to close + background scroll lock. / 화면 가장자리에서 미끄러져 들어오는 패널. 포커스 트랩 + Esc 닫기 + 배경 스크롤 잠금 자동.

Key props: \`open\`, \`onClose\`, \`placement\` ("left" | "right" | "bottom"), \`size\`, \`title\`, \`footer\`, \`closeOnOverlay\`. / 주요 prop: \`open\`, \`onClose\`, \`placement\`, \`size\`, \`title\`, \`footer\`, \`closeOnOverlay\`.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Right: Story = {
	name: "Right (기본)",
	parameters: {
		docs: {
			description: {
				story:
					"Default drawer sliding in from the right - the most common side-panel pattern for filters, details, or settings. / 우측에서 들어오는 기본 드로어 - 필터/상세/설정에 가장 흔한 사이드 패널 패턴.",
			},
		},
	},
	render: (args) => {
		const [open, setOpen] = useState(false);
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>드로어 열기</Button>
				<Drawer {...args} open={open} onClose={() => setOpen(false)} title="설정 / Settings">
					<p style={{ margin: 0 }}>
						오른쪽에서 미끄러져 들어오는 패널입니다. 폼, 목록, 상세 정보를 자유롭게 배치할 수 있습니다.
					</p>
				</Drawer>
			</div>
		);
	},
};

export const Left: Story = {
	name: "Left (내비게이션)",
	args: { placement: "left", size: 300 },
	parameters: {
		docs: {
			description: {
				story:
					"Left drawer - typical for mobile navigation menus. / 좌측 드로어 - 모바일 내비게이션 메뉴에 자주 쓰입니다.",
			},
		},
	},
	render: (args) => {
		const [open, setOpen] = useState(false);
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>메뉴 열기</Button>
				<Drawer {...args} open={open} onClose={() => setOpen(false)} title="메뉴 / Menu">
					<nav style={{ display: "grid", gap: 12 }}>
						<a href="#home">홈 / Home</a>
						<a href="#orders">주문 / Orders</a>
						<a href="#settings">설정 / Settings</a>
					</nav>
				</Drawer>
			</div>
		);
	},
};

export const Bottom: Story = {
	name: "Bottom (시트)",
	args: { placement: "bottom", size: 320 },
	parameters: {
		docs: {
			description: {
				story:
					"Bottom sheet - slides up from the bottom, common on touch devices. / 하단 시트 - 아래에서 위로 올라오며 터치 기기에서 흔합니다.",
			},
		},
	},
	render: (args) => {
		const [open, setOpen] = useState(false);
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>시트 열기</Button>
				<Drawer {...args} open={open} onClose={() => setOpen(false)} title="공유 / Share">
					<p style={{ margin: 0 }}>
						하단에서 올라오는 시트입니다. 짧은 액션 목록이나 옵션 선택에 적합합니다.
					</p>
				</Drawer>
			</div>
		);
	},
};

export const WithFooter: Story = {
	name: "With footer (액션)",
	parameters: {
		docs: {
			description: {
				story:
					"Drawer with a footer action area - confirm/cancel or save patterns. / footer 액션 영역이 있는 드로어 - 확인/취소 또는 저장 패턴.",
			},
		},
	},
	render: (args) => {
		const [open, setOpen] = useState(false);
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>편집 드로어 열기</Button>
				<Drawer
					{...args}
					open={open}
					onClose={() => setOpen(false)}
					title="프로필 편집 / Edit profile"
					footer={
						<>
							<Button variant="outline" onClick={() => setOpen(false)}>
								취소 / Cancel
							</Button>
							<Button onClick={() => setOpen(false)}>저장 / Save</Button>
						</>
					}
				>
					<p style={{ margin: 0 }}>
						본문은 스크롤되고 footer 는 항상 하단에 고정됩니다. 긴 폼에 적합합니다.
					</p>
				</Drawer>
			</div>
		);
	},
};
