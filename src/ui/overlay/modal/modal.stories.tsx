import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button } from "../../general/button";
import { Modal } from ".";

const meta: Meta<typeof Modal> = {
	title: "Components/Overlay/Modal",
	component: Modal,
	tags: ["autodocs"],
	argTypes: {
		width: {
			control: "text",
			description: "모달 패널의 너비(px 또는 CSS 값)",
		},
		closeOnOverlay: {
			control: "boolean",
			description: "배경(오버레이)을 클릭했을 때 닫을지 여부",
		},
	},
	args: {
		width: 520,
		closeOnOverlay: true,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Modal** — 화면 중앙 팝업 레이어. 포커스 트랩 + Esc 닫기 + 배경 스크롤 잠금 자동.

주요 prop: \`open\`, \`onClose\`, \`width\`, \`closeOnOverlay\`, \`title\` (자동 \`aria-labelledby\`).
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Modal>;

// ─── 새 패턴: title + description + footer ────────────────────────────────

export const CreateToken: Story = {
	name: "기본 (title + description + footer)",
	parameters: {
		docs: {
			description: {
				story:
					"새 디자인 — 큰 title, paragraph description, 우측 정렬 footer 액션. 가장 일반적인 confirm/form 모달 패턴.",
			},
		},
	},
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>모달 열기</Button>
				<Modal
					open={open}
					onClose={() => setOpen(false)}
					title="Create Token"
					description={
						<>
							<p>Enter a unique name for your token to differentiate it from other tokens and then select the scope.</p>
							<p>Some content contained within the modal.</p>
						</>
					}
					footer={
						<>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button onClick={() => setOpen(false)}>Continue</Button>
						</>
					}
				/>
			</div>
		);
	},
};

export const DestructiveAction: Story = {
	name: "Destructive — footer between (좌측에 destructive)",
	parameters: {
		docs: {
			description: {
				story:
					"`footerAlign=\"between\"` — 좌측에 destructive (Delete), 우측에 safe (Cancel). 위험성 시각화.",
			},
		},
	},
	render: () => {
		const [open, setOpen] = useState(true);
		return (
			<div style={{ padding: 24 }}>
				<Button danger onClick={() => setOpen(true)}>
					삭제 모달 열기
				</Button>
				<Modal
					open={open}
					onClose={() => setOpen(false)}
					title="프로젝트 삭제"
					description="이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구 삭제됩니다."
					footerAlign="between"
					footer={
						<>
							<Button variant="filled" danger onClick={() => setOpen(false)}>
								삭제
							</Button>
							<Button variant="outline" onClick={() => setOpen(false)}>
								취소
							</Button>
						</>
					}
				/>
			</div>
		);
	},
};

export const LongText: Story = {
	parameters: { chromatic: { disableSnapshot: true } },

	name: "긴 텍스트",
	render: (args) => {
		const [open, setOpen] = useState(false);

		return (
			<div>
				<button type="button" onClick={() => setOpen(true)}>
					긴 텍스트 모달 열기
				</button>

				<Modal
					{...args}
					open={open}
					onClose={() => setOpen(false)}
					title="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
				>
					<div style={{ display: "grid", gap: 16 }}>
						<p style={{ margin: 0 }}>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
							incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
							dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
							Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
							mollit anim id est laborum.
						</p>
						<p style={{ margin: 0 }}>
							동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리나라 만세. 무궁화 삼천리
							화려강산 대한사람 대한으로 길이 보전하세. 남산 위에 저 소나무 철갑을 두른 듯 바람서리
							불변함은 우리 기상일세. 가을 하늘 공활한데 높고 구름 없이 밝은 달은 우리 가슴
							일편단심일세.
						</p>
						<p style={{ margin: 0 }}>
							이 기상과 이 맘으로 충성을 다하여 괴로우나 즐거우나 나라 사랑하세. 무궁화 삼천리
							화려강산 대한사람 대한으로 길이 보전하세.
						</p>
					</div>
				</Modal>
			</div>
		);
	},
};

export const Basic: Story = {
	render: (args) => {
		const [open, setOpen] = useState(false);
		return (
			<div>
				<button type="button" onClick={() => setOpen(true)}>
					모달 열기
				</button>
				<Modal {...args} open={open} onClose={() => setOpen(false)} title="모달 제목">
					이 영역에 설명, 폼, 버튼 등을 자유롭게 배치할 수 있습니다.
				</Modal>
			</div>
		);
	},
};
