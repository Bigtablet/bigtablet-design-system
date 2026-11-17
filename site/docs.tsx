import { CopyButton, cn, SegmentedControl } from "@bigtablet/design-system";
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from "react";
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
const sourceOf = (id: string) => sources[`./examples/${id}.tsx`] ?? "";

/** 문서 문자열 속 `코드` 를 <code> 로 */
export function Md({ children }: { children: string }) {
	return (
		<>
			{children
				.split(/(`[^`]+`)/)
				.map((part, i) => (part.startsWith("`") ? <code key={i}>{part.slice(1, -1)}</code> : part))}
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
		<section className="doc_example">
			<header className="doc_example_head">
				<h3 id={id}>{title}</h3>
				{desc && (
					<p>
						<Md>{desc}</Md>
					</p>
				)}
			</header>
			<div className="doc_example_bar">
				<SegmentedControl<Width>
					size="sm"
					aria-label="미리보기 폭"
					value={width}
					onValueChange={setWidth}
					items={[
						{ value: "full", label: "전체" },
						{ value: "768", label: "태블릿" },
						{ value: "375", label: "모바일" },
					]}
				/>
				<div className="doc_example_actions">
					<button type="button" className="doc_link_button" onClick={() => setShowCode(!showCode)}>
						{showCode ? "코드 접기" : "코드 보기"}
					</button>
					<CopyButton size="sm" variant="text" text={sourceOf(id)} label="복사" />
				</div>
			</div>
			<div className="doc_example_stage">
				{width === "full" && !frame ? (
					<div className="doc_example_inline">{Comp && <Comp />}</div>
				) : (
					<Frame
						id={id}
						width={width === "full" ? "100%" : Number(width)}
						height={frame}
						theme={theme}
					/>
				)}
			</div>
			{showCode && (
				<pre className="doc_code">
					<code>{sourceOf(id).trim()}</code>
				</pre>
			)}
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

function PropsTable({ name, titled }: { name: PropsName; titled: boolean }) {
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
									<code className="doc_type">{p.type}</code>
								</td>
								<td>{"default" in p && p.default ? <code>{p.default}</code> : "-"}</td>
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
	const propNames = page.props ? [page.props].flat() : [];
	const toc: TocItem[] = [
		{ id: "when", label: "언제 쓰는가" },
		{ id: "examples", label: "예제" },
		...page.examples.map((ex) => ({ id: ex.id, label: ex.title, sub: true })),
		...(propNames.length ? [{ id: "props", label: "Props" }] : []),
		...(propNames.length > 1
			? propNames.map((n) => ({ id: n, label: n, sub: true, code: true }))
			: []),
		...(page.notes ? [{ id: "notes", label: "알아 둘 것" }] : []),
	];
	return (
		<div className="doc_layout">
			<article className="doc_page">
				<p className="doc_eyebrow">{page.category}</p>
				<h1>
					{page.title} <span className="doc_name">{page.name}</span>
				</h1>
				<p className="doc_summary">
					<Md>{page.summary}</Md>
				</p>

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

				<Section id="examples" title="예제">
					{page.examples.map((ex) => (
						<Example key={ex.id} {...ex} theme={theme} />
					))}
				</Section>

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
			<Toc items={toc} />
		</div>
	);
}

interface TocItem {
	id: string;
	label: string;
	sub?: boolean;
	code?: boolean;
}

/** 오른쪽 "이 페이지에서" 목차 - 지금 읽는 절을 표시한다. 해시 라우팅과 겹치지 않게 링크 대신 버튼으로 스크롤 */
function Toc({ items }: { items: TocItem[] }) {
	const [active, setActive] = useState(items[0]?.id);
	useEffect(() => {
		const onScroll = () => {
			// 상단 바 아래 120px 선을 지난 마지막 제목이 지금 절
			let current = items[0]?.id;
			for (const item of items) {
				const el = document.getElementById(item.id);
				if (el && el.getBoundingClientRect().top < 120) current = item.id;
			}
			// 맨 아래까지 내렸으면 마지막 절 - 짧은 끝 절은 120px 선에 닿지 못한다
			const root = document.documentElement;
			if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) current = items.at(-1)?.id;
			setActive(current);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [items]);
	return (
		<nav className="doc_toc" aria-label="이 페이지에서">
			<p className="doc_toc_title">이 페이지에서</p>
			{items.map((item) => (
				<button
					key={item.id}
					type="button"
					className={cn("doc_toc_item", item.sub && "doc_toc_sub", item.code && "doc_toc_code")}
					aria-current={active === item.id ? "location" : undefined}
					onClick={() => document.getElementById(item.id)?.scrollIntoView({ block: "start" })}
				>
					{item.label}
				</button>
			))}
		</nav>
	);
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
	return (
		<section className="doc_section">
			<h2 id={id}>{title}</h2>
			{children}
		</section>
	);
}
