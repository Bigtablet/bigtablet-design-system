import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../ui/general/button";

const meta: Meta<typeof Button> = {
    title: "Components/General/Button",
    component: Button,
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["primary", "secondary", "ghost", "danger"],
            description: "버튼의 목적과 중요도에 따라 스타일을 선택합니다.",
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
            description: "버튼의 크기입니다. 텍스트와 패딩이 함께 변경됩니다.",
        },
        disabled: {
            control: "boolean",
            description: "비활성화 상태입니다. 클릭할 수 없습니다.",
        },
        onClick: { action: "clicked" },
    },
    args: {
        children: "Button",
        variant: "primary",
        size: "md",
        disabled: false,
    },
    parameters: {
        docs: {
            description: {
                component: `
**Button**은 사용자가 어떤 행동(Action)을 실행할 때 사용하는 기본 컴포넌트입니다.

### 언제 사용하나요?
- 저장, 확인, 제출, 삭제 등 사용자의 명확한 행동이 필요할 때
- 화면에서 가장 중요한 액션을 강조하고 싶을 때

### variant 선택 가이드
- **primary**: 가장 중요한 행동 (예: 저장, 확인)
- **secondary**: 보조 행동 (예: 취소, 이전)
- **ghost**: UI를 최소화한 행동 (툴바, 인라인 액션)
- **danger**: 되돌릴 수 없거나 주의가 필요한 행동 (삭제, 탈퇴)

### 디자이너 체크 포인트
- primary 버튼이 한 화면에 너무 많지 않은지
- danger 버튼이 충분히 경고처럼 보이는지
- 모바일에서도 누르기 충분한 크기인지 (권장: md 이상)
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
    name: "Primary",
};

export const Secondary: Story = {
    name: "Secondary",
    args: { variant: "secondary" },
};

export const Ghost: Story = {
    name: "Ghost",
    args: { variant: "ghost" },
};

export const Danger: Story = {
    name: "Danger",
    args: { variant: "danger" },
};

export const Sizes: Story = {
    name: "크기 비교",
    render: (args) => (
        <div style={{ display: "flex", gap: 8 }}>
            <Button {...args} size="sm">
                Small
            </Button>
            <Button {...args} size="md">
                Medium
            </Button>
            <Button {...args} size="lg">
                Large
            </Button>
        </div>
    ),
    args: { variant: "primary" },
};

export const Disabled: Story = {
    name: "비활성화",
    args: { disabled: true },
};