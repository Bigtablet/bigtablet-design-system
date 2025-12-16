import type { Meta, StoryObj } from "@storybook/react";
import { breakpoints } from "src/styles/ts/breakpoints";

const meta: Meta = {
    title: "foundation/breakpoints",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### 반응형 기준 (Breakpoints)

화면 크기에 따라 **레이아웃과 컴포넌트 배치를 변경하기 위한 기준값**입니다.

👉 모바일 · 태블릿 · 노트북 · 데스크탑을 명확히 구분해  
일관된 반응형 UI를 설계할 수 있도록 합니다.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
    name: "반응형 기준 한눈에 보기",
    render: () => (
        <div style={{ display: "grid", gap: 20, maxWidth: 720 }}>
            {Object.entries(breakpoints).map(([key, value]) => (
                <div
                    key={key}
                    style={{
                        border: "1px solid #e5e5e5",
                        borderRadius: 8,
                        padding: 16,
                    }}
                >
                    <div style={{ marginBottom: 8 }}>
                        <strong>{key}</strong>
                        <span style={{ marginLeft: 8, opacity: 0.7 }}>
              {value}px 이상
            </span>
                    </div>

                    {/* Visual bar */}
                    <div
                        style={{
                            height: 8,
                            width: "100%",
                            background: "#f0f0f0",
                            borderRadius: 4,
                            overflow: "hidden",
                        }}
                    >
                        <div
                            style={{
                                width: `${Math.min((value / 1440) * 100, 100)}%`,
                                height: "100%",
                                background: "#000",
                            }}
                        />
                    </div>

                    <p style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
                        {breakpointDescription(key)}
                    </p>
                </div>
            ))}
        </div>
    ),
};

function breakpointDescription(key: string) {
    switch (key) {
        case "mobile":
            return "모바일 환경 (한 손 사용, 단일 컬럼 기준)";
        case "tablet":
            return "태블릿 환경 (2컬럼 레이아웃 시작)";
        case "laptop":
            return "노트북 화면 (사이드바 고정 레이아웃)";
        case "desktop":
            return "데스크탑 / 대형 화면 (넉넉한 여백과 정보 밀도)";
        default:
            return "";
    }
}