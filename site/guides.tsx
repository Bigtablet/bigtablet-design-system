import { Badge, Button, CopyButton, Toggle } from "@bigtablet/design-system";
import { Code2, Palette, Rocket } from "lucide-react";
import type { ReactNode } from "react";
import { Code, ComponentCard, type DocPage, Md } from "./docs";

// ponytail: 저장소 문서는 develop 기준 - 릴리즈가 따라오면 main 으로
const REPO = "https://github.com/Bigtablet/bigtablet-design-system/blob/develop";

/** 복사 버튼이 붙은 코드 상자 */
export function CodeBlock({ code }: { code: string }) {
	return (
		<div className="doc_snippet">
			<pre className="doc_code">
				<code>{code.trim()}</code>
			</pre>
			<CopyButton
				className="doc_snippet_copy"
				size="sm"
				variant="text"
				iconOnly
				text={code.trim()}
				aria-label="코드 복사"
			/>
		</div>
	);
}

function Block({ id, title, children }: { id: string; title: string; children: ReactNode }) {
	return (
		<section className="doc_block doc_prose">
			<h2 id={id}>{title}</h2>
			{children}
		</section>
	);
}

/* ─── 처음 화면: 등각 격자 상자 위의 마크와 실제 부품 ───────────────────── */

export function Landing({ pages }: { pages: DocPage[] }) {
	const groups = [...new Set(pages.map((p) => p.category))].map((name) => ({
		name,
		pages: pages.filter((p) => p.category === name),
	}));
	return (
		<article>
			<section className="landing_hero">
				<div className="landing_text">
					<h1>Bigtablet 화면을 쌓는 부품 상자</h1>
					<p className="doc_lede">
						<Md>{`${pages.length}개 컴포넌트와 디자인 토큰입니다. React와 서버 템플릿(Thymeleaf · JSP · PHP)에서 같은 모양으로 씁니다.`}</Md>
					</p>
					<div className="landing_actions">
						<Button as="a" href="#/install" size="lg">
							설치하기
						</Button>
						<Button as="a" href="#/components" size="lg" variant="outline">
							컴포넌트 둘러보기
						</Button>
					</div>
					<div className="landing_install">
						<CodeBlock code="pnpm add @bigtablet/design-system" />
					</div>
				</div>
				{/* 그림 역할 - 실제 부품이지만 누르거나 포커스되지 않는다 */}
				<div className="landing_box" aria-hidden inert>
					<img className="landing_mark" src="/images/logo/favicon.png" alt="" />
					<span className="landing_part landing_part_1">
						<Button size="sm">저장</Button>
					</span>
					<span className="landing_part landing_part_2">
						<Badge tone="success">결제 완료</Badge>
					</span>
					<span className="landing_part landing_part_3">
						<Toggle ariaLabel="알림" defaultChecked />
					</span>
				</div>
			</section>

			<section className="doc_block landing_groups" aria-label="컴포넌트 묶음">
				{groups.map((g) => (
					<div key={g.name} className="landing_group">
						<h2>
							{g.name} <span>{g.pages.length}</span>
						</h2>
						<ul>
							{g.pages.map((p) => (
								<li key={p.slug}>
									<a href={`#/${p.slug}`}>{p.title}</a>
									<span>{p.name}</span>
								</li>
							))}
						</ul>
					</div>
				))}
			</section>

			<section className="doc_block">
				<h2>어디서부터 볼까요</h2>
				<div className="landing_links">
					<LinkCard
						href="#/install"
						icon={<Rocket size={20} />}
						title="설치"
						desc="패키지 설치, Provider 감싸기, 첫 컴포넌트까지 차례대로 따라 합니다."
					/>
					<LinkCard
						href="#/tokens/colors"
						icon={<Palette size={20} />}
						title="토큰"
						desc="색 · 타이포 · 간격 · 그림자 · 모션 값을 토큰 원본에서 바로 봅니다."
					/>
					<LinkCard
						href="#/vanilla"
						icon={<Code2 size={20} />}
						title="Vanilla (HTML · CSS · JS)"
						desc="React 없이 CSS · JS 두 파일과 클래스 이름으로 씁니다."
					/>
				</div>
			</section>
		</article>
	);
}

function LinkCard({
	href,
	icon,
	title,
	desc,
}: {
	href: string;
	icon: ReactNode;
	title: string;
	desc: string;
}) {
	return (
		<a href={href} className="landing_link">
			<span className="landing_link_icon" aria-hidden>
				{icon}
			</span>
			<span className="landing_link_title">{title}</span>
			<span className="landing_link_desc">{desc}</span>
		</a>
	);
}

/* ─── 설치 ──────────────────────────────────────────────────────────── */

function Install() {
	return (
		<article>
			<header className="doc_block doc_head">
				<h1>
					설치 <span className="doc_name">Installation</span>
				</h1>
				<p className="doc_lede">
					<Md>
						{
							"React 19 · Next.js App Router 프로젝트에 붙이는 순서입니다. 처음이라면 위에서부터 그대로 따라 하면 됩니다."
						}
					</Md>
				</p>
			</header>

			<Block id="package" title="1. 패키지 설치">
				<CodeBlock code="pnpm add @bigtablet/design-system react@^19 react-dom@^19 lucide-react" />
				<p>
					React 19 와 lucide-react 0.552 이상이 필요합니다. Next.js 는 선택이며 15 이상입니다. npm ·
					yarn · bun 도 같은 패키지 이름으로 설치합니다.
				</p>
			</Block>

			<Block id="provider" title="2. Provider 로 감싸기">
				<p>
					앱 최상위(Next.js 는 <Code>app/layout.tsx</Code>)에서 한 번 감쌉니다.{" "}
					<Code>useToast</Code> · <Code>useAlert</Code> 는 이 아래의 컴포넌트에서 부릅니다.
				</p>
				<CodeBlock
					code={`import { AlertProvider, ThemeProvider, ToastProvider } from "@bigtablet/design-system";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          <AlertProvider>
            <ToastProvider>{children}</ToastProvider>
          </AlertProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}`}
				/>
				<p>
					CSS 는 따로 import 하지 않습니다 - 컴포넌트가 자기 CSS 와 공통 테마 변수를 함께
					가져옵니다. Next.js 를 webpack 으로 빌드하면 <Code>next.config</Code> 의{" "}
					<Code>experimental.optimizePackageImports</Code> 에 이 패키지를 넣어야 쓰지 않는 컴포넌트
					CSS 가 빠집니다 (Turbopack 은 그대로 됩니다).
				</p>
			</Block>

			<Block id="first" title="3. 첫 컴포넌트">
				<CodeBlock
					code={`"use client";
import { Button, useToast } from "@bigtablet/design-system";

export function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.success("저장했습니다")}>저장</Button>;
}`}
				/>
				<p>
					어떤 컴포넌트를 써야 할지 모르겠으면 <a href="#/components">컴포넌트</a> 에서 고르거나 ⌘K
					로 찾습니다. 페이지마다 맨 위 "언제 쓰는가" 표가 비슷한 컴포넌트 사이를 가려 줍니다.
				</p>
			</Block>

			<Block id="tokens" title="4. 직접 스타일은 토큰으로">
				<p>색 · 간격 값을 하드코딩하지 않고 토큰을 씁니다. 그래야 다크 모드를 따라갑니다.</p>
				<CodeBlock
					code={`@use "@bigtablet/design-system/scss/token" as token;

.summary {
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
  color: token.$color_text_heading;
  background: token.$color_bg_solid;
}`}
				/>
				<p>
					SCSS 를 쓰지 않으면 <Code>var(--bt-color-text-heading)</Code> 같은 CSS 변수를 씁니다.
					자세한 목록은 <a href={`${REPO}/docs/THEMING.md`}>THEMING</a> 문서에 있습니다.
				</p>
			</Block>

			<Block id="upgrade" title="버전을 올릴 때">
				<p>
					사내 패키지라 minor 버전에도 하위 호환이 깨지는 변경이 들어갈 수 있습니다. 올리기 전에{" "}
					<a href={`${REPO}/docs/MIGRATION.md#업그레이드-체크리스트`}>업그레이드 체크리스트</a> 를
					봅니다.
				</p>
			</Block>
		</article>
	);
}

/* ─── Vanilla ───────────────────────────────────────────────────────── */

function Vanilla() {
	return (
		<article>
			<header className="doc_block doc_head">
				<h1>
					Vanilla <span className="doc_name">HTML · CSS · JS</span>
				</h1>
				<p className="doc_lede">
					<Md>
						{
							"React 가 없는 서버 템플릿(Thymeleaf · JSP · PHP · Django)에서 씁니다. CSS · JS 두 파일을 넣고 클래스 이름을 붙이면 됩니다."
						}
					</Md>
				</p>
			</header>

			<Block id="include" title="1. CSS · JS 넣기">
				<CodeBlock
					code={`<!-- @4 는 4.x 최신을 받습니다. 화면을 고정하려면 @4.9.1 처럼 정확한 버전을 씁니다 -->
<link rel="stylesheet" href="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.css">
<script src="https://unpkg.com/@bigtablet/design-system@4/dist/vanilla/bigtablet.min.js"></script>`}
				/>
				<p>
					CDN 대신 패키지의 <Code>dist/vanilla/</Code> 에 있는 두 파일을 프로젝트에 복사해도 됩니다.
				</p>
			</Block>

			<Block id="classes" title="2. 클래스 붙이기">
				<p>
					클래스는 <Code>bt-컴포넌트</Code> · <Code>bt-컴포넌트__부분</Code> ·{" "}
					<Code>bt-컴포넌트--변형</Code> 순서로 짓습니다. 변형 이름은 React prop 값과 같습니다.
				</p>
				<CodeBlock
					code={`<button class="bt-button bt-button--md bt-button--filled">저장</button>

<div class="bt-text-field">
  <label class="bt-text-field__label" for="name">이름</label>
  <input id="name" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md">
</div>`}
				/>
			</Block>

			<Block id="js" title="3. 움직이는 컴포넌트">
				<p>
					<Code>data-bt-*</Code> 속성이 있는 요소는 페이지가 열릴 때 자동으로 동작합니다. 나중에
					추가한 요소는 직접 초기화합니다.
				</p>
				<CodeBlock
					code={`<div class="bt-dropdown" data-bt-dropdown>…</div>

<script>
  Bigtablet.Dropdown("#later", { onValueChange: (value) => console.log(value) });
  Bigtablet.Toast("저장했습니다", "success");
</script>`}
				/>
				<p>
					전체 클래스와 JS API 는 <a href={`${REPO}/docs/VANILLA.md`}>VANILLA</a> 문서에 있습니다.
				</p>
			</Block>
		</article>
	);
}

/** 사이드바 맨 위 "시작하기" 묶음 - slug 가 "" 인 첫 화면 포함 */
export const GUIDES = [
	{ slug: "", title: "소개", Body: null },
	{ slug: "install", title: "설치", Body: Install },
	{ slug: "vanilla", title: "Vanilla", Body: Vanilla },
	{ slug: "components", title: "전체 컴포넌트", Body: null },
] as const;
