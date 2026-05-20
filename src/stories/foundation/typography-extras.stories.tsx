import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Foundation/Typography Extras",
	tags: ["autodocs"],
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component: `
### Typography v3.1 추가 mixin

기본 \`display_*/heading_*/title_*/body_*/label_*\` 외 **추가로 노출된 mixin**들.

- **Bold variants** — 강조 시 매번 \`font-weight\` 명시 안 해도 됨
- **Semantic aliases** — \`caption / overline / subtitle / code\`
- **Responsive display** — 모바일에서 자동 축소
- **Text wrap** — \`text_balance / text_pretty / text_truncate\`
- **Numeric** — 매출/지표용 \`tabular_nums / slashed_zero\`

#### 사용

\`\`\`scss
@use "src/styles/token" as token;

.hero_title {
  @include token.display_large_responsive;
  @include token.text_balance;
}

.price {
  @include token.heading_medium_bold;
  @include token.tabular_nums;
}

.eyebrow {
  @include token.overline;
  color: token.$color_accent_default;
}
\`\`\`
      `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

const Row = ({
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

// CSS는 SCSS 컴파일러로 빌드되니, 여기선 인라인 스타일로 동일 값을 시뮬레이션해서 보여줌
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
	name: "Bold weights (강조용)",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--bt-color-text-heading)" }}
		>
			<Row label="@include display_large_bold" desc="48px / 700 / -0.02em letter-spacing">
				<div style={inlineDisplayLargeBold}>매장 운영을 더 스마트하게</div>
			</Row>
			<Row label="@include heading_large_bold" desc="28px / 700 / -0.01em">
				<div style={inlineHeadingLargeBold}>왜 Bigtablet인가요?</div>
			</Row>
			<Row label="@include title_large_bold" desc="18px / 700">
				<div style={inlineTitleLargeBold}>핵심 기능</div>
			</Row>
			<Row label="@include body_large_bold" desc="16px / 700">
				<div style={inlineBodyLargeBold}>주문을 받았습니다</div>
			</Row>
		</div>
	),
};

export const SemanticAliases: Story = {
	name: "의미적 alias",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 12, color: "var(--bt-color-text-heading)" }}
		>
			<Row label="@include subtitle" desc="제목 아래 보조 설명 — 15/500/22.5">
				<div style={inlineSubtitle}>14일 무료 체험 · 신용카드 불필요</div>
			</Row>
			<Row label="@include overline" desc="섹션 위 작은 라벨 — 12/600/uppercase">
				<div style={{ ...inlineOverline, color: "var(--bt-color-accent-default)" }}>
					핵심 기능
				</div>
			</Row>
			<Row label="@include caption" desc="이미지/카드 캡션 — 12/400/tight">
				<div style={{ ...inlineCaption, color: "var(--bt-color-text-caption)" }}>
					2026년 5월 20일 화요일
				</div>
			</Row>
			<Row label="@include code" desc="인라인 코드 — ui-monospace 13/18">
				<code style={inlineCode}>npm i @bigtablet/design-system</code>
			</Row>
		</div>
	),
};

export const TextWrapHelpers: Story = {
	name: "Text wrap helpers",
	render: () => (
		<div
			style={{ display: "flex", flexDirection: "column", gap: 16, color: "var(--bt-color-text-heading)" }}
		>
			<div>
				<code style={{ fontSize: 12 }}>@include text_balance</code>
				<p
					style={{ fontSize: 11, color: "var(--bt-color-text-caption)", margin: "2px 0 8px" }}
				>
					줄바꿈 자연스럽게 — 마지막 줄 한두 단어 외톨이 방지. 헤딩에 유용.
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
	name: "숫자 정렬 (tabular-nums)",
	render: () => (
		<div style={{ color: "var(--bt-color-text-heading)" }}>
			<p style={{ fontSize: 13, color: "var(--bt-color-text-body)", marginBottom: 16 }}>
				매출/지표 표시 시 자릿수 정렬 — <code>@include tabular_nums</code>로 숫자 너비 균등화.
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
