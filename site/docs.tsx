import { CopyButton, SegmentedControl } from "@bigtablet/design-system";
import { ChevronRight } from "lucide-react";
import { type ComponentType, Fragment, type ReactNode, useEffect, useRef, useState } from "react";
import { splitSentences } from "src/utils/sentences";
import { AGENT_RULES, componentDoc } from "./llms";
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
	summary: string;
	/** [상황, 고를 것, 이 컴포넌트인가] */
	when: [string, string, boolean][];
	examples: {
		id: string;
		title: string;
		desc?: string;
		/** 화면 전체를 쓰는 예제(AppShell · 고정 바) - 전체 폭도 이 높이의 iframe 으로 */
		frame?: number;
	}[];
	/** 여러 개면 순서대로 표를 하나씩 (Tabs · TabList · Tab …) */
	props?: PropsName | PropsName[];
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
	const sentences = splitSentences(children);
	if (sentences.length < 2) return <>{inline(children)}</>;
	return (
		<>
			{sentences.map((s, i) => (
				<Fragment key={s.start}>
					{i > 0 && " "}
					<span className="sentences_item">{inline(s.text)}</span>
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
	theme,
}: DocPage["examples"][number] & { theme: string }) {
	const [width, setWidth] = useState<Width>("full");
	const [showCode, setShowCode] = useState(false);
	const Comp = exampleOf(id);
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
					{width === "full" && !frame ? (
						<div className="doc_demo_inline">{Comp && <Comp />}</div>
					) : (
						<Frame
							id={id}
							width={width === "full" ? "100%" : Number(width)}
							height={frame}
							theme={theme}
						/>
					)}
				</div>
				<div className="doc_demo_bar">
					<button
						type="button"
						className="doc_demo_toggle"
						aria-expanded={showCode}
						onClick={() => setShowCode(!showCode)}
					>
						<ChevronRight size={16} aria-hidden />
						{showCode ? "코드 접기" : "코드 보기"}
					</button>
					<div className="doc_demo_actions">
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
						<CopyButton size="sm" variant="text" text={sourceOf(id)} label="복사" />
					</div>
				</div>
				{showCode && (
					<pre className="doc_code">
						<code>{sourceOf(id).trim()}</code>
					</pre>
				)}
			</div>
		</section>
	);
}

/** 좁은 폭은 iframe 으로 - 컴포넌트의 미디어 쿼리(600px 미만 등)가 실제로 걸린다 */
function Frame({
	id,
	width,
	height: fixed,
	theme,
}: {
	id: string;
	width: number | string;
	height?: number;
	theme: string;
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
			src={`preview.html?ex=${encodeURIComponent(id)}&theme=${theme}${fixed ? "&bare" : ""}`}
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
								<td>{"default" in p && p.default ? <DefaultValue value={p.default} /> : "-"}</td>
								<td>
									<Md>{p.doc.split("\n")[0] ?? ""}</Md>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
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
					{/* 채팅에 붙여 넣을 한 장 - 패키지 규칙을 끝에 붙여 이 문서만으로도 쓰게 한다 */}
					<CopyButton
						size="sm"
						variant="outline"
						label="마크다운 복사"
						copiedLabel="복사했습니다"
						aria-label={`${page.title} 문서를 마크다운으로 복사`}
						text={() =>
							`${componentDoc(page, sourceOf)}\n## @bigtablet/design-system 규칙\n\n${AGENT_RULES.join("\n")}\n`
						}
					/>
					<a className="doc_head_link" href="#/ai">
						AI 로 쓰기
					</a>
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

			{page.examples.map((ex) => (
				<Example key={ex.id} {...ex} theme={theme} />
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
export function ComponentCard({ page }: { page: DocPage }) {
	const Preview = page.examples[0] && exampleOf(page.examples[0].id);
	// 카드 전체를 <a> 로 감싸면 미리보기 안의 링크(Breadcrumb · 건너뛰기 링크)와 겹쳐 a 안에 a 가 된다.
	// 링크는 제목 하나에 두고, 그 ::after 가 카드 전체를 덮어 어디를 눌러도 이동한다.
	return (
		<div className="ov_card">
			{/* 미리보기는 그림 역할만 - 누르거나 포커스되지 않게 inert */}
			<div className="ov_preview" inert>
				<div className="ov_scale">{Preview && <Preview />}</div>
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
