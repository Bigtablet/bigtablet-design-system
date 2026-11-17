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

프로젝트에 디자인 시스템을 설치하고 쓰는 방법입니다. React · Next.js 와 Vanilla(Thymeleaf · JSP · PHP) 두 환경을 지원합니다.
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
					subtitle="React 19 · Next.js App Router 에서 씁니다. pnpm · npm · yarn 모두 됩니다."
				/>
				<div style={{ display: "grid", gap: 20 }}>
					<Step
						number={1}
						title="패키지 설치"
						lang="bash"
						code="pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react"
					/>
					<Step
						number={2}
						title="Provider 로 감싸기"
						description="앱 최상위(예: app/layout.tsx)에서 한 번 감쌉니다. CSS 는 따로 import 하지 않습니다 - 컴포넌트가 자기 CSS 를 함께 가져옵니다. Next.js 를 webpack 으로 빌드하면 next.config 의 experimental.optimizePackageImports 에 이 패키지를 넣어야 안 쓰는 컴포넌트 CSS 가 빠집니다. useToast · useAlert 는 이 Provider 아래의 컴포넌트에서 부릅니다."
						lang="tsx"
						code={`import { ThemeProvider, AlertProvider, ToastProvider } from "@bigtablet/design-system";

<ThemeProvider>
  <AlertProvider>
    <ToastProvider>{children}</ToastProvider>
  </AlertProvider>
</ThemeProvider>`}
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
					subtitle="화면 스타일을 직접 쓸 때 색 · 간격 값을 하드코딩하지 않고 토큰을 씁니다. 그래야 다크 모드를 따라갑니다."
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
					subtitle="React 없는 서버 템플릿 환경입니다. CSS · JS 두 파일만 넣으면 됩니다."
				/>
				<div style={{ display: "grid", gap: 20 }}>
					<Step
						number={1}
						title="CSS / JS 포함"
						description="패키지의 dist/vanilla/ 에 있는 CSS · JS 를 프로젝트에 복사하거나 CDN(unpkg)으로 불러옵니다."
						lang="html"
						code={`<!-- 복사한 파일 -->
<link rel="stylesheet" href="/assets/bigtablet.min.css">
<script src="/assets/bigtablet.min.js"></script>

<!-- 또는 CDN - @4 는 4.x 최신. 화면을 고정하려면 @4.9.1 처럼 정확한 버전 -->
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.js"></script>`}
					/>
					<Step
						number={2}
						title="HTML 에서 바로 사용"
						description="클래스는 bt-컴포넌트 · bt-컴포넌트__부분 · bt-컴포넌트--변형 순서로 짓습니다. 전체 클래스 목록은 docs/VANILLA.md 에 있습니다."
						lang="html"
						code={`<!-- 버튼 -->
<button class="bt-button bt-button--md bt-button--filled">
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
						description="data-bt-* 속성이 있는 요소는 페이지가 열릴 때(DOMContentLoaded) 자동으로 동작합니다. 나중에 추가한 요소는 직접 초기화합니다."
						lang="html"
						code={`<!-- 자동 -->
<div class="bt-dropdown" data-bt-dropdown>...</div>
<div class="bt-modal" data-bt-modal>...</div>

<!-- 수동 -->
<script>
  const dropdown = Bigtablet.Dropdown('#my-dropdown', {
    onValueChange: (value) => console.log(value)
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
		variant === "subtle"
			? "var(--bt-color-bg-solid-dim, #F4F4F4)"
			: "var(--bt-color-bg-solid, #fff)";
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
					whiteSpace: "pre-wrap", // 긴 URL 은 줄바꿈 - 가로 스크롤 영역은 키보드로 닿지 않아 axe 가 막는다
					overflowWrap: "anywhere",
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
