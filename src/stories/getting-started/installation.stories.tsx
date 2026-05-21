import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";

const meta: Meta = {
	title: "Getting Started/Installation",
	tags: ["autodocs"],
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component: `
### 설치 및 설정

프로젝트에 디자인 시스템을 설치하고 사용하는 방법입니다. React/Next.js와 Vanilla(Thymeleaf, JSP, PHP) 두 환경을 지원합니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const React: Story = {
	name: "React / Next.js",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
			<Card>
				<CardHeader
					title="React / Next.js 설치"
					subtitle="React 19, Next.js App Router 호환. pnpm/npm/yarn 모두 가능."
				/>
				<div style={{ display: "grid", gap: 20 }}>
					<Step number={1} title="패키지 설치" lang="bash" code="pnpm add @bigtablet/design-system" />
					<Step
						number={2}
						title="스타일 import"
						description="앱 최상위(예: app/layout.tsx)에서 한 번만 import."
						lang="tsx"
						code={`import "@bigtablet/design-system/style.css";`}
					/>
					<Step
						number={3}
						title="컴포넌트 사용"
						lang="tsx"
						code={`import { Button, TextField } from "@bigtablet/design-system";

function MyPage() {
  return (
    <div>
      <TextField label="이름" placeholder="이름을 입력하세요" />
      <Button variant="filled" size="md">저장</Button>
    </div>
  );
}`}
					/>
				</div>
			</Card>

			<Card variant="subtle">
				<CardHeader
					title="SCSS 토큰 사용 (선택)"
					subtitle="컴포넌트 스타일을 커스텀할 때 디자인 토큰을 직접 사용."
				/>
				<CodeBlock
					lang="scss"
					code={`@use "@bigtablet/design-system/scss/token" as token;

.my-card {
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
  color: token.$color_text_body;
}`}
				/>
			</Card>
		</div>
	),
};

export const Vanilla: Story = {
	name: "Vanilla (Thymeleaf, JSP, PHP)",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
			<Card>
				<CardHeader
					title="Vanilla 설치"
					subtitle="React 없는 서버사이드 템플릿 환경. CSS + JS 두 파일만 포함하면 됨."
				/>
				<div style={{ display: "grid", gap: 20 }}>
					<Step
						number={1}
						title="CSS / JS 포함"
						description="dist/vanilla/ 의 CSS · JS 를 프로젝트에 복사하거나 CDN 로 로드."
						lang="html"
						code={`<link rel="stylesheet" href="/assets/bigtablet.min.css">
<script src="/assets/bigtablet.min.js"></script>`}
					/>
					<Step
						number={2}
						title="HTML 에서 바로 사용"
						description="BEM-like 클래스 네이밍. data-bt-* 속성으로 컴포넌트 식별."
						lang="html"
						code={`<!-- 버튼 -->
<button class="bt-button bt-button--md bt-button--primary">
  저장
</button>

<!-- 텍스트 필드 -->
<div class="bt-text-field">
  <label class="bt-text-field__label">이름</label>
  <input type="text"
    class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md"
    placeholder="이름을 입력하세요">
</div>`}
					/>
					<Step
						number={3}
						title="JS 자동 초기화"
						description="data-bt-* 속성 가진 요소는 DOMContentLoaded 에 자동 동작. 수동 init 도 가능."
						lang="html"
						code={`<!-- 자동 -->
<div class="bt-select" data-bt-select>...</div>
<div class="bt-modal" data-bt-modal>...</div>

<!-- 수동 -->
<script>
  const select = Bigtablet.Select('#my-select', {
    onChange: (value) => console.log(value)
  });
</script>`}
					/>
				</div>
			</Card>
		</div>
	),
};

// ──────────────────────────────────────────────────────────────────────────
// Layout primitives (Introduction 의 비주얼 언어 맞춤)
// ──────────────────────────────────────────────────────────────────────────

function Card({
	children,
	variant = "default",
}: {
	children: ReactNode;
	variant?: "default" | "subtle";
}) {
	const bg =
		variant === "subtle" ? "var(--bt-color-bg-solid-dim, #F4F4F4)" : "var(--bt-color-bg-solid, #fff)";
	return (
		<section
			style={{
				padding: 24,
				background: bg,
				borderRadius: 12,
				border: "1px solid var(--bt-color-border-default, #e5e5e5)",
			}}
		>
			{children}
		</section>
	);
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
	return (
		<header style={{ marginBottom: 20 }}>
			<h3
				style={{
					margin: 0,
					fontSize: 17,
					fontWeight: 600,
					color: "var(--bt-color-text-heading, #121212)",
				}}
			>
				{title}
			</h3>
			{subtitle && (
				<p
					style={{
						margin: "4px 0 0",
						fontSize: 13,
						lineHeight: 1.55,
						color: "var(--bt-color-text-caption, #666)",
					}}
				>
					{subtitle}
				</p>
			)}
		</header>
	);
}

function Step({
	number,
	title,
	description,
	lang,
	code,
}: {
	number: number;
	title: string;
	description?: string;
	lang: Lang;
	code: string;
}) {
	return (
		<div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 14 }}>
			<div
				style={{
					width: 28,
					height: 28,
					borderRadius: "50%",
					background: "var(--bt-color-brand-primary, #121212)",
					color: "var(--bt-color-text-on-brand, #fff)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 13,
					fontWeight: 600,
					flexShrink: 0,
				}}
			>
				{number}
			</div>
			<div style={{ minWidth: 0 }}>
				<strong style={{ fontSize: 14, color: "var(--bt-color-text-heading, #121212)" }}>
					{title}
				</strong>
				{description && (
					<p
						style={{
							margin: "4px 0 10px",
							fontSize: 13,
							lineHeight: 1.55,
							color: "var(--bt-color-text-caption, #666)",
						}}
					>
						{description}
					</p>
				)}
				<div style={{ marginTop: description ? 0 : 10 }}>
					<CodeBlock lang={lang} code={code} />
				</div>
			</div>
		</div>
	);
}

type Lang = "bash" | "tsx" | "scss" | "html";

const LANG_LABEL: Record<Lang, string> = {
	bash: "bash",
	tsx: "tsx",
	scss: "scss",
	html: "html",
};

function CodeBlock({ lang, code }: { lang: Lang; code: string }) {
	return (
		<div
			style={{
				position: "relative",
				background: "#0F141A",
				borderRadius: 10,
				overflow: "hidden",
				border: "1px solid rgba(255,255,255,0.05)",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 14px",
					background: "rgba(255,255,255,0.04)",
					borderBottom: "1px solid rgba(255,255,255,0.06)",
				}}
			>
				<span
					style={{
						fontSize: 11,
						fontWeight: 600,
						letterSpacing: "0.04em",
						textTransform: "uppercase",
						color: "rgba(255,255,255,0.55)",
						fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
					}}
				>
					{LANG_LABEL[lang]}
				</span>
				<div style={{ display: "flex", gap: 6 }}>
					<Dot color="#FF5F57" />
					<Dot color="#FEBC2E" />
					<Dot color="#28C840" />
				</div>
			</div>
			<pre
				style={{
					margin: 0,
					padding: "14px 16px",
					color: "#E6EAF0",
					fontSize: 13,
					lineHeight: 1.65,
					fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
					overflowX: "auto",
				}}
			>
				<code>{code}</code>
			</pre>
		</div>
	);
}

function Dot({ color }: { color: string }) {
	return (
		<span
			style={{
				width: 10,
				height: 10,
				borderRadius: "50%",
				background: color,
				opacity: 0.85,
				display: "inline-block",
			}}
		/>
	);
}
