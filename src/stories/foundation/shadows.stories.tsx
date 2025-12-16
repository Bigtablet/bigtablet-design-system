import type { Meta, StoryObj } from "@storybook/react";
import { shadows } from "src/styles/ts/shadows";

const meta: Meta = {
    title: "foundation/shadows",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### 그림자(Shadows) 기준

그림자는 “떠 있음(레이어)”과 “중요도(위계)”를 표현합니다.

- **sm**: 아주 가벼운 분리(카드/섹션 경계)
- **md**: 드롭다운/팝오버 같이 떠 있는 UI
- **lg**: 모달/오버레이 패널
- **xl**: 가장 강한 강조(중요한 떠 있음)
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Levels: Story = {
    name: "그림자 단계 한눈에 보기",
    render: () => (
        <div
            style={{
                background: "#fafafa",
                padding: 24,
                borderRadius: 12,
                display: "grid",
                gap: 20,
                maxWidth: 720,
            }}
        >
            {Object.entries(shadows).map(([key, value]) => (
                <div
                    key={key}
                    style={{
                        background: "#fff",
                        borderRadius: 12,
                        padding: 16,
                        boxShadow: value,
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "baseline",
                            justifyContent: "space-between",
                            gap: 12,
                        }}
                    >
                        <div>
                            <strong style={{ fontSize: 16 }}>{key}</strong>
                            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                                {shadowDescription(key)}
                            </div>
                        </div>

                        <details style={{ fontSize: 12, opacity: 0.85 }}>
                            <summary style={{ cursor: "pointer" }}>값 보기</summary>
                            <code style={{ display: "block", marginTop: 8, whiteSpace: "pre-wrap" }}>
                                {value}
                            </code>
                        </details>
                    </div>

                    <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
                        <div
                            style={{
                                width: 72,
                                height: 44,
                                borderRadius: 10,
                                background: "#fff",
                                boxShadow: value,
                                border: "1px solid rgba(0,0,0,0.06)",
                            }}
                            aria-hidden
                        />
                        <div style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.5 }}>
                            이 그림자는 <strong>{shadowUseCase(key)}</strong> 같은 UI에서 사용하면 자연스럽습니다.
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ),
};

function shadowDescription(key: string) {
    switch (key) {
        case "sm":
            return "가벼운 경계/분리(카드, 섹션)";
        case "md":
            return "떠 있는 UI(드롭다운, 팝오버)";
        case "lg":
            return "오버레이 계열(모달 패널 등)";
        case "xl":
            return "가장 강한 강조(중요한 레이어)";
        default:
            return "공통 그림자";
    }
}

function shadowUseCase(key: string) {
    switch (key) {
        case "sm":
            return "Card, Panel";
        case "md":
            return "Select list, Tooltip, Popover";
        case "lg":
            return "Modal, Drawer";
        case "xl":
            return "Full overlay emphasis";
        default:
            return "UI layer";
    }
}