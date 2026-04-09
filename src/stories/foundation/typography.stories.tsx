import type { Meta, StoryObj } from "@storybook/react";
import { baseTypography, typography } from "src/styles/ts/typography";

const meta: Meta = {
	title: "Foundation/typography",
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
### Typography (타이포그래피)

**Base / Semantic 2계층 구조**로 정의된 타이포그래피 토큰입니다.

- **Base**: 원시 값 (fontSize, fontWeight, lineHeight, letterSpacing)
- **Semantic**: 역할 기반 스케일 — 5단계 × 3사이즈 × 2굵기

| 스케일 | 사이즈 범위 | 사용처 |
|--------|-------------|--------|
| Display | 32–48px | 히어로·캠페인 타이틀 |
| Heading | 20–28px | 페이지/섹션 제목 |
| Title | 14–18px | 카드·컴포넌트 헤더 |
| Body | 14–16px | 본문·설명 텍스트 |
| Label | 12–14px | 라벨·캡션·보조 텍스트 |

각 스케일에는 **large / medium / small** 사이즈와 **regular / medium** 굵기가 있습니다.

❗️직접 px 값을 쓰지 말고 **반드시 Semantic 토큰**을 사용하세요.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

type TypoStyle = {
	fontSize: string;
	fontWeight: string;
	lineHeight: string;
	letterSpacing: string;
};

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
				<code style={{ fontSize: 12 }}>
					typography.{scale}.{variant}
				</code>
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

function ScaleSection({
	title,
	description,
	scale,
	entries,
}: {
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
				description="히어로·캠페인 타이틀 (32–48px) — 랜딩페이지, 프로모션 배너 등 시선을 끄는 대형 텍스트"
				scale="display"
				entries={Object.entries(typography.display) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Heading"
				description="페이지/섹션 제목 (20–28px) — 페이지 타이틀, 섹션 구분, 주요 콘텐츠 영역 제목"
				scale="heading"
				entries={Object.entries(typography.heading) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Title"
				description="카드·컴포넌트 헤더 (14–18px) — 카드 제목, 리스트 아이템 타이틀, 모달 헤더"
				scale="title"
				entries={Object.entries(typography.title) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Body"
				description="본문·설명 텍스트 (14–16px) — 단락 텍스트, 설명문, 안내 메시지"
				scale="body"
				entries={Object.entries(typography.body) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Label"
				description="라벨·캡션·보조 텍스트 (12–14px) — 폼 라벨, 버튼 텍스트, 뱃지, 헬퍼 텍스트, 타임스탬프"
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
					<div style={{ fontSize: 18, marginBottom: 6 }}>Pretendard — 가나다라마바사 ABC 123</div>
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
						<code style={{ fontSize: 12 }}>font-size-{key}</code>
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
							굵기 예시 — font-weight-{key} ({value})
						</div>
						<code style={{ fontSize: 12 }}>{fontWeightMap[value] ?? value}</code>
					</div>
				))}
			</section>
		</div>
	),
};

export const Hierarchy: Story = {
	name: "실제 페이지 위계 예시",
	render: () => (
		<div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 32, maxWidth: 560 }}>
			<p style={{ margin: "0 0 20px", fontSize: 12, color: "#2563eb", background: "#eff6ff", borderRadius: 8, padding: 10 }}>
				아래는 하나의 페이지에서 각 Typography 토큰이 어떤 역할을 하는지 보여줍니다.
			</p>

			{/* Display */}
			<div style={{ fontFamily: typography.fontFamily.primary, fontSize: "36px", fontWeight: 500, lineHeight: "1.3", letterSpacing: "-0.02em", marginBottom: 8 }}>
				캠페인 타이틀
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 24 }}>↑ Display.large</span>

			{/* Heading */}
			<div style={{ fontFamily: typography.fontFamily.primary, fontSize: "24px", fontWeight: 500, lineHeight: "1.35", marginBottom: 4 }}>
				섹션 제목
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 16 }}>↑ Heading.large</span>

			{/* Title */}
			<div style={{ fontFamily: typography.fontFamily.primary, fontSize: "16px", fontWeight: 500, lineHeight: "1.5", marginBottom: 4 }}>
				카드 헤더 텍스트
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 8 }}>↑ Title.medium</span>

			{/* Body */}
			<div style={{ fontFamily: typography.fontFamily.primary, fontSize: "14px", fontWeight: 400, lineHeight: "1.6", color: "#444", marginBottom: 4 }}>
				본문 텍스트입니다. 이 영역은 사용자에게 상세한 정보를 전달하는 데 사용됩니다.
				적절한 line-height와 letter-spacing으로 가독성을 확보합니다.
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 12 }}>↑ Body.medium</span>

			{/* Label */}
			<div style={{ fontFamily: typography.fontFamily.primary, fontSize: "12px", fontWeight: 400, lineHeight: "1.4", color: "#999", marginBottom: 4 }}>
				2026-04-09 · 보조 텍스트 · 캡션
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block" }}>↑ Label.small</span>
		</div>
	),
};

function sampleText(scale: string) {
	switch (scale) {
		case "display":
			return "캠페인 · 히어로 타이틀";
		case "heading":
			return "페이지 / 섹션 제목";
		case "title":
			return "카드 · 컴포넌트 헤더";
		case "body":
			return "본문 텍스트입니다. 이 문장은 가독성을 테스트합니다.";
		case "label":
			return "라벨 · 캡션 · 보조 텍스트";
		default:
			return "텍스트 샘플";
	}
}
