import { CopyButton, SegmentedControl } from "@bigtablet/design-system";
import { ChevronRight } from "lucide-react";
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
	return (
		<article className="doc_page">
			<header className="doc_block doc_head">
				<h1>
					{page.title} <span className="doc_name">{page.name}</span>
				</h1>
				<p className="doc_lede">
					<Md>{page.summary}</Md>
				</p>
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
