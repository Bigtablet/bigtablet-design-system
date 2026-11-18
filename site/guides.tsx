import {
	Badge,
	Button,
	CopyButton,
	Tab,
	TabList,
	TabPanel,
	Tabs,
	TextField,
	Toggle,
} from "@bigtablet/design-system";
import {
	BarChart3,
	Bell,
	Box,
	Braces,
	Calendar,
	Clock,
	Command,
	Database,
	ExternalLink,
	FileText,
	Flag,
	Folder,
	GitBranch,
	Globe,
	Inbox,
	KeyRound,
	LayoutGrid,
	Paperclip,
	Pencil,
	Save,
	Server,
	Shield,
	SlidersHorizontal,
	TrendingDown,
} from "lucide-react";
import type { ReactNode } from "react";
import pkg from "../package.json";
import { Code, type DocPage, Md, P } from "./docs";
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

/* ─── 처음 화면: 무엇이 있는지 한눈에 - 칸마다 그 페이지의 축소판 ──────────────── */

/** 격자 한 칸. 미리보기는 그림 역할만 한다 - 칸 전체가 링크라 안의 컴포넌트는 inert 로 조작을 막는다 */
function Tile({
	href,
	title,
	desc,
	children,
}: {
	href: string;
	title: string;
	desc: string;
	children: ReactNode;
}) {
	return (
		<a href={href} className="bento_tile">
			<div className="bento_preview" aria-hidden inert>
				{children}
			</div>
			<span className="bento_title">{title}</span>
			<span className="bento_desc">{desc}</span>
		</a>
	);
}

// 색 칸 - 실제 토큰 이름을 붙인 견본. 단색 DS 라 강조색보다 상태색이 대부분이다
const SWATCHES = [
	["text-heading", "heading"],
	["text-caption", "caption"],
	["border-hover", "border"],
	["accent-default", "accent"],
	["status-info", "info"],
	["status-success", "success"],
	["status-warning", "warning"],
	["status-error", "error"],
];

// 간격 칸 - 등각 바닥 위에 단계별 정육면체를 계단처럼 세운다
const STEPS = [4, 8, 12, 16, 24, 32, 48];

const ICONS = [
	LayoutGrid,
	ExternalLink,
	BarChart3,
	Clock,
	Globe,
	Flag,
	Bell,
	Box,
	Shield,
	Inbox,
	Pencil,
	FileText,
	Calendar,
	Paperclip,
	TrendingDown,
	Braces,
	KeyRound,
	Save,
	Server,
	GitBranch,
	Command,
	SlidersHorizontal,
	Folder,
	Database,
];

