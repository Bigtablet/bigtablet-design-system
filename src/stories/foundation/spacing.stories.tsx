import type { Meta, StoryObj } from "@storybook/react";
import { spacing } from "src/styles/ts/spacing";

const meta: Meta = {
    title: "foundation/spacing",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### Spacing (여백)

Spacing은 화면의 **호흡(간격)** 을 만드는 기준입니다.  
margin / padding / gap 같은 “거리”는 가능한 한 **이 토큰만** 사용합니다.

- 작은 값: 텍스트/아이콘 사이, 라벨과 입력 사이
- 중간 값: 카드 내부 padding, 섹션 간 gap
- 큰 값: 페이지 섹션 간격, 주요 레이아웃 여백
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Scale: Story = {
    name: "여백 스케일 한눈에 보기",
    render: () => (
        <div
            style={{
                background: "#fafafa",
                borderRadius: 12,
                padding: 24,
                display: "grid",
                gap: 12,
                maxWidth: 720,
            }}
        >
            {Object.entries(spacing).map(([key, value]) => (
                <div
                    key={key}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "140px 1fr 110px",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.06)",
                        borderRadius: 12,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <code>{key}</code>
                        <span style={{ fontSize: 12, opacity: 0.75 }}>{value}</span>
                    </div>

                    <div
                        style={{
                            height: 10,
                            borderRadius: 6,
                            background: "#e5e5e5",
                            overflow: "hidden",
                        }}
                        aria-hidden
                    >
                        <div
                            style={{
                                width: value,
                                height: "100%",
                                background: "#000",
                            }}
                        />
                    </div>

                    <div style={{ fontSize: 12, opacity: 0.8, textAlign: "right" }}>
                        {spacingUseCase(key)}
                    </div>
                </div>
            ))}
        </div>
    ),
};

function spacingUseCase(key: string) {
    switch (key) {
        case "xs":
            return "텍스트 사이";
        case "sm":
            return "라벨/아이콘";
        case "md":
            return "폼 필드";
        case "lg":
            return "카드 padding";
        case "xl":
            return "섹션 간격";
        case "2xl":
            return "페이지 여백";
        case "3xl":
            return "큰 레이아웃";
        default:
            return "공통 여백";
    }
}