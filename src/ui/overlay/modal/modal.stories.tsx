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
**Modal** - 화면 중앙 팝업 레이어. 포커스 트랩 + Esc 닫기 + 배경 스크롤 잠금이 자동으로 적용된다.

주요 prop: \`open\`, \`onClose\`, \`width\`, \`closeOnOverlay\`, \`title\` (\`aria-labelledby\` 자동).
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
					"새 디자인 - 큰 title, paragraph description, 우측 정렬 footer 액션. 가장 일반적인 confirm·form 모달 패턴.",
			},
		},
	},
	// Docs 뷰는 모든 스토리를 한 페이지에 렌더하고 첫 스토리를 primary 프리뷰로 한 번 더 그린다.
	// 그래서 마운트 즉시 열면 모달이 겹쳐 쌓이고, 스크롤 잠금 카운터가 그 수만큼 올라가
	// Docs 페이지 자체가 `overflow: hidden` 으로 잠긴다. 격리된 story 뷰(Chromatic 스냅샷 포함)
	// 에서만 자동으로 열고, Docs 에서는 버튼으로 연다.
	render: (_args, { viewMode }) => {
		const [open, setOpen] = useState(viewMode === "story");
		return (
			<div style={{ padding: 24 }}>
				<Button onClick={() => setOpen(true)}>모달 열기</Button>
				<Modal
					open={open}
					onClose={() => setOpen(false)}
					title="Create Token"
					description={
						<>
							<p>
								Enter a unique name for your token to differentiate it from other tokens and then
								select the scope.
							</p>
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
	name: "Destructive - footer between (좌측에 destructive)",
	parameters: {
		docs: {
			description: {
				story:
					'`footerAlign="between"` - 좌측에 destructive (Delete), 우측에 safe (Cancel). 위험성을 시각화한다.',
			},
		},
	},
	// Docs 뷰는 모든 스토리를 한 페이지에 렌더하고 첫 스토리를 primary 프리뷰로 한 번 더 그린다.
	// 그래서 마운트 즉시 열면 모달이 겹쳐 쌓이고, 스크롤 잠금 카운터가 그 수만큼 올라가
	// Docs 페이지 자체가 `overflow: hidden` 으로 잠긴다. 격리된 story 뷰(Chromatic 스냅샷 포함)
	// 에서만 자동으로 열고, Docs 에서는 버튼으로 연다.
	render: (_args, { viewMode }) => {
		const [open, setOpen] = useState(viewMode === "story");
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

export const LongContent: Story = {
	name: "긴 내용 (본문 스크롤)",
	parameters: {
		docs: {
			description: {
				story:
					"패널이 뷰포트 높이를 넘지 않고, 제목·푸터는 고정된 채 본문만 스크롤된다. 예전에는 패널이 위아래로 잘리고 body 스크롤도 잠겨 있어 잘린 내용에 닿을 수 없었다.",
			},
		},
	},
	render: (_args, { viewMode }) => {
		const [open, setOpen] = useState(viewMode === "story");
		return (
			<>
				<Button onClick={() => setOpen(true)}>긴 모달 열기</Button>
				<Modal
					open={open}
					onClose={() => setOpen(false)}
					title="이용약관 전문"
					footer={<Button onClick={() => setOpen(false)}>확인</Button>}
				>
					<div>
						{Array.from({ length: 40 }, (_, i) => (
							<p key={i}>
								{i + 1}. 이 문단은 스크롤 동작을 확인하기 위한 더미 본문입니다. 패널은 뷰포트를 넘지
								않고 이 영역만 스크롤됩니다.
							</p>
						))}
					</div>
				</Modal>
			</>
		);
	},
};

export const ConditionalMount: Story = {
	name: "조건부 마운트 (등장 애니메이션)",
	parameters: {
		docs: {
			description: {
				story:
					"전역 모달 스택은 보통 열림 상태와 렌더할 content 를 같은 상태 업데이트로 넣는다. 그러면 첫 마운트 시점에 이미 `open=true` 다. 이 패턴에서도 등장 애니메이션이 나와야 한다 — react-spring 은 `from` 이 없으면 첫 렌더의 목표값을 초기값으로 잡아 보간 구간이 0 이 된다.",
			},
		},
	},
	render: () => {
		const [mounted, setMounted] = useState(false);
		return (
			<div>
				<Button onClick={() => setMounted(true)}>모달 열기 (조건부 마운트)</Button>
				{mounted && (
					<Modal open onClose={() => setMounted(false)} title="조건부 마운트">
						처음부터 <code>open=true</code> 로 마운트된 모달입니다. 페이드인 + scale 이 보여야
						합니다.
					</Modal>
				)}
			</div>
		);
	},
};
