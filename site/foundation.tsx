import type { CSSProperties, ReactNode } from "react";
import tokens from "../src/styles/tokens.json";
import { Code } from "./docs";
import { CodeBlock } from "./guides";

// 토큰 원본(tokens.json)에서 바로 표를 만든다 - 토큰을 바꾸면 문서가 따라온다. 손으로 쓰는 값은 없다.

type Node = { [key: string]: unknown };
interface Token {
	/** 경로 마지막 이름 (text.heading) */
	name: string;
	/** `token.$color_text_heading` · `@include token.heading_large` */
	scss?: string;
	/** `--bt-color-text-heading` */
	css?: string;
	light: unknown;
	dark?: unknown;
	description?: string;
}

const isToken = (n: unknown): n is Node => typeof n === "object" && n !== null && "$value" in n;

/** `{base.color.neutral-900}` 참조를 원값까지 푼다 (문자열 안에 섞인 참조 포함) */
function resolve(value: unknown): unknown {
	if (typeof value === "string") {
		const whole = value.match(/^\{([^}]+)\}$/);
		if (whole) return resolve(lookup(whole[1] as string));
		return value.replace(/\{([^}]+)\}/g, (_, path: string) => String(resolve(lookup(path))));
	}
	if (Array.isArray(value)) return value.map(resolve);
	if (value && typeof value === "object") {
		return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v)]));
	}
	return value;
}

function lookup(path: string): unknown {
	const node = path.split(".").reduce<unknown>((n, key) => (n as Node)?.[key], tokens);
	return isToken(node) ? node.$value : node;
}

/** 묶음 아래 토큰을 펼친다 - 이름은 묶음 기준 상대 경로 */
function collect(path: string): Token[] {
	const root = path.split(".").reduce<unknown>((n, key) => (n as Node)?.[key], tokens) as Node;
	const out: Token[] = [];
	const walk = (node: Node, prefix: string) => {
		for (const [key, child] of Object.entries(node)) {
			if (key.startsWith("$")) continue;
			const name = prefix ? `${prefix}.${key}` : key;
			if (isToken(child)) {
				const ext = (child.$extensions ?? {}) as Record<string, Record<string, string>>;
				const own = ext["com.bigtablet"] ?? {};
				const scss = own.scss?.split("/")[1];
				out.push({
					name,
					scss:
						scss && (scss.startsWith("@") ? `@include token.${scss.slice(1)}` : `token.$${scss}`),
					css: own.css,
					light: resolve(child.$value),
					dark: ext["com.bigtablet.theme"]?.dark && resolve(ext["com.bigtablet.theme"].dark),
					// 묶음 첫 토큰에 붙은 "Text" · "Brand" 같은 묶음 이름은 설명이 아니다
					description: /\s/.test(String(child.$description ?? ""))
						? (child.$description as string)
						: undefined,
				});
			} else if (child && typeof child === "object") {
				walk(child as Node, name);
			}
		}
	};
	walk(root, "");
	return out;
}

const shadowOf = (value: unknown) =>
	(Array.isArray(value) ? value : [value])
		.map((s) => {
			const { x, y, blur, spread, color } = s as Record<string, string | number>;
			return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
		})
		.join(", ");

/** 표에 쓸 문자열 - 그림자(배열)는 CSS 값으로 */
const show = (value: unknown) => (typeof value === "object" ? shadowOf(value) : String(value));

/* ─── 공용 표 ──────────────────────────────────────────────────────────── */

function TokenTable({ items, preview }: { items: Token[]; preview: (t: Token) => ReactNode }) {
	return (
		<div className="doc_table_wrap">
			<table className="doc_table fd_table">
				<thead>
					<tr>
						<th aria-label="미리보기" />
						<th>이름</th>
						<th>SCSS · CSS 변수</th>
						<th>값</th>
					</tr>
				</thead>
				<tbody>
					{items.map((t) => (
						<tr key={t.name}>
							<td className="fd_preview_cell">{preview(t)}</td>
							<td>
								<strong className="fd_name">{t.name}</strong>
								{t.description && <span className="fd_desc">{t.description}</span>}
							</td>
							<td>
								{t.scss && <Code>{t.scss}</Code>}
								{t.css && (
									<>
										<br />
										<Code>{t.css}</Code>
									</>
								)}
							</td>
							<td className="fd_value">
								{show(t.light)}
								{t.dark !== undefined && <span className="fd_dark">다크 {show(t.dark)}</span>}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function FoundationPage({
	title,
	name,
	lede,
	children,
}: {
	title: string;
	name: string;
	lede: string;
	children: ReactNode;
}) {
	return (
		<article>
			<header className="doc_block doc_head">
				<h1>
					{title} <span className="doc_name">{name}</span>
				</h1>
				<p className="doc_lede">{lede}</p>
			</header>
			{children}
		</article>
	);
}

function Group({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
	return (
		<section className="doc_block">
			<h2 id={title}>{title}</h2>
			{desc && <p className="doc_block_desc">{desc}</p>}
			{children}
		</section>
	);
}

/* ─── 페이지 ──────────────────────────────────────────────────────────── */

const COLOR_GROUPS: [string, string, string][] = [
	["text", "텍스트", "글자색. 테마 표면 위 글자에는 이 묶음만 씁니다."],
	["bg", "배경", "페이지 · 카드 · 입력의 바탕."],
	["border", "테두리", ""],
	["brand", "브랜드", "브랜드 표면과 그 위 글자는 짝으로 씁니다 (primary ↔ on-primary)."],
	["accent", "강조", ""],
	[
		"status",
		"상태",
		"배경 · 테두리용과 글자용(`-on-surface`)이 나뉩니다. 글자에 배경용을 쓰면 다크에서 대비가 무너집니다.",
	],
	["state", "상호작용 상태", "hover · pressed 등 겹쳐 칠하는 반투명 색."],
	["scrim", "딤", "오버레이 뒤를 가리는 색."],
	["skeleton", "스켈레톤", ""],
];

function Colors() {
	const swatch = (t: Token) => (
		<span className="fd_swatch">
			<span style={{ background: String(t.light) }} title="라이트" />
			<span style={{ background: String(t.dark ?? t.light) }} title="다크" />
		</span>
	);
	return (
		<FoundationPage
			title="색"
			name="Colors"
			lede="이름이 용도를 말합니다 - text 는 글자, bg 는 바탕. 왼쪽 칸이 라이트, 오른쪽 칸이 다크 값이고, 테마에 따라 CSS 변수가 알아서 바뀝니다."
		>
			<Group title="쓰는 법">
				<CodeBlock
					code={`@use "@bigtablet/design-system/scss/token" as token;

.card {
  color: token.$color_text_heading;      /* SCSS */
  background: var(--bt-color-bg-solid);  /* CSS 변수 */
}`}
				/>
			</Group>
			{COLOR_GROUPS.map(([key, title, desc]) => (
				<Group key={key} title={title} desc={desc || undefined}>
					<TokenTable items={collect(`semantic.color.${key}`)} preview={swatch} />
				</Group>
			))}
		</FoundationPage>
	);
}

const TYPE_GROUPS = [
	"display",
	"heading",
	"title",
	"subtitle",
	"body",
	"label",
	"caption",
	"caption-bold",
	"overline",
	"code",
];

function Typography() {
	return (
		<FoundationPage
			title="타이포그래피"
			name="Typography"
			lede="글자 크기가 아니라 역할로 고릅니다 - 제목이면 heading, 본문이면 body. SCSS 믹스인 하나가 크기 · 굵기 · 줄 높이를 함께 정합니다."
		>
			<Group title="쓰는 법">
				<CodeBlock
					code={`.card_title {
  @include token.heading_small_bold;
}`}
				/>
			</Group>
			{TYPE_GROUPS.map((key) => (
				<Group key={key} title={key}>
					<div className="fd_type_list">
						{collect(`semantic.typography.${key}`).map((t) => {
							const v = t.light as Record<string, string | number>;
							const style: CSSProperties = {
								fontSize: v.fontSize,
								fontWeight: v.fontWeight,
								lineHeight: v.lineHeight,
								letterSpacing: v.letterSpacing,
							};
							return (
								<div key={t.name} className="fd_type_row">
									<span style={style} className="fd_type_sample">
										다람쥐 헌 쳇바퀴에 타고파 Aa 123
									</span>
									{t.scss && <Code>{t.scss}</Code>}
									<span className="fd_value">
										{v.fontSize} / {v.lineHeight} · {v.fontWeight}
									</span>
								</div>
							);
						})}
					</div>
				</Group>
			))}
		</FoundationPage>
	);
}

function Spacing() {
	return (
		<FoundationPage
			title="간격"
			name="Spacing"
			lede="여백 · 간격은 이 단계만 씁니다. 사이 값(14px · 18px)이 필요하면 가까운 단계로 맞춥니다."
		>
			<Group title="단계">
				<TokenTable
					items={collect("semantic.spacing")}
					preview={(t) => <span className="fd_bar" style={{ width: String(t.light) }} />}
				/>
			</Group>
			<Group title="Sass 계산" desc="SCSS 토큰은 var() 문자열이라 calc() 밖의 산술이 깨집니다.">
				<CodeBlock
					code={`// ❌ 컴파일 에러
padding: token.$spacing_48 * 2;
// ✅
padding: calc(2 * #{token.$spacing_48});`}
				/>
			</Group>
		</FoundationPage>
	);
}

function Radius() {
	return (
		<FoundationPage
			title="모서리"
			name="Radius"
			lede="`:root { --bt-radius-md: 4px }` 로 덮어쓰면 DS 컴포넌트가 함께 따라갑니다."
		>
			<Group title="단계">
				<TokenTable
					items={collect("semantic.radius")}
					preview={(t) => <span className="fd_box" style={{ borderRadius: String(t.light) }} />}
				/>
			</Group>
		</FoundationPage>
	);
}

function Elevation() {
	return (
		<FoundationPage
			title="그림자"
			name="Elevation"
			lede="표면이 얼마나 떠 있는지 나타냅니다. 카드는 level1, 메뉴 · 팝오버는 level2, 모달은 더 높게."
		>
			<Group title="단계">
				<TokenTable
					items={collect("base.elevation")}
					preview={(t) => (
						<span
							className="fd_box fd_box_raised"
							style={{ boxShadow: t.css ? `var(${t.css})` : shadowOf(t.light) }}
						/>
					)}
				/>
			</Group>
		</FoundationPage>
	);
}

function Motion() {
	const all = collect("base.motion");
	const play = (t: Token) =>
		/^transition/.test(t.name) && (
			<span className="fd_motion" style={{ transition: `transform ${String(t.light)}` }} />
		);
	return (
		<FoundationPage
			title="모션"
			name="Motion"
			lede="길이 · 곡선을 직접 쓰지 않고 토큰을 씁니다. 표의 점에 마우스를 올리면 그 전환으로 움직입니다."
		>
			<Group
				title="길이"
				desc="transition_* 는 길이와 곡선이 함께 들어 있습니다 - 곡선을 또 붙이면 CSS 가 깨집니다."
			>
				<TokenTable items={all.filter((t) => t.name.startsWith("duration"))} preview={() => null} />
			</Group>
			<Group title="곡선">
				<TokenTable items={all.filter((t) => /^eas/.test(t.name))} preview={() => null} />
			</Group>
			<Group title="전환 (길이 + 곡선)">
				<TokenTable items={all.filter((t) => t.name.startsWith("transition"))} preview={play} />
			</Group>
		</FoundationPage>
	);
}

function Layout() {
	return (
		<FoundationPage
			title="레이아웃 값"
			name="Breakpoints · Z-index · Icon"
			lede="화면 폭 구간, 겹침 순서, 아이콘 크기입니다. 600px 미만이 좁은 화면(compact)입니다."
		>
			<Group
				title="화면 폭 구간"
				desc="SCSS 는 `@include token.compact { … }` 처럼 구간 믹스인을 씁니다."
			>
				<TokenTable items={collect("base.breakpoint")} preview={() => null} />
			</Group>
			<Group
				title="겹침 순서 (z-index)"
				desc="숫자를 직접 쓰지 않고 이름(z_content · z_chrome · z_popup …)으로 씁니다."
			>
				<TokenTable items={collect("semantic.layer")} preview={() => null} />
			</Group>
			<Group title="아이콘 크기" desc="lucide 아이콘의 size 에 iconSize.sm 처럼 넘깁니다.">
				<TokenTable
					items={collect("base.icon-size")}
					preview={(t) => (
						<span className="fd_box" style={{ width: String(t.light), height: String(t.light) }} />
					)}
				/>
			</Group>
		</FoundationPage>
	);
}

/** 사이드바 "Foundation" 묶음 */
export const FOUNDATIONS = [
	{ slug: "tokens/colors", title: "색", Body: Colors },
	{ slug: "tokens/typography", title: "타이포그래피", Body: Typography },
	{ slug: "tokens/spacing", title: "간격", Body: Spacing },
	{ slug: "tokens/radius", title: "모서리", Body: Radius },
	{ slug: "tokens/elevation", title: "그림자", Body: Elevation },
	{ slug: "tokens/motion", title: "모션", Body: Motion },
	{ slug: "tokens/layout", title: "레이아웃 값", Body: Layout },
];
