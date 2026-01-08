import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "src/styles/ts/colors";

const meta: Meta = {
    title: "foundation/colors",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### Colors (색상 시스템)

제품 전반에서 사용하는 **공식 색상 토큰**입니다.  
❗️직접 HEX / RGB 값을 쓰지 말고 **반드시 이 토큰을 사용**하세요.

색상은 **역할(Role)** 기준으로 정의됩니다:

- **Primary**: 브랜드, 주요 액션
- **Background**: 화면 배경
- **Text**: 텍스트 계층
- **Border**: 구분선
- **Status**: 성공 / 오류 / 경고 / 정보
- **Overlay**: 오버레이
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Palette: Story = {
    name: "컬러 팔레트 한눈에 보기",
    render: () => (
        <div
            style={{
                background: colors.color_background_secondary,
                borderRadius: 12,
                padding: 24,
                display: "grid",
                gap: 12,
                maxWidth: 760,
            }}
        >
            {Object.entries(colors).map(([key, value]) => (
                <div
                    key={key}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "180px 1fr 160px",
                        alignItems: "center",
                        gap: 12,
                        padding: 12,
                        background: colors.color_background,
                        border: `1px solid ${colors.color_border_light}`,
                        borderRadius: 12,
                    }}
                >
                    {/* token + hex */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                background: value,
                                border: `1px solid ${colors.color_border}`,
                            }}
                        />
                        <div>
                            <code>{key}</code>
                            <div style={{ fontSize: 12, opacity: 0.7 }}>{value}</div>
                        </div>
                    </div>

                    {/* sample */}
                    <div
                        style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            background: value,
                            color: getReadableTextColor(value),
                            fontSize: 13,
                            textAlign: "center",
                        }}
                    >
                        Sample Text
                    </div>

                    {/* use case */}
                    <div
                        style={{
                            fontSize: 12,
                            opacity: 0.8,
                            textAlign: "right",
                        }}
                    >
                        {colorUseCase(key)}
                    </div>
                </div>
            ))}
        </div>
    ),
};