export function Landing({ pages }: { pages: DocPage[] }) {
	return (
		<article className="landing">
			<header className="doc_block doc_head">
				<h1>Bigtablet 디자인 시스템</h1>
				<p className="doc_lede">
					<Md>{`Bigtablet 제품 화면을 만드는 ${pages.length}개 컴포넌트와 디자인 토큰입니다. React와 서버 템플릿(Thymeleaf · JSP · PHP)에서 같은 모양으로 씁니다.`}</Md>
				</p>
				<div className="landing_install">
					<CodeBlock code="pnpm add @bigtablet/design-system" />
				</div>
				<p className="landing_meta">
					<a href={NPM} target="_blank" rel="noreferrer">
						v{pkg.version}
					</a>
					<span>React 19 이상</span>
					<a href={`${GITHUB}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer">
						변경 내역
					</a>
				</p>
			</header>

			<div className="bento">
				<Tile
					href="#/components"
					title="컴포넌트"
					desc={`React 화면을 만드는 ${pages.length}개 부품입니다.`}
				>
					<div className="bento_parts">
						<Button size="sm">저장</Button>
						<Button size="sm" variant="outline">
							취소
						</Button>
						<Badge tone="success" appearance="soft">
							진행 중
						</Badge>
						<Toggle size="sm" defaultChecked ariaLabel="알림" />
						<TextField size="sm" placeholder="이메일" aria-label="이메일" />
					</div>
				</Tile>
				<Tile
					href="#/tokens/colors"
					title="색"
					desc="라이트 · 다크에서 대비를 지키는 의미 색입니다."
				>
					<div className="bento_swatches">
						{SWATCHES.map(([token, label]) => (
							<span key={token}>
								<span style={{ background: `var(--bt-color-${token})` }} />
								{label}
							</span>
						))}
					</div>
				</Tile>
				<Tile
					href="#/tokens/typography"
					title="타이포그래피"
					desc="글자 크기가 아니라 역할로 고르는 Pretendard 스케일입니다."
				>
					<div className="bento_type">
						<span className="bento_type_heading">제목</span>
						<span className="bento_type_body">본문</span>
						<span className="bento_type_caption">캡션</span>
						<span className="bento_type_num">1,234,567</span>
					</div>
				</Tile>
				<Tile href="#/tokens/spacing" title="간격" desc="4px 단위로 맞춘 여백 · 간격 단계입니다.">
					<div className="bento_steps_floor">
						{STEPS.map((n) => (
							<span key={n}>
								<span
									style={{ width: `var(--bt-spacing-${n})`, height: `var(--bt-spacing-${n})` }}
								/>
								{n}
							</span>
						))}
					</div>
				</Tile>
				<Tile href="#/icon" title="아이콘" desc="lucide 아이콘을 토큰 크기로 씁니다.">
					<div className="bento_icons">
						{ICONS.map((I) => (
							<I key={I.displayName} size={18} />
						))}
					</div>
				</Tile>
				<Tile
					href="#/ai"
					title="AI 에이전트"
					desc="Claude Code · Codex 가 이 패키지 문서를 읽고 화면을 만듭니다."
				>
					<pre className="bento_code">
						<span className="bento_code_file">CLAUDE.md</span>
						{
							"\n## UI\n- 화면은 @bigtablet/design-system\n  컴포넌트로 만든다.\n- llms/index.md 를 먼저 읽는다."
						}
					</pre>
				</Tile>
				<Tile
					href="#/vanilla"
					title="Vanilla"
					desc="React 없이 CSS · JS 두 파일과 클래스 이름으로 씁니다."
				>
					<pre className="bento_code">
						<span className="bento_code_file">index.html</span>
						{'\n<button class="bt-button\n  bt-button--md bt-button--filled">\n  저장\n</button>'}
					</pre>
				</Tile>
				<Tile
					href="#/install"
					title="설치"
					desc="패키지 설치부터 Provider, 첫 화면까지 차례대로 따라 합니다."
				>
					<div className="bento_steps">
						<span>1. pnpm add</span>
						<span>2. Provider</span>
						<span>3. 첫 컴포넌트</span>
					</div>
				</Tile>
			</div>
		</article>
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
				<P>
					React 19 와 lucide-react 0.552 이상이 필요합니다. Next.js 는 선택이며 15 이상입니다. npm ·
					yarn · bun 도 같은 패키지 이름으로 설치합니다.
				</P>
			</Block>

			<Block id="provider" title="2. Provider 로 감싸기">
				<P>
					앱 최상위(Next.js 는 <Code>app/layout.tsx</Code>)에서 한 번 감쌉니다.{" "}
					<Code>useToast</Code> · <Code>useAlert</Code> 는 이 아래의 컴포넌트에서 부릅니다.
				</P>
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
				<P>
					CSS 는 따로 import 하지 않습니다. 컴포넌트가 자기 CSS 와 공통 테마 변수를 함께 가져옵니다.
					Next.js 를 webpack 으로 빌드하면 <Code>next.config</Code> 의{" "}
					<Code>experimental.optimizePackageImports</Code> 에 이 패키지를 넣어야 쓰지 않는 컴포넌트
					CSS 가 빠집니다 (Turbopack 은 그대로 됩니다).
				</P>
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
				<P>
					어떤 컴포넌트를 써야 할지 모르겠으면 <a href="#/components">컴포넌트</a> 에서 고르거나 ⌘K
					로 찾습니다. 페이지마다 맨 위 "언제 쓰는가" 표가 비슷한 컴포넌트 사이를 가려 줍니다.
				</P>
			</Block>

			<Block id="tokens" title="4. 직접 스타일은 토큰으로">
				<P>색 · 간격 값을 하드코딩하지 않고 토큰을 씁니다. 그래야 다크 모드를 따라갑니다.</P>
				<CodeBlock
					code={`@use "@bigtablet/design-system/scss/token" as token;

.summary {
  padding: token.$spacing_16;
  border-radius: token.$radius_md;
  color: token.$color_text_heading;
  background: token.$color_bg_solid;
}`}
				/>
				<P>
					SCSS 를 쓰지 않으면 <Code>var(--bt-color-text-heading)</Code> 같은 CSS 변수를 씁니다.
					자세한 목록은 <a href={`${REPO}/docs/THEMING.md`}>THEMING</a> 문서에 있습니다.
				</P>
			</Block>

			<Block id="agents" title="AI 에이전트로 쓰기">
				<P>
					Claude Code · Codex · Cursor 가 이 패키지를 제대로 쓰게 하는 설정은{" "}
					<a href="#/ai">AI 에이전트</a> 에 있습니다.
				</P>
			</Block>

			<Block id="upgrade" title="버전을 올릴 때">
				<P>
					사내 패키지라 minor 버전에도 하위 호환이 깨지는 변경이 들어갈 수 있습니다. 올리기 전에{" "}
					<a href={`${REPO}/docs/MIGRATION.md#업그레이드-체크리스트`}>업그레이드 체크리스트</a> 를
					봅니다.
				</P>
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
				<P>
					CDN 대신 패키지의 <Code>dist/vanilla/</Code> 에 있는 두 파일을 프로젝트에 복사해도 됩니다.
				</P>
			</Block>

			<Block id="classes" title="2. 클래스 붙이기">
				<P>
					클래스는 <Code>bt-컴포넌트</Code> · <Code>bt-컴포넌트__부분</Code> ·{" "}
					<Code>bt-컴포넌트--변형</Code> 순서로 짓습니다. 변형 이름은 React prop 값과 같습니다.
				</P>
				<CodeBlock
					code={`<button class="bt-button bt-button--md bt-button--filled">저장</button>

<div class="bt-text-field">
  <label class="bt-text-field__label" for="name">이름</label>
  <input id="name" class="bt-text-field__input bt-text-field__input--outline bt-text-field__input--md">
</div>`}
				/>
			</Block>

			<Block id="js" title="3. 움직이는 컴포넌트">
				<P>
					<Code>data-bt-*</Code> 속성이 있는 요소는 페이지가 열릴 때 자동으로 동작합니다. 나중에
					추가한 요소는 직접 초기화합니다.
				</P>
				<CodeBlock
					code={`<div class="bt-dropdown" data-bt-dropdown>…</div>

<script>
  Bigtablet.Dropdown("#later", { onValueChange: (value) => console.log(value) });
  Bigtablet.Toast("저장했습니다", "success");
</script>`}
				/>
				<P>
					전체 클래스와 JS API 는 <a href={`${REPO}/docs/VANILLA.md`}>VANILLA</a> 문서에 있습니다.
				</P>
			</Block>
		</article>
	);
}

/* ─── AI 에이전트 ─────────────────────────────────────────────────────── */

type Agent = "claude" | "codex" | "cursor";

const AGENTS: [Agent, string][] = [
	["claude", "Claude Code"],
	["codex", "Codex"],
	["cursor", "Cursor"],
];

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
	return (
		<article>
			<header className="doc_block doc_head">
				<h1>
					AI 에이전트 <span className="doc_name">AI Agents</span>
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
				<P>
					앱 저장소의 에이전트 설정 파일에 아래 내용을 넣습니다. 여러 에이전트를 쓰면 파일마다 같은
					내용을 둡니다.
				</P>
				{/* 에이전트마다 넣을 파일 · 내용이 다른 패널이라 Tabs (값 하나 고르기가 아니다) */}
				<Tabs defaultValue="claude">
					<TabList ariaLabel="에이전트">
						{AGENTS.map(([value, label]) => (
							<Tab key={value} value={value}>
								{label}
							</Tab>
						))}
					</TabList>
					{AGENTS.map(([value]) => (
						<TabPanel key={value} value={value}>
							<P>
								<Code>{AGENT_FILES[value].file}</Code>
							</P>
							<CodeBlock code={AGENT_FILES[value].code} />
						</TabPanel>
					))}
				</Tabs>
			</Block>

			<Block id="contents" title="2. 들어 있는 것">
				<P>
					<Code>pnpm build</Code> 가 이 사이트와 같은 원본(페이지 데이터 · 예제 파일 · 타입)에서
					만들어 패키지에 싣습니다. 사이트와 내용이 갈라지지 않습니다.
				</P>
				<CodeBlock
					code={`node_modules/@bigtablet/design-system/dist/llms/
├── index.md           # 쓰기 전 규칙 + 묶음별 컴포넌트 목록
└── components/
    ├── button.md      # 언제 쓰는가 · 예제 코드 · Props 표 · 알아 둘 것
    ├── data-view.md   # props 가 가리키는 하위 타입(DataViewToolbar …) 표까지
    └── …`}
				/>
				<P>
					패키지를 설치하기 전이거나 웹에서 읽는 에이전트에게는 이 사이트의{" "}
					<a href="llms.txt">
						<Code>llms.txt</Code>
					</a>{" "}
					를 알려 줍니다. 내용은 같고, 컴포넌트 문서는 <Code>components/button.md</Code> 처럼 같은
					자리에 있습니다. 사이트는 main 최신이라 설치한 버전과 다를 수 있으니, 설치했다면 패키지
					쪽을 우선합니다.
				</P>
			</Block>

			<Block id="copy" title="3. 한 컴포넌트만 붙여 넣기">
				<P>
					설정 없이 Claude · ChatGPT 채팅에서 바로 물을 때는 컴포넌트 페이지 맨 위의{" "}
					<strong>AI 용 문서 복사</strong> 를 누릅니다. 그 컴포넌트 문서에 패키지 규칙까지 붙어
					복사됩니다.
				</P>
			</Block>

			<Block id="prompt" title="4. 이렇게 요청합니다">
				<P>
					컴포넌트 이름을 몰라도 화면을 설명하면 됩니다. 에이전트는 각 문서의 "언제 쓰는가" 로
					컴포넌트를 고릅니다.
				</P>
				<CodeBlock
					prose
					code="구성원 관리 화면을 만들어 줘. 제목 옆에 초대 버튼, 검색과 페이지가 있는 구성원 표, 초대는 이메일 · 역할을 받는 대화 상자, 삭제는 한 번 확인받기."
				/>
				<P>문서만 읽은 에이전트가 고르는 조합입니다.</P>
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
				<P>
					에이전트가 엉뚱한 컴포넌트를 고르거나 없는 prop 을 쓰면 문서의 빈틈입니다. 요청과 결과를
					붙여 <a href={`${GITHUB}/issues/new`}>이슈</a> 로 남겨 주세요.
				</P>
			</Block>
		</article>
	);
}

/** 사이드바 맨 위 "시작하기" 묶음 - slug 가 "" 인 첫 화면 포함 */
export const GUIDES = [
	{ slug: "", title: "소개", name: "Overview", keywords: "시작 홈", Body: null },
	{
		slug: "install",
		title: "설치",
		name: "Installation",
		keywords: "pnpm npm next provider 시작하기",
		Body: Install,
	},
	{
		slug: "vanilla",
		title: "Vanilla",
		name: "HTML · CSS · JS",
		keywords: "thymeleaf jsp php html 서버 템플릿",
		Body: Vanilla,
	},
	{
		slug: "ai",
		title: "AI 에이전트",
		name: "AI Agents",
		keywords: "claude codex cursor agents.md claude.md llms 마크다운 에이전트",
		Body: Ai,
	},
	{ slug: "components", title: "전체 컴포넌트", name: "Components", keywords: "목록", Body: null },
] as const;
