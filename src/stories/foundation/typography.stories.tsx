import type { Meta, StoryObj } from "@storybook/react";
import type * as React from "react";
import { baseTypography, typography } from "src/styles/typography";

const meta: Meta = {
	title: "Foundation/Typography",
	tags: ["autodocs"],
	parameters: {
		// 토큰 레퍼런스 갤러리 — 값/스케일을 보여주는 샘플·라벨이 의도적으로 저대비(실제 컴포넌트 아님). color-contrast 제외.
		a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } },
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component: `
### Typography (타이포그래피)

**Typography** - typography tokens defined in a two-tier Base / Semantic structure (5 scales × 3 sizes × 2 weights). Always use Semantic tokens instead of raw px values.

**Base / Semantic 2계층 구조**로 정의된 타이포그래피 토큰입니다.

- **Base**: 원시 값 (fontSize, fontWeight, lineHeight, letterSpacing)
- **Semantic**: 역할 기반 스케일 - 5단계 × 3사이즈 × 2굵기
- **Extras**: bold variants, semantic aliases, responsive, text wrap, numeric - 페이지 하단 참고

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
	Thin: 100,
	ExtraLight: 200,
	Light: 300,
	Regular: 400,
	Medium: 500,
	SemiBold: 600,
	Bold: 700,
	ExtraBold: 800,
	Black: 900,
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
				description="히어로·캠페인 타이틀 (32–48px) - 랜딩페이지, 프로모션 배너 등 시선을 끄는 대형 텍스트"
				scale="display"
				entries={Object.entries(typography.display) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Heading"
				description="페이지/섹션 제목 (20–28px) - 페이지 타이틀, 섹션 구분, 주요 콘텐츠 영역 제목"
				scale="heading"
				entries={Object.entries(typography.heading) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Title"
				description="카드·컴포넌트 헤더 (14–18px) - 카드 제목, 리스트 아이템 타이틀, 모달 헤더"
				scale="title"
				entries={Object.entries(typography.title) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Body"
				description="본문·설명 텍스트 (14–16px) - 단락 텍스트, 설명문, 안내 메시지"
				scale="body"
				entries={Object.entries(typography.body) as [string, TypoStyle][]}
			/>
			<ScaleSection
				title="Label"
				description="라벨·캡션·보조 텍스트 (12–14px) - 폼 라벨, 버튼 텍스트, 뱃지, 헬퍼 텍스트, 타임스탬프"
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
					<div style={{ fontSize: 18, marginBottom: 6 }}>Pretendard - 가나다라마바사 ABC 123</div>
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
				<strong style={{ fontSize: 15 }}>Letter Spacing</strong>
				<p style={{ margin: "0 0 4px", fontSize: 13, opacity: 0.7 }}>
					자간(letter-spacing) 토큰. 좁은 폭의 폼 라벨이나 캡션에서 가독성을 보강할 때 사용합니다.
				</p>
				{Object.entries(baseTypography.letterSpacing).map(([key, value]) => (
					<div
						key={key}
						style={{
							display: "grid",
							gridTemplateColumns: "120px 1fr 80px",
							alignItems: "center",
							gap: 12,
							padding: 12,
							background: "#fff",
							border: "1px solid rgba(0,0,0,0.06)",
							borderRadius: 12,
						}}
					>
						<code style={{ fontSize: 12 }}>letter-spacing-{key}</code>
						<div
							style={{
								fontFamily: typography.fontFamily.primary,
								fontSize: 14,
								letterSpacing: value,
							}}
						>
							폼 라벨 텍스트 - Form label sample
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
							굵기 예시 - font-weight-{key} ({value})
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
		<div
			style={{
				background: "#fff",
				borderRadius: 12,
				border: "1px solid #e5e5e5",
				padding: 32,
				maxWidth: 560,
			}}
		>
			<p
				style={{
					margin: "0 0 20px",
					fontSize: 12,
					color: "#2563eb",
					background: "#eff6ff",
					borderRadius: 8,
					padding: 10,
				}}
			>
				아래는 하나의 페이지에서 각 Typography 토큰이 어떤 역할을 하는지 보여줍니다.
			</p>

			{/* Display */}
			<div
				style={{
					fontFamily: typography.fontFamily.primary,
					fontSize: "36px",
					fontWeight: 500,
					lineHeight: "1.3",
					letterSpacing: "-0.02em",
					marginBottom: 8,
				}}
			>
				캠페인 타이틀
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 24 }}>
				↑ Display.large
			</span>

			{/* Heading */}
			<div
				style={{
					fontFamily: typography.fontFamily.primary,
					fontSize: "24px",
					fontWeight: 500,
					lineHeight: "1.35",
					marginBottom: 4,
				}}
			>
				섹션 제목
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 16 }}>
				↑ Heading.large
			</span>

			{/* Title */}
			<div
				style={{
					fontFamily: typography.fontFamily.primary,
					fontSize: "16px",
					fontWeight: 500,
					lineHeight: "1.5",
					marginBottom: 4,
				}}
			>
				카드 헤더 텍스트
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 8 }}>
				↑ Title.medium
			</span>

			{/* Body */}
			<div
				style={{
					fontFamily: typography.fontFamily.primary,
					fontSize: "14px",
					fontWeight: 400,
					lineHeight: "1.6",
					color: "#444",
					marginBottom: 4,
				}}
			>
				본문 텍스트입니다. 이 영역은 사용자에게 상세한 정보를 전달하는 데 사용됩니다. 적절한
				line-height와 letter-spacing으로 가독성을 확보합니다.
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block", marginBottom: 12 }}>
				↑ Body.medium
			</span>

			{/* Label */}
			<div
				style={{
					fontFamily: typography.fontFamily.primary,
					fontSize: "12px",
					fontWeight: 400,
					lineHeight: "1.4",
					color: "#999",
					marginBottom: 4,
				}}
			>
				2026-04-09 · 보조 텍스트 · 캡션
			</div>
			<span style={{ fontSize: 10, color: "#999", display: "block" }}>↑ Label.small</span>
		</div>
	),
};

export const Comparison: Story = {
	name: "차이 비교",
	render: () => {
		const sentence = "디자인 시스템은 일관된 사용자 경험을 만듭니다.";
		const scales = [
			{ name: "Display Large", style: typography.display.large },
			{ name: "Heading Large", style: typography.heading.large },
			{ name: "Title Medium", style: typography.title.medium },
			{ name: "Body Medium", style: typography.body.medium },
			{ name: "Label Small", style: typography.label.small },
		];

		return (
			<div style={{ background: "#fafafa", borderRadius: 12, padding: 24, maxWidth: 720 }}>
				<p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600 }}>
					같은 문장을 다른 타이포 스케일로 비교해보세요.
				</p>
				<p style={{ margin: "0 0 20px", fontSize: 13, color: "#666" }}>
					위에서 아래로 갈수록 작아집니다. 크기만으로 "이건 제목이고 이건 본문이구나"를 느낄 수
					있어야 합니다.
				</p>

				<div style={{ display: "grid", gap: 16 }}>
					{scales.map(({ name, style }) => (
						<div
							key={name}
							style={{
								display: "grid",
								gridTemplateColumns: "140px 1fr",
								alignItems: "baseline",
								gap: 12,
								padding: 12,
								background: "#fff",
								borderRadius: 10,
								border: "1px solid rgba(0,0,0,0.06)",
							}}
						>
							<div>
								<div style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>{name}</div>
								<div style={{ fontSize: 10, color: "#999" }}>{style.fontSize}</div>
							</div>
							<div
								style={{
									fontFamily: typography.fontFamily.primary,
									fontSize: style.fontSize,
									fontWeight: fontWeightMap[style.fontWeight] ?? 400,
									lineHeight: style.lineHeight,
								}}
							>
								{sentence}
							</div>
						</div>
					))}
				</div>

				{/* Weight 비교 */}
				<div style={{ marginTop: 24 }}>
					<p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600 }}>
						Regular vs Medium 무게 비교
					</p>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
						<div
							style={{
								background: "#fff",
								borderRadius: 10,
								padding: 16,
								border: "1px solid rgba(0,0,0,0.06)",
							}}
						>
							<div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Regular (400)</div>
							<div
								style={{
									fontFamily: typography.fontFamily.primary,
									fontSize: "20px",
									fontWeight: 400,
									lineHeight: "28px",
								}}
							>
								{sentence}
							</div>
						</div>
						<div
							style={{
								background: "#fff",
								borderRadius: 10,
								padding: 16,
								border: "1px solid rgba(0,0,0,0.06)",
							}}
						>
							<div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>Medium (500)</div>
							<div
								style={{
									fontFamily: typography.fontFamily.primary,
									fontSize: "20px",
									fontWeight: 500,
									lineHeight: "28px",
								}}
							>
								{sentence}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
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

// ────────────────────────────────────────────────────────────────────────────
// Extras - 기본 스케일 외 추가 mixin (bold variants, aliases, wrap, numeric)
// ────────────────────────────────────────────────────────────────────────────

const ExtrasRow = ({
	label,
	desc,
	children,
}: {
	label: string;
	desc: string;
	children: React.ReactNode;
}) => (
	<div
		style={{
			display: "grid",
			gridTemplateColumns: "240px 1fr",
			gap: 24,
			padding: "16px 20px",
			border: "1px solid var(--bt-color-border-default)",
			borderRadius: 12,
			alignItems: "center",
			background: "var(--bt-color-bg-solid)",
		}}
	>
		<div>
			<code style={{ fontSize: 12, color: "var(--bt-color-text-heading)" }}>{label}</code>
			<p
				style={{
					margin: "4px 0 0",
					fontSize: 11,
					color: "var(--bt-color-text-caption)",
					lineHeight: 1.4,
				}}
			>
				{desc}
			</p>
		</div>
		<div>{children}</div>
	</div>
);

const inlineDisplayLargeBold: React.CSSProperties = {
	fontSize: 48,
	fontWeight: 700,
	lineHeight: "60px",
	letterSpacing: "-0.02em",
};
const inlineHeadingLargeBold: React.CSSProperties = {
	fontSize: 28,
	fontWeight: 700,
	lineHeight: "36px",
	letterSpacing: "-0.01em",
};
const inlineTitleLargeBold: React.CSSProperties = {
	fontSize: 18,
	fontWeight: 700,
	lineHeight: "24px",
};
const inlineBodyLargeBold: React.CSSProperties = {
	fontSize: 16,
	fontWeight: 700,
	lineHeight: "24px",
};
const inlineCaption: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "16px",
	letterSpacing: "0.32px",
};
const inlineOverline: React.CSSProperties = {
	fontSize: 12,
	fontWeight: 600,
	lineHeight: "16px",
	letterSpacing: "0.08em",
	textTransform: "uppercase",
};
const inlineSubtitle: React.CSSProperties = {
	fontSize: 15,
	fontWeight: 500,
	lineHeight: "22.5px",
};
const inlineCode: React.CSSProperties = {
	fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
	fontSize: 13,
	lineHeight: "18px",
};

export const BoldVariants: Story = {
	name: "Extras - Bold weights (강조용)",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--bt-color-text-heading)" }}
		>
			<ExtrasRow label="@include display_large_bold" desc="48px / 700 / -0.02em letter-spacing">
				<div style={inlineDisplayLargeBold}>매장 운영을 더 스마트하게</div>
			</ExtrasRow>
			<ExtrasRow label="@include heading_large_bold" desc="28px / 700 / -0.01em">
				<div style={inlineHeadingLargeBold}>왜 Bigtablet인가요?</div>
			</ExtrasRow>
			<ExtrasRow label="@include title_large_bold" desc="18px / 700">
				<div style={inlineTitleLargeBold}>핵심 기능</div>
			</ExtrasRow>
			<ExtrasRow label="@include body_large_bold" desc="16px / 700">
				<div style={inlineBodyLargeBold}>주문을 받았습니다</div>
			</ExtrasRow>
		</div>
	),
};

export const SemanticAliases: Story = {
	name: "Extras - 의미적 alias",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--bt-color-text-heading)" }}
		>
			<ExtrasRow label="@include subtitle" desc="제목 아래 보조 설명 - 15/500/22.5">
				<div style={inlineSubtitle}>14일 무료 체험 · 신용카드 불필요</div>
			</ExtrasRow>
			<ExtrasRow label="@include overline" desc="섹션 위 작은 라벨 - 12/600/uppercase">
				<div style={{ ...inlineOverline, color: "var(--bt-color-accent-default)" }}>
					핵심 기능
				</div>
			</ExtrasRow>
			<ExtrasRow label="@include caption" desc="이미지/카드 캡션 - 12/400/tight">
				<div style={{ ...inlineCaption, color: "var(--bt-color-text-caption)" }}>
					2026년 5월 20일 화요일
				</div>
			</ExtrasRow>
			<ExtrasRow label="@include code" desc="인라인 코드 - ui-monospace 13/18">
				<code style={inlineCode}>npm i @bigtablet/design-system</code>
			</ExtrasRow>
		</div>
	),
};

export const TextWrapHelpers: Story = {
	name: "Extras - Text wrap helpers",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 16, color: "var(--bt-color-text-heading)" }}
		>
			<div>
				<code style={{ fontSize: 12 }}>@include text_balance</code>
				<p
					style={{ fontSize: 11, color: "var(--bt-color-text-caption)", margin: "2px 0 8px" }}
				>
					줄바꿈 자연스럽게 - 마지막 줄 한두 단어 외톨이 방지. 헤딩에 유용.
				</p>
				<h2
					style={{
						...inlineHeadingLargeBold,
						margin: 0,
						maxWidth: 400,
						textWrap: "balance",
					}}
				>
					Bigtablet으로 매장 운영을 한곳에서 관리하세요
				</h2>
			</div>
			<div>
				<code style={{ fontSize: 12 }}>@include text_truncate</code>
				<p
					style={{ fontSize: 11, color: "var(--bt-color-text-caption)", margin: "2px 0 8px" }}
				>
					한 줄 ellipsis (...).
				</p>
				<div
					style={{
						maxWidth: 300,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					한 줄에 안 들어가는 매우 긴 텍스트는 자동으로 ellipsis 처리됩니다.
				</div>
			</div>
		</div>
	),
};

export const NumericFeatures: Story = {
	name: "Extras - 숫자 정렬 (tabular-nums)",
	render: () => (
		<div style={{ color: "var(--bt-color-text-heading)" }}>
			<p style={{ fontSize: 13, color: "var(--bt-color-text-body)", marginBottom: 16 }}>
				매출/지표 표시 시 자릿수 정렬 - <code>@include tabular_nums</code>로 숫자 너비 균등화.
			</p>
			<div style={{ display: "flex", gap: 32 }}>
				<div>
					<div
						style={{ fontSize: 12, color: "var(--bt-color-text-caption)", marginBottom: 6 }}
					>
						기본 (proportional)
					</div>
					<div style={{ ...inlineHeadingLargeBold, fontVariantNumeric: "normal" }}>
						₩1,284,000
						<br />
						₩342,500
						<br />
						₩98,000
					</div>
				</div>
				<div>
					<div
						style={{ fontSize: 12, color: "var(--bt-color-text-caption)", marginBottom: 6 }}
					>
						tabular-nums (정렬)
					</div>
					<div
						style={{
							...inlineHeadingLargeBold,
							fontVariantNumeric: "tabular-nums",
						}}
					>
						₩1,284,000
						<br />
						₩342,500
						<br />
						₩98,000
					</div>
				</div>
			</div>
		</div>
	),
};
