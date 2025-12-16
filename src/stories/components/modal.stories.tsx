import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "../../ui/overlay/modal";

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

### 디자이너 체크 포인트
- 제목과 본문 간 여백이 충분한지
- 모바일에서도 가로가 넘치지 않는지
- 배경 오버레이 대비가 적절한지
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
                <button onClick={() => setOpen(true)}>모달 열기</button>

                <Modal
                    {...args}
                    open={open}
                    onClose={() => setOpen(false)}
                    title="모달 제목"
                >
                    이 영역에 설명, 폼, 버튼 등을 자유롭게 배치할 수 있습니다.
                </Modal>
            </div>
        );
    },
};