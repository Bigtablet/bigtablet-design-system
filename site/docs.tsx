import { CopyButton, SegmentedControl } from "@bigtablet/design-system";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { type ComponentType, Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { splitSentences } from "src/utils/sentences";
import { AGENT_RULES, componentDoc } from "./llms";
import { type PlaygroundConfig, usePlayground } from "./playground";
import props from "./props.json";

export type PropsName = keyof typeof props;

export interface DocPage {
	slug: string;
	category: string;
	/** 그룹 안 순서 - 자주 쓰는 것부터 */
	order?: number;
	title: string;
	/** 한국어 이름 - 사이드바 · 목록에서 코드명 옆에 붙는다 */
	name: string;
	/** 예전 한국어 이름 · 다른 호칭 - 화면에 안 보이고 검색에만 걸린다 */
	aka?: string;
	summary: string;
	/** [상황, 고를 것, 이 컴포넌트인가] */
	when: [string, string, boolean][];
	examples: {
		id: string;
		title: string;
		desc?: string;
		/** 화면 전체를 쓰는 예제(AppShell · 고정 바) - 전체 폭도 이 높이의 iframe 으로 */
		frame?: number;
		/**
		 * 오버레이 예제 - 첫 버튼을 눌러 열린 모습을 보여 준다 (#1060). 스크롤 잠금 · 포커스 이동이 문서 페이지를
		 * 건드리지 않게 늘 iframe(높이는 `frame`, 없으면 420)에서 연다
		 */
		open?: boolean;
	}[];
	/** 여러 개면 순서대로 표를 하나씩 (Tabs · TabList · Tab …) */
	props?: PropsName | PropsName[];
	/** 첫 예제 박스의 "조절" - 첫 props 표의 값 목록 · boolean prop 으로 컨트롤을 만든다 */
	playground?: PlaygroundConfig;
	notes?: string[];
}

// 예제 파일 하나가 화면 · 코드 보기 · (나중에) axe 테스트의 원본이다
const modules = import.meta.glob<{ default: ComponentType }>("./examples/**/*.tsx", {
	eager: true,
});
const sources = import.meta.glob<string>("./examples/**/*.tsx", {
	eager: true,
	query: "?raw",
	import: "default",
});
/**
 * 예제 속 링크(Breadcrumb · NavLink · Hero 버튼 …)는 누르면 화면만 바뀌고 실제로 이동하지 않는다.
 * 사이트가 해시 라우팅이라 `href="#"` 를 누르면 문서 첫 화면으로 튕긴다. 캡처 단계에서 기본 동작만 막고
 * 컴포넌트의 onClick(선택 상태 바꾸기)은 그대로 돈다
 */
export function stayOnPage(e: { target: EventTarget | null; preventDefault: () => void }) {
	if (e.target instanceof Element && e.target.closest("a[href]")) e.preventDefault();
}

export const exampleOf = (id: string) => modules[`./examples/${id}.tsx`]?.default;
export const sourceOf = (id: string) => sources[`./examples/${id}.tsx`] ?? "";

/** 코드 이름은 구분 기호(. _ - / | , = 여는 괄호) 뒤에서만 줄이 바뀌게 <wbr> 을 넣는다 - 글자 중간에서 끊기지 않는다 */
export function Code({ children, className }: { children: string; className?: string }) {
	// 따옴표 안("year-month") · Sass 보간(#{$x})은 값 하나라 끊지 않는다 - 따옴표 밖에서만 구분 기호 뒤에 <wbr>
	const parts = children
		.split(/("[^"]*"|#\{[^}]*\}\)?)/)
		.flatMap((chunk) => (/^("|#\{)/.test(chunk) ? [chunk] : chunk.split(/(?<=[._\-/|,(<=])/)))
		.filter(Boolean);
	return (
		<code className={className}>
			{parts.map((part, i) => (
				<Fragment key={i}>
					{i > 0 && <wbr />}
					{/^("|#\{)/.test(part) ? <span className="code_nobreak">{part}</span> : part}
				</Fragment>
			))}
		</code>
	);
}

/** 기본값 칸 - `"md"` · 함수 같은 값은 코드로, "로케일 `x`" · "현재 연도 + 10" 같은 설명은 글로 */
function DefaultValue({ value }: { value: string }) {
	const isCode = /^"[^"]*"$/.test(value) || value.includes("=>") || !/[가-힣`]/.test(value);
	// 함수 기본값은 짧은 한 줄 코드라 통째로 둔다
	if (value.includes("=>")) return <code className="code_nobreak">{value}</code>;
	return isCode ? <Code>{value}</Code> : <Md>{value}</Md>;
}

/**
 * 문서 문자열 - `코드` 는 <Code> 로, 두 문장 이상이면 문장마다 한 덩어리로 묶어 줄이 문장 사이에서 먼저 바뀐다.
 * 어절 단위(keep-all)만으로는 "…기본으로 들어 / 있고" 처럼 한 표현 중간에서 접힌다 - DS Toast 와 같은 방법 (#1005).
 */
export function Md({ children }: { children: string }) {
	// 닫는 괄호 · 코드 바로 뒤에 붙은 조사("PHP)에서도", "`static`에서만")는 브라우저가 그 사이를 줄바꿈 자리로 본다.
	// 그 조각만 nowrap span 으로 묶는다 - 보이지 않는 문자를 넣으면 복사한 글에 섞여 들어가 원문과 달라진다
	const inline = (text: string) =>
		text.split(/(`[^`]+`[가-힣]*|[^\s()`]+\)[가-힣]+)/).map((part, i) => {
			const code = part.match(/^`([^`]+)`([가-힣]*)$/);
			if (code) {
				const [, name = "", josa = ""] = code;
				// 긴 코드 이름은 구분 기호에서 끊길 수 있어야 하니 짧을 때만 조사와 묶는다
				return josa && name.length <= 24 ? (
					<span key={i} className="nowrap">
						<Code>{name}</Code>
						{josa}
					</span>
				) : (
					<Fragment key={i}>
						<Code>{name}</Code>
						{josa}
					</Fragment>
				);
			}
			return /\)[가-힣]+$/.test(part) && !/\s/.test(part) ? (
				<span key={i} className="nowrap">
					{part}
				</span>
			) : (
				part
			);
		});
	// JSDoc 이 강조에 쓰는 **굵게** - 별표가 그대로 보이지 않게
	const rich = (text: string) =>
		text
			.split(/\*\*([^*]+)\*\*/)
			.map((part, i) =>
				i % 2 ? (
					<strong key={i}>{inline(part)}</strong>
				) : (
					<Fragment key={i}>{inline(part)}</Fragment>
				),
			);
	const sentences = splitSentences(children);
	if (sentences.length < 2) return <>{rich(children)}</>;
	return (
		<>
			{sentences.map((s, i) => (
				<Fragment key={s.start}>
					{i > 0 && " "}
					<span className="sentences_item">{rich(s.text)}</span>
				</Fragment>
			))}
		</>
	);
}

type Width = "full" | "768" | "375";

function Example({
	id,
	title,
	desc,
	frame,
	open,
	theme,
	page,
	playground,
}: DocPage["examples"][number] & {
	theme: string;
	page: DocPage;
	/** 첫 예제만 받는다 - "조절" 을 켜면 이 박스가 조합 데모가 된다 */
	playground?: PlaygroundConfig;
}) {
	const [width, setWidth] = useState<Width>("full");
	const [showCode, setShowCode] = useState(false);
	const [adjust, setAdjust] = useState(false);
	const pg = usePlayground(page, playground);
	const tuning = adjust && pg;
	const Comp = exampleOf(id);
	// 조절 중에는 지금 조합의 코드 - 코드 보기 · 복사가 함께 따라온다
	const code = tuning ? pg.code : sourceOf(id).trim();
	return (
		<section className="doc_block">
			<h2 id={id}>{title}</h2>
			{desc && (
				<p className="doc_block_desc">
					<Md>{desc}</Md>
				</p>
			)}
			<div className="doc_demo">
				<div className="doc_demo_stage">
					{tuning ? (
						<div className="doc_demo_inline doc_demo_tuning" onClickCapture={stayOnPage}>
							{pg.preview}
						</div>
					) : width === "full" && !frame && !open ? (
						<div className="doc_demo_inline" onClickCapture={stayOnPage}>
							{Comp && <Comp />}
						</div>
					) : (
						<Frame
							id={id}
							width={width === "full" ? "100%" : Number(width)}
							height={frame ?? (open ? OPEN_HEIGHT : undefined)}
							theme={theme}
							open={open}
						/>
					)}
				</div>
				{tuning && pg.controls}
				<div className="doc_demo_bar">
					<div className="doc_demo_toggles">
						<button
							type="button"
							className="doc_demo_toggle"
							aria-expanded={showCode}
							onClick={() => setShowCode(!showCode)}
						>
							<ChevronRight size={16} aria-hidden />
							{showCode ? "코드 접기" : "코드 보기"}
						</button>
						{pg && (
							<button
								type="button"
								className="doc_demo_toggle doc_demo_adjust"
								aria-pressed={adjust}
								onClick={() => setAdjust(!adjust)}
							>
								<SlidersHorizontal size={14} aria-hidden />
								조절
							</button>
						)}
					</div>
					<div className="doc_demo_actions">
						{/* 조절 중에는 같은 화면의 값만 바꾸므로 폭 전환(iframe)을 숨긴다 */}
						{!tuning && (
							<SegmentedControl<Width>
								size="sm"
								aria-label="미리보기 폭"
								value={width}
								onValueChange={setWidth}
								items={[
									{ value: "full", label: "전체" },
									{ value: "768", label: "768" },
									{ value: "375", label: "375" },
								]}
							/>
						)}
						<CopyButton size="sm" variant="text" text={code} label="복사" />
					</div>
				</div>
				{showCode && (
					<pre className="doc_code">
						<code>{code}</code>
					</pre>
				)}
			</div>
		</section>
	);
}

/** 열린 오버레이 예제의 iframe 높이 - 모달 · 드로어가 잘리지 않는 최소 */
const OPEN_HEIGHT = 420;

/** 좁은 폭은 iframe 으로 - 컴포넌트의 미디어 쿼리(600px 미만 등)가 실제로 걸린다 */
function Frame({
	id,
	width,
	height: fixed,
	theme,
	open,
}: {
	id: string;
	width: number | string;
	height?: number;
	theme: string;
	open?: boolean;
}) {
	const ref = useRef<HTMLIFrameElement>(null);
	const [height, setHeight] = useState(160);
	useEffect(() => {
		const onMessage = (e: MessageEvent) => {
			if (e.source === ref.current?.contentWindow && typeof e.data?.height === "number")
				setHeight(e.data.height);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);
	return (
		<iframe
			ref={ref}
			title={`${id} 미리보기`}
			src={`preview.html?ex=${encodeURIComponent(id)}&theme=${theme}${fixed ? "&bare" : ""}${open ? "&open" : ""}`}
			style={{ width, height: fixed ?? Math.max(height, 160) }}
			className="doc_frame"
		/>
	);
}

export function PropsTable({ name, titled }: { name: PropsName; titled: boolean }) {
	return (
		<>
			{titled && (
				<h3 id={name} className="doc_props_title">
					<code>{name}</code>
				</h3>
			)}
			<div className="doc_table_wrap">
				<table className="doc_table">
					<thead>
						<tr>
							<th>Prop</th>
							<th>타입</th>
							<th>기본값</th>
							<th>설명</th>
						</tr>
					</thead>
					<tbody>
						{props[name].map((p) => (
							<tr key={p.name}>
								<td>
									<code>{p.name}</code>
									{p.required && <span className="doc_required">필수</span>}
								</td>
								<td>
									<Code className="doc_type">{p.type}</Code>
								</td>
								<td>{"default" in p && p.default ? <DefaultValue value={p.default} /> : null}</td>
								<td>
									{p.doc.split("\n\n").map((para) => (
										<p key={para} className="doc_table_para">
											<Md>{para}</Md>
										</p>
									))}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}

/**
 * 이 페이지를 Claude · ChatGPT 채팅에 붙여 넣을 문서로 복사한다. 패키지 규칙을 끝에 붙여 이 한 장만으로도 쓰게 한다.
 * 에이전트(Claude Code · Codex) 연결은 저장소마다 한 번 하는 설정이라 페이지마다 두지 않는다 - 헤더의 AI 페이지가 맡는다
 */
function AiCopy({ page }: { page: DocPage }) {
	return (
		<CopyButton
			size="sm"
			variant="outline"
			label="AI 용 문서 복사"
			copiedLabel="복사했습니다"
			aria-label={`${page.title} 문서를 AI 에 붙여 넣을 마크다운으로 복사`}
			text={() =>
				`${componentDoc(page, sourceOf)}\n## @bigtablet/design-system 규칙\n\n${AGENT_RULES.join("\n")}\n`
			}
		/>
	);
}

export function Page({ page, theme }: { page: DocPage; theme: string }) {
	return (
		<article className="doc_page">
			<header className="doc_block doc_head">
				<h1>
					{page.title} <span className="doc_name">{page.name}</span>
				</h1>
				<p className="doc_lede">
					<Md>{page.summary}</Md>
				</p>
				<div className="doc_head_actions">
					<AiCopy page={page} />
				</div>
			</header>

			<Section id="when" title="언제 쓰는가">
				<div className="doc_table_wrap">
					<table className="doc_table">
						<tbody>
							{page.when.map(([situation, pick, self]) => (
								<tr key={situation}>
									<td>{situation}</td>
									<td className={self ? "doc_pick_self" : "doc_pick_other"}>
										{self ? "✓ " : "→ "}
										<Md>{pick}</Md>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Section>

			{page.examples.map((ex, i) => (
				<Example
					key={ex.id}
					{...ex}
					theme={theme}
					page={page}
					playground={i === 0 ? page.playground : undefined}
				/>
			))}

			{page.props && (
				<Section id="props" title="Props">
					{[page.props].flat().map((name, _, all) => (
						<PropsTable key={name} name={name} titled={all.length > 1} />
					))}
				</Section>
			)}

			{page.notes && (
				<Section id="notes" title="알아 둘 것">
					<ul className="doc_notes">
						{page.notes.map((n) => (
							<li key={n}>
								<Md>{n}</Md>
							</li>
						))}
					</ul>
				</Section>
			)}
		</article>
	);
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
	return (
		<section className="doc_block">
			<h2 id={id}>{title}</h2>
			{children}
		</section>
	);
}

const firstSentence = (text: string) => text.split(/(?<=다\.)\s/)[0] ?? text;

/** 컴포넌트 카드 - 첫 예제 축소 미리보기 · 코드명 · 한국어 이름 · 한 줄 설명 */
export function ComponentCard({ page, theme }: { page: DocPage; theme: string }) {
	const Preview = page.examples[0] && exampleOf(page.examples[0].id);
	// 카드 전체를 <a> 로 감싸면 미리보기 안의 링크(Breadcrumb · 건너뛰기 링크)와 겹쳐 a 안에 a 가 된다.
	// 링크는 제목 하나에 두고, 그 ::after 가 카드 전체를 덮어 어디를 눌러도 이동한다.
	return (
		<div className="ov_card">
			{/* 미리보기는 그림 역할만 - 누르거나 포커스되지 않게 inert */}
			<div className="ov_preview" inert>
				{page.examples[0]?.open ? (
					// 오버레이는 열린 모습을 iframe 으로 - 이 페이지에서 열면 포탈 · 스크롤 잠금이 목록 페이지를 덮는다.
					// inert 안이라 iframe 속 포커스 이동도 막힌다
					<div className="ov_scale ov_scale_frame">
						<iframe
							title={`${page.title} 미리보기`}
							src={`preview.html?ex=${encodeURIComponent(page.examples[0].id)}&theme=${theme}&bare&open`}
							loading="lazy"
							tabIndex={-1}
							className="ov_frame"
						/>
					</div>
				) : (
					<div className="ov_scale">{Preview && <Preview />}</div>
				)}
			</div>
			<div className="ov_text">
				<a href={`#/${page.slug}`} className="ov_title">
					{page.title} <span>{page.name}</span>
				</a>
				<span className="ov_desc">
					<Md>{firstSentence(page.summary)}</Md>
				</span>
			</div>
		</div>
	);
}
