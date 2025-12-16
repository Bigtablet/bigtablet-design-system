import type { Meta, StoryObj } from "@storybook/react";
import { typography } from "src/styles/ts/typography";

const meta: Meta = {
    title: "foundation/typography",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### Typography (타이포그래피)

타이포그래피는 **정보의 위계(중요도)** 를 만드는 가장 중요한 기준입니다.

이 페이지는 아래 기준을 “눈으로” 확인할 수 있게 보여줍니다.
- **Font Family**: 기본 폰트
- **Font Size**: 글자 크기 스케일
- **Font Weight**: 굵기
- **Line Height / Letter Spacing**: 읽기 편한 리듬
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
    name: "타이포그래피 한눈에 보기",
    render: () => (
        <div style={{ display: "grid", gap: 28, maxWidth: 820 }}>
            <section>
                <h3 style={{ margin: 0 }}>Font Family</h3>
                <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
                    제품 전체에서 기본으로 사용하는 글꼴입니다.
                </p>
                <div
                    style={{
                        marginTop: 12,
                        padding: 16,
                        background: "#fafafa",
                        border: "1px solid #e5e5e5",
                        borderRadius: 12,
                        fontFamily: typography.fontFamily.primary,
                    }}
                >
                    <div style={{ fontSize: 18, marginBottom: 6 }}>
                        Pretendard — 가나다라마바사 ABC 123
                    </div>
                    <code>{typography.fontFamily.primary}</code>
                </div>
            </section>

            <section>
                <h3 style={{ margin: 0 }}>Font Size Scale</h3>
                <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
                    글자 크기 토큰입니다. 제목/본문/캡션 등 **역할에 맞는 크기**를 선택합니다.
                </p>

                <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
                    {Object.entries(typography.fontSize).map(([key, value]) => (
                        <div
                            key={key}
                            style={{
                                padding: 14,
                                border: "1px solid #e5e5e5",
                                borderRadius: 12,
                                background: "#fff",
                            }}
                        >
                            <div
                                style={{
                                    fontSize: value,
                                    lineHeight: typography.lineHeight.normal,
                                    fontFamily: typography.fontFamily.primary,
                                }}
                            >
                                {sampleTextForSizeKey(key)}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    marginTop: 8,
                                    fontSize: 12,
                                    opacity: 0.8,
                                }}
                            >
                                <code>{key}</code>
                                <span>{value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 style={{ margin: 0 }}>Font Weight</h3>
                <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
                    같은 크기라도 굵기에 따라 **강조 정도**가 달라집니다.
                </p>

                <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                    {Object.entries(typography.fontWeight).map(([key, value]) => (
                        <div
                            key={key}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 12,
                                padding: 14,
                                border: "1px solid #e5e5e5",
                                borderRadius: 12,
                                background: "#fff",
                                fontFamily: typography.fontFamily.primary,
                            }}
                        >
                            <div style={{ fontWeight: value as number, fontSize: 16 }}>
                                {`굵기 예시 (${key})`}
                            </div>
                            <code>{value}</code>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 style={{ margin: 0 }}>Line Height & Letter Spacing</h3>
                <p style={{ margin: "6px 0 0", opacity: 0.75, fontSize: 13 }}>
                    줄 간격과 자간은 “읽기 편한 리듬”을 만듭니다. 특히 본문에서 중요합니다.
                </p>

                <div style={{ display: "grid", gap: 14, marginTop: 12 }}>
                    {Object.entries(typography.lineHeight).map(([key, value]) => (
                        <div
                            key={key}
                            style={{
                                padding: 14,
                                border: "1px solid #e5e5e5",
                                borderRadius: 12,
                                background: "#fff",
                                fontFamily: typography.fontFamily.primary,
                            }}
                        >
                            <div style={{ fontSize: 15, lineHeight: value as number }}>
                                이 문장은 줄 간격(line-height)을 비교하기 위한 예시입니다. 텍스트가
                                촘촘하거나 넓어 보이는 차이를 확인할 수 있습니다.
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    marginTop: 8,
                                    fontSize: 12,
                                    opacity: 0.8,
                                }}
                            >
                                <code>lineHeight.{key}</code>
                                <span>{String(value)}</span>
                            </div>
                        </div>
                    ))}

                    {Object.entries(typography.letterSpacing).map(([key, value]) => (
                        <div
                            key={key}
                            style={{
                                padding: 14,
                                border: "1px solid #e5e5e5",
                                borderRadius: 12,
                                background: "#fff",
                                fontFamily: typography.fontFamily.primary,
                            }}
                        >
                            <div style={{ fontSize: 18, letterSpacing: value as string }}>
                                자간(letter-spacing) 예시 — BIGTABLET 0123
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 12,
                                    marginTop: 8,
                                    fontSize: 12,
                                    opacity: 0.8,
                                }}
                            >
                                <code>letterSpacing.{key}</code>
                                <span>{value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    ),
};

function sampleTextForSizeKey(key: string) {
    switch (key) {
        case "xs":
            return "캡션 / 도움말 / 보조 정보 (xs)";
        case "sm":
            return "서브 텍스트 / 라벨 (sm)";
        case "base":
            return "기본 본문 텍스트 (base)";
        case "md":
            return "강조 본문 또는 작은 제목 (md)";
        case "lg":
            return "섹션 제목 / 중요한 텍스트 (lg)";
        case "xl":
            return "페이지 헤더 / 큰 제목 (xl)";
        case "2xl":
            return "강한 헤드라인 (2xl)";
        case "3xl":
            return "메인 헤드라인 (3xl)";
        case "4xl":
            return "캠페인/히어로 타이틀 (4xl)";
        default:
            return "텍스트 샘플";
    }
}