import type { Meta, StoryObj } from "@storybook/react";
import { colors } from "src/styles/ts/colors";

/** 배경색에 따라 읽기 쉬운 텍스트 색상 반환 */
const getReadableTextColor = (bgColor: string): string => {
    // rgba 또는 transparent 처리
    if (bgColor.startsWith("rgba") || bgColor === "transparent") {
        return colors.color_text_primary;
    }

    // hex to rgb
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    // 밝기 계산 (YIQ 공식)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
};

/** 색상 토큰별 용도 설명 */
const colorUseCase = (key: string): string => {
    const useCases: Record<string, string> = {
        primary: "주요 버튼, 링크",
        primaryHover: "버튼 hover",
        background: "기본 배경",
        backgroundSecondary: "카드, 섹션 배경",
        textPrimary: "본문 텍스트",
        textSecondary: "보조 텍스트",
        textTertiary: "placeholder",
        textSubtle: "미묘한 텍스트",
        textStrong: "강조 텍스트",
        textNormal: "일반 텍스트",
        textDisabled: "비활성 텍스트",
        textInverse: "어두운 배경 위 텍스트",
        border: "기본 테두리",
        borderLight: "연한 테두리",
        success: "성공 상태",
        error: "오류 상태",
        warning: "경고 상태",
        info: "정보 상태",
        overlay: "모달 오버레이",
        hoverSubtle: "텍스트필드, 셀렉트 호버 배경",
        hoverLight: "버튼 ghost/secondary 호버 배경",
    };
    return useCases[key] ?? "";
};

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
- **Hover**: 인터랙티브 요소 호버 배경
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