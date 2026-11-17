import {
	Button,
	Card,
	CopyButton,
	Dropdown,
	Field,
	InlineAlert,
	SegmentedControl,
	TextField,
} from "@bigtablet/design-system";
import { Code2, Palette, Rocket } from "lucide-react";
import { type ReactNode, useState } from "react";
import pkg from "../package.json";
import { Code, ComponentCard, type DocPage, Md } from "./docs";
import { AGENT_SNIPPET } from "./llms";

// ponytail: 저장소 문서는 develop 기준 - 릴리즈가 따라오면 main 으로
export const GITHUB = "https://github.com/Bigtablet/bigtablet-design-system";
export const NPM = "https://www.npmjs.com/package/@bigtablet/design-system";
const REPO = `${GITHUB}/blob/develop`;

/** 복사 버튼이 붙은 코드 상자. prose 는 코드가 아닌 문장(프롬프트 예시) - 본문 글꼴로 줄바꿈한다 */
export function CodeBlock({ code, prose }: { code: string; prose?: boolean }) {
	return (
		<div className="doc_snippet">
			<pre className={prose ? "doc_code doc_code_prose" : "doc_code"}>
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

/* ─── 처음 화면: 등각 격자 바닥 위에 실제로 조립된 화면 하나 ──────────────── */

const FEATURED = ["button", "text-field", "dropdown", "modal", "data-view", "toast"];

/** 격자 위에 올린 실제 화면 - DS 부품으로 조립했고 실제로 동작한다 */
function InviteDemo() {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<string | null>("member");
	const [sent, setSent] = useState("");
	const invalid = email !== "" && !email.includes("@");
	return (
		<Card heading="팀원 초대" className="landing_demo_card">
			<form
				className="landing_demo_form"
				onSubmit={(e) => {
					e.preventDefault();
					if (!email.includes("@")) return;
					setSent(email);
					setEmail("");
				}}
			>
				<Field
					name="invite-email"
					label="이메일"
					error={invalid ? "이메일 형식이 아닙니다" : undefined}
				>
					<TextField value={email} onValueChange={setEmail} placeholder="name@bigtablet.com" />
				</Field>
				<Field name="invite-role" label="역할">
					<Dropdown
						value={role}
						onValueChange={setRole}
						options={[
							{ value: "admin", label: "관리자" },
							{ value: "member", label: "구성원" },
							{ value: "viewer", label: "보기 전용" },
						]}
					/>
				</Field>
				<Button type="submit" fullWidth disabled={!email.includes("@")}>
					초대 보내기
				</Button>
				{sent && <InlineAlert tone="success">{sent} 님에게 초대를 보냈습니다.</InlineAlert>}
			</form>
		</Card>
	);
}

export function Landing({ pages }: { pages: DocPage[] }) {
	return (
		<article className="landing">
			<section className="landing_hero">
				<div className="landing_text">
					<h1>Bigtablet 디자인 시스템</h1>
					<p className="doc_lede">
						<Md>{`Bigtablet 제품 화면을 만드는 ${pages.length}개 컴포넌트와 디자인 토큰입니다. React와 서버 템플릿(Thymeleaf · JSP · PHP)에서 같은 모양으로 씁니다.`}</Md>
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
				<div className="landing_stage">
					<InviteDemo />
					<p className="landing_stage_note">
						Card · Field · TextField · Dropdown · Button · InlineAlert 로 조립했습니다. 직접 입력해
						보세요.
					</p>
				</div>
			</section>

			<dl className="landing_meta">
				<div>
					<dt>최신 버전</dt>
					<dd>
						<a href={NPM} target="_blank" rel="noreferrer">
							{pkg.version}
						</a>
					</dd>
				</div>
				<div>
					<dt>필요한 것</dt>
					<dd>React 19 이상</dd>
				</div>
				<div>
					<dt>변경 내역</dt>
					<dd>
						<a href={`${GITHUB}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
							CHANGELOG
						</a>
					</dd>
				</div>
				<div>
					<dt>소스 · 이슈</dt>
					<dd>
						<a href={GITHUB} target="_blank" rel="noreferrer">
							GitHub
						</a>
					</dd>
				</div>
			</dl>

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

			<section className="doc_block">
				<div className="landing_section_head">
					<h2>자주 쓰는 컴포넌트</h2>
					<a href="#/components">전체 {pages.length}개 보기</a>
				</div>
				<div className="ov_grid">
					{FEATURED.map((slug) => {
						const page = pages.find((p) => p.slug === slug);
						return page && <ComponentCard key={slug} page={page} />;
					})}
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

			<Block id="agents" title="AI 에이전트로 쓰기">
				<p>
					Claude Code · Codex · Cursor 가 이 패키지를 제대로 쓰게 하는 설정은{" "}
					<a href="#/ai">AI 로 쓰기</a> 에 있습니다.
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

/* ─── AI 로 쓰기 ─────────────────────────────────────────────────────── */

type Agent = "claude" | "codex" | "cursor";

// 같은 내용을 에이전트마다 읽는 파일에 둔다. Cursor 규칙 파일은 앞머리(frontmatter)가 있어야 늘 적용된다
const AGENT_FILES: Record<Agent, { file: string; code: string }> = {
	claude: { file: "CLAUDE.md", code: AGENT_SNIPPET },
	codex: { file: "AGENTS.md", code: AGENT_SNIPPET },
	cursor: {
		file: ".cursor/rules/bigtablet.mdc",
		code: `---
description: Bigtablet 디자인 시스템으로 화면을 만들 때
alwaysApply: true
---
${AGENT_SNIPPET.split("\n").slice(1).join("\n")}`,
	},
};

// 문서만 주고 "구성원 관리 화면" 을 만들게 했을 때 에이전트가 고른 조합 - 문서가 바뀌어도 이 답이 나와야 한다
const PROMPT_PICKS: [string, string][] = [
	["제목과 초대 버튼", "PageHeader"],
	["검색 · 페이지가 있는 구성원 표", "DataView + Badge"],
	["초대 대화 상자 (이메일 검증 · 역할 선택)", "Modal + Field + TextField + Dropdown"],
	["보냈다는 알림", "useToast"],
	["삭제 전 확인", "useConfirm"],
];

function Ai() {
	const [agent, setAgent] = useState<Agent>("claude");
	const { file, code } = AGENT_FILES[agent];
	return (
		<article>
			<header className="doc_block doc_head">
				<h1>
					AI 로 쓰기 <span className="doc_name">AI Agents</span>
				</h1>
				<p className="doc_lede">
					<Md>
						{
							"패키지에 에이전트가 읽는 문서가 함께 실립니다. 설정 한 번이면 에이전트가 이 디자인 시스템의 컴포넌트로 화면을 만들고, 설치한 버전에 없는 prop 을 지어내지 않습니다."
						}
					</Md>
				</p>
			</header>

			<Block id="setup" title="1. 에이전트에 연결하기">
				<p>
					앱 저장소의 에이전트 설정 파일에 아래 내용을 넣습니다. 여러 에이전트를 쓰면 파일마다 같은
					내용을 둡니다.
				</p>
				<SegmentedControl<Agent>
					size="sm"
					aria-label="에이전트"
					value={agent}
					onValueChange={setAgent}
					items={[
						{ value: "claude", label: "Claude Code" },
						{ value: "codex", label: "Codex" },
						{ value: "cursor", label: "Cursor" },
					]}
				/>
				<p>
					<Code>{file}</Code>
				</p>
				<CodeBlock code={code} />
			</Block>

			<Block id="contents" title="2. 들어 있는 것">
				<p>
					<Code>pnpm build</Code> 가 이 사이트와 같은 원본(페이지 데이터 · 예제 파일 · 타입)에서
					만들어 패키지에 싣습니다. 사이트와 내용이 갈라지지 않습니다.
				</p>
				<CodeBlock
					code={`node_modules/@bigtablet/design-system/dist/llms/
├── index.md           # 쓰기 전 규칙 + 묶음별 컴포넌트 목록
└── components/
    ├── button.md      # 언제 쓰는가 · 예제 코드 · Props 표 · 알아 둘 것
    ├── data-view.md   # props 가 가리키는 하위 타입(DataViewToolbar …) 표까지
    └── …`}
				/>
			</Block>

			<Block id="copy" title="3. 한 컴포넌트만 붙여 넣기">
				<p>
					설정 없이 채팅에서 바로 물을 때는 컴포넌트 페이지 맨 위의 <strong>마크다운 복사</strong>{" "}
					를 눌러 붙여 넣습니다. 그 컴포넌트 문서에 패키지 규칙까지 붙어 복사됩니다.
				</p>
			</Block>

			<Block id="prompt" title="4. 이렇게 요청합니다">
				<p>
					컴포넌트 이름을 몰라도 화면을 설명하면 됩니다. 에이전트는 각 문서의 "언제 쓰는가" 로
					컴포넌트를 고릅니다.
				</p>
				<CodeBlock
					prose
					code="구성원 관리 화면을 만들어 줘. 제목 옆에 초대 버튼, 검색과 페이지가 있는 구성원 표, 초대는 이메일 · 역할을 받는 대화 상자, 삭제는 한 번 확인받기."
				/>
				<p>문서만 읽은 에이전트가 고르는 조합입니다.</p>
				<div className="doc_table_wrap">
					<table className="doc_table">
						<tbody>
							{PROMPT_PICKS.map(([part, pick]) => (
								<tr key={part}>
									<td>{part}</td>
									<td>
										<Code>{pick}</Code>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Block>

			<Block id="feedback" title="문서가 틀렸을 때">
				<p>
					에이전트가 엉뚱한 컴포넌트를 고르거나 없는 prop 을 쓰면 문서의 빈틈입니다. 요청과 결과를
					붙여 <a href={`${GITHUB}/issues/new`}>이슈</a> 로 남겨 주세요.
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
	{ slug: "ai", title: "AI 로 쓰기", Body: Ai },
	{ slug: "components", title: "전체 컴포넌트", Body: null },
] as const;
