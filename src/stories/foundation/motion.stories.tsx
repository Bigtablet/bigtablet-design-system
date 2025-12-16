import type { Meta, StoryObj } from "@storybook/react";
import { motion } from "src/styles/ts/motion";
import * as React from "react";

const meta: Meta = {
    title: "foundation/motion",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### 모션(Motion) 기준

UI가 **얼마나 빠르게, 얼마나 부드럽게 반응하는지**를 정의하는 기준입니다.

👉 버튼 hover, 카드 강조, 모달 등장 같은  
모든 인터랙션 애니메이션에 공통으로 사용됩니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Transitions: Story = {
    name: "전환 속도 미리보기",
    render: () => (
        <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
            {Object.entries(motion.transition).map(([key, value]) => (
                <MotionPreview key={key} name={key} transition={value} />
            ))}
        </div>
    ),
};

function MotionPreview({
                           name,
                           transition,
                       }: {
    name: string;
    transition: string;
}) {
    const [active, setActive] = React.useState(false);

    return (
        <div
            style={{
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                padding: 16,
            }}
        >
            <div style={{ marginBottom: 8 }}>
                <strong>{name}</strong>
                <span style={{ marginLeft: 8, opacity: 0.7 }}>{transition}</span>
            </div>

            <div
                onClick={() => setActive((v) => !v)}
                style={{
                    width: 120,
                    height: 40,
                    borderRadius: 6,
                    background: active ? "#000" : "#e5e5e5",
                    color: active ? "#fff" : "#000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition,
                }}
            >
                Click me
            </div>

            <p style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
                {motionDescription(name)}
            </p>
        </div>
    );
}

function motionDescription(key: string) {
    switch (key) {
        case "fast":
            return "아이콘 hover, 미세한 상태 변화에 사용";
        case "base":
            return "버튼, 입력창 등 기본 인터랙션";
        case "slow":
            return "모달, 패널 등 주의가 필요한 전환";
        case "bounce":
            return "강조가 필요한 인터랙션 (토글, 피드백)";
        default:
            return "공통 인터랙션 전환";
    }
}