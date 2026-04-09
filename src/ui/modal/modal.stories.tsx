import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from ".";

const meta: Meta<typeof Modal> = {
	title: "Components/Modal",
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
**Modal**은 화면 중앙에 표시되는 팝업 레이어입니다.

### 언제 사용하나요?
- 중요한 확인 메시지
- 폼 입력 (생성 / 수정)
- 사용자 주의를 집중시켜야 할 경우

### 사용 방법 요약
- \`open\`: 모달 표시 여부
- \`onClose\`: 닫기 이벤트 처리
- \`closeOnOverlay\`: 바깥 영역 클릭 시 닫힘 제어
- \`Esc 키\`를 누르면 자동으로 닫힙니다

### 접근성 (구현 완료)
- \`role="dialog"\` + \`aria-modal="true"\` → 스크린 리더가 모달로 인식
- **포커스 트랩**: 모달 내부에서만 Tab 이동 (바깥 요소로 빠지지 않음)
- **Escape 키**로 닫기
- 모달 열릴 때 배경 스크롤 자동 잠금 (중첩 모달도 지원)
- \`title\` 제공 시 \`aria-labelledby\`로 자동 연결
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Playground: Story = {
	name: "기본 사용 예시",
	render: (args) => {
		const [open, setOpen] = useState(false);

		return (
			<div>
				<button type="button" onClick={() => setOpen(true)}>모달 열기</button>

				<Modal {...args} open={open} onClose={() => setOpen(false)} title="모달 제목">
					이 영역에 설명, 폼, 버튼 등을 자유롭게 배치할 수 있습니다.
				</Modal>
			</div>
		);
	},
};
