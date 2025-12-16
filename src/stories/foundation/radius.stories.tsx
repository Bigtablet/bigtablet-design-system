import type { Meta, StoryObj } from "@storybook/react";
import { radius } from "src/styles/ts/radius";

const meta: Meta = {
    title: "foundation/radius",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### Radius (모서리 둥글기)

모서리 둥글기는 컴포넌트의 **성격과 친밀도**를 표현합니다.

- 작은 값 → 단정하고 정보성 UI
- 큰 값 → 클릭 가능한 요소, 친근한 UI
- full → 원형, 토글, 아바타 등

모든 컴포넌트는 아래 기준 중 하나를 사용해야 합니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
    name: "Radius 단계 한눈에 보기",
    render: () => (
        <div
            style={{
                background: "#fafafa",
                padding: 24,
                borderRadius: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 20,
                maxWidth: 800,
            }}
        >
            {Object.entries(radius).map(([key, value]) => (
                <div
                    key={key}
                    style={{
                        textAlign: "center",
                        background: "#fff",
                        padding: 16,
                        borderRadius: 12,
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            margin: "0 auto 12px",
                            background: "#111",
                            borderRadius: value,
                        }}
                        aria-hidden
                    />
                    <strong style={{ display: "block", marginBottom: 4 }}>{key}</strong>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>
                        {value}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                        {radiusUseCase(key)}
                    </div>
                </div>
            ))}
        </div>
    ),
};

function radiusUseCase(key: string) {
    switch (key) {
        case "sm":
            return "뱃지, 태그, 얇은 카드";
        case "md":
            return "버튼, 입력창, 기본 카드";
        case "lg":
            return "모달, 큰 패널";
        case "xl":
            return "강조 카드, 히어로 영역";
        case "full":
            return "아바타, 토글, 원형 버튼";
        default:
            return "공통 UI";
    }
}