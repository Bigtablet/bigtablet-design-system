import type { Meta, StoryObj } from "@storybook/react";
import { typography, baseTypography } from "src/styles/ts/typography";

const meta: Meta = {
    title: "foundation/typography",
    tags: ["autodocs"],
    parameters: {
        docs: {
            description: {
                component: `
### Typography (타이포그래피)

**Base / Semantic 2계층 구조**로 정의된 타이포그래피 토큰입니다.

- **Base**: 원시 값 (fontSize, fontWeight, lineHeight)
- **Semantic**: 역할 기반 스케일 (display / heading / title / body / label × large/medium/small × regular/medium)

❗️직접 px 값을 쓰지 말고 **반드시 Semantic 토큰**을 사용하세요.
        `,
            },
        },
    },
};

export default meta;
type Story = StoryObj;

type TypoStyle = { fontSize: string; fontWeight: string; lineHeight: string; letterSpacing: string };

const fontWeightMap: Record<string, number> = {
    Regular: 400,
    Medium: 500,
};

function TypoRow({ scale, variant, style }: { scale: string; variant: string; style: TypoStyle }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr 200px",
                alignItems: "center",
                gap: 12,
                padding: 14,
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 12,
            }}
        >
            <div>
                <code style={{ fontSize: 12 }}>typography.{scale}.{variant}</code>
                <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>
                    {style.fontSize} / {style.lineHeight} / {style.fontWeight}
                </div>
            </div>
            <div
                style={{
                    fontFamily: typography.fontFamily.primary,
                    fontSize: style.fontSize,
                    fontWeight: fontWeightMap[style.fontWeight] ?? 400,
                    lineHeight: style.lineHeight,
                    letterSpacing: style.letterSpacing,
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                }}
            >
                {sampleText(scale)}
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, textAlign: "right" }}>
                {style.fontSize} · lh {style.lineHeight}
            </div>
        </div>
    );
}

function ScaleSection({ title, description, scale, entries }: {
    title: string;
    description: string;
    scale: string;
    entries: [string, TypoStyle][];
}) {
    return (
        <section style={{ display: "grid", gap: 8 }}>
            <div>
                <strong style={{ fontSize: 15 }}>{title}</strong>
                <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.7 }}>{description}</p>
            </div>
            {entries.map(([variant, style]) => (
                <TypoRow key={variant} scale={scale} variant={variant} style={style} />
            ))}
        </section>
    );
}

export const Semantic: Story = {
    name: "Semantic Typography",
    render: () => (
        <div style={{ display: "grid", gap: 32, maxWidth: 820 }}>
            <ScaleSection
                title="Display"
                description="히어로·캠페인 타이틀 (32–48px)"
                scale="display"
                entries={Object.entries(typography.display) as [string, TypoStyle][]}
            />
            <ScaleSection
                title="Heading"
                description="페이지/섹션 제목 (20–28px)"
                scale="heading"
                entries={Object.entries(typography.heading) as [string, TypoStyle][]}
            />
            <ScaleSection
                title="Title"
                description="카드·컴포넌트 헤더 (14–18px)"
                scale="title"
                entries={Object.entries(typography.title) as [string, TypoStyle][]}
            />
            <ScaleSection
                title="Body"
                description="본문·설명 텍스트 (14–16px)"
                scale="body"
                entries={Object.entries(typography.body) as [string, TypoStyle][]}
            />
            <ScaleSection
                title="Label"
                description="라벨·캡션·보조 텍스트 (12–14px)"
                scale="label"
                entries={Object.entries(typography.label) as [string, TypoStyle][]}
            />
        </div>
    ),
};

export const Base: Story = {
    name: "Base Tokens (raw)",
    render: () => (
        <div style={{ display: "grid", gap: 32, maxWidth: 820 }}>
            <section style={{ display: "grid", gap: 8 }}>
                <strong style={{ fontSize: 15 }}>Font Family</strong>
                <div
                    style={{
                        padding: 16,
                        background: "#fafafa",
                        border: "1px solid rgba(0,0,0,0.06)",
                        borderRadius: 12,
                        fontFamily: typography.fontFamily.primary,
                    }}
                >
                    <div style={{ fontSize: 18, marginBottom: 6 }}>
                        Pretendard — 가나다라마바사 ABC 123
                    </div>
                    <code style={{ fontSize: 12 }}>{typography.fontFamily.primary}</code>
                </div>
            </section>

            <section style={{ display: "grid", gap: 8 }}>
                <strong style={{ fontSize: 15 }}>Font Size</strong>
                <p style={{ margin: "0 0 4px", fontSize: 13, opacity: 0.7 }}>
                    ⚠️ Base 토큰은 Semantic 토큰을 통해 사용하세요.
                </p>
                {Object.entries(baseTypography.fontSize).map(([key, value]) => (
                    <div
                        key={key}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "80px 1fr 80px",
                            alignItems: "center",
                            gap: 12,
                            padding: 12,
                            background: "#fff",
                            border: "1px solid rgba(0,0,0,0.06)",
                            borderRadius: 12,
                        }}
                    >
                        <code style={{ fontSize: 12 }}>fontSize.{key}</code>
                        <div
                            style={{
                                fontFamily: typography.fontFamily.primary,
                                fontSize: value,
                                lineHeight: 1.4,
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis",
                            }}
                        >
                            텍스트 샘플 Text Sample
                        </div>
                        <span style={{ fontSize: 12, opacity: 0.6, textAlign: "right" }}>{value}</span>
                    </div>
                ))}
            </section>

            <section style={{ display: "grid", gap: 8 }}>
                <strong style={{ fontSize: 15 }}>Font Weight</strong>
                {Object.entries(baseTypography.fontWeight).map(([key, value]) => (
                    <div
                        key={key}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                            padding: 14,
                            border: "1px solid rgba(0,0,0,0.06)",
                            borderRadius: 12,
                            background: "#fff",
                            fontFamily: typography.fontFamily.primary,
                        }}
                    >
                        <div style={{ fontWeight: fontWeightMap[value] ?? 400, fontSize: 16 }}>
                            굵기 예시 — {key} ({value})
                        </div>
                        <code style={{ fontSize: 12 }}>{fontWeightMap[value] ?? value}</code>
                    </div>
                ))}
            </section>
        </div>
    ),
};

function sampleText(scale: string) {
    switch (scale) {
        case "display": return "캠페인 · 히어로 타이틀";
        case "heading": return "페이지 / 섹션 제목";
        case "title":   return "카드 · 컴포넌트 헤더";
        case "body":    return "본문 텍스트입니다. 이 문장은 가독성을 테스트합니다.";
        case "label":   return "라벨 · 캡션 · 보조 텍스트";
        default:        return "텍스트 샘플";
    }
}
