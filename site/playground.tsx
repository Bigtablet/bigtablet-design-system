// 첫 예제 박스의 "조절" - props.json 에서 값이 정해진 prop(variant · size · tone)과 boolean prop 만 골라 컨트롤을
// 자동으로 만든다. 페이지는 기본 props · children · 뺄 prop 만 적는다. 함수 · ReactNode · 객체 prop 은
// 열지 않는다 - 이상한 조합을 만들기 쉽고, 그런 쓰임은 예제가 더 잘 보여 준다
import * as DS from "@bigtablet/design-system";
import { Dropdown, SegmentedControl, Toggle } from "@bigtablet/design-system";
import { type ComponentType, type ReactNode, useState } from "react";
import type { DocPage } from "./docs";
import props from "./props.json";

export interface PlaygroundConfig {
	/** 늘 넘기는 props (label · name · aria-label 처럼 없으면 안 되는 값) */
	base?: Record<string, string | number | boolean>;
	children?: string;
	/** 컨트롤로 열지 않을 prop - 제어 상태(checked) · 레이아웃(fullWidth) · 접근성 구조(headingAs) */
	omit?: string[];
}

type Row = { name: string; type: string; default?: string };
type Value = string | boolean;

const LITERALS = /^("[^"]*"\s*\|\s*)+"[^"]*"$/;
const optionsOf = (type: string) => [...type.matchAll(/"([^"]*)"/g)].map((m) => m[1] ?? "");
const unquote = (v?: string) => v?.replace(/^"|"$/g, "");

/** 지금 조합을 JSX 로 - 기본값과 같은 prop 은 적지 않는다 */
function toCode(
	title: string,
	base: PlaygroundConfig["base"],
	picked: Record<string, Value>,
	children?: string,
) {
	const attrs = [
		...Object.entries(base ?? {}).map(([k, v]) =>
			typeof v === "string" ? `${k}="${v}"` : v === true ? k : `${k}={${v}}`,
		),
		...Object.entries(picked).map(([k, v]) => (v === true ? k : `${k}="${v}"`)),
	];
	const open = [title, ...attrs].join(" ");
	return children ? `<${open}>${children}</${title}>` : `<${open} />`;
}

// 처음에 보이는 컨트롤 수 - 나머지는 "더 보기" 로 접는다 (Card 처럼 prop 이 많은 컴포넌트에서 줄이 길어지지 않게)
const VISIBLE = 4;

export interface Playground {
	/** 지금 조합으로 그린 컴포넌트 */
	preview: ReactNode;
	/** 미리보기 아래 가로 컨트롤 줄 */
	controls: ReactNode;
	/** 지금 조합의 JSX - 코드 보기 · 복사가 쓴다 */
	code: string;
}

/** 예제 박스가 "조절" 을 켰을 때 쓰는 미리보기 · 컨트롤 · 코드. 열 prop 이 없으면 null */
export function usePlayground(page: DocPage, config?: PlaygroundConfig): Playground | null {
	const [values, setValues] = useState<Record<string, Value>>({});
	const [more, setMore] = useState(false);
	if (!config) return null;
	const name = [page.props].flat()[0];
	const Comp = (DS as unknown as Record<string, ComponentType<Record<string, unknown>>>)[
		page.title
	];
	const rows = ((name ? props[name] : []) as Row[]).filter(
		(p) => !config.omit?.includes(p.name) && (p.type === "boolean" || LITERALS.test(p.type)),
	);
	if (!Comp || rows.length === 0) return null;

	const valueOf = (p: Row): Value =>
		values[p.name] ?? (p.type === "boolean" ? false : (unquote(p.default) ?? ""));
	// 기본값과 다른 것만 - 코드에도, 컴포넌트에도 그대로 넘긴다
	const picked = Object.fromEntries(
		rows
			.map((p) => [p.name, valueOf(p)] as const)
			.filter(
				([key, v]) =>
					v !== "" && v !== false && v !== unquote(rows.find((r) => r.name === key)?.default),
			),
	);
	const set = (key: string, v: Value) => setValues((prev) => ({ ...prev, [key]: v }));

	const control = (p: Row) => {
		const id = `pg-${page.slug}-${p.name}`;
		if (p.type === "boolean") {
			return (
				<div key={p.name} className="pg_item pg_item_bool">
					<code>{p.name}</code>
					<Toggle
						size="sm"
						ariaLabel={p.name}
						checked={valueOf(p) === true}
						onCheckedChange={(on) => set(p.name, on)}
					/>
				</div>
			);
		}
		// 기본값이 없는 prop 은 "기본" 칸 - 컴포넌트가 정한 값을 그대로 쓴다
		const items = [
			...(p.default ? [] : [{ value: "", label: "기본" }]),
			...optionsOf(p.type).map((o) => ({ value: o, label: o })),
		];
		return (
			<div key={p.name} className="pg_item">
				<code id={id}>{p.name}</code>
				{items.length <= 5 ? (
					<SegmentedControl
						size="sm"
						aria-labelledby={id}
						value={String(valueOf(p))}
						onValueChange={(v) => set(p.name, v)}
						items={items}
					/>
				) : (
					<Dropdown
						size="sm"
						aria-labelledby={id}
						value={String(valueOf(p))}
						onValueChange={(v) => set(p.name, v ?? "")}
						options={items}
					/>
				)}
			</div>
		);
	};

	const shown = more ? rows : rows.slice(0, VISIBLE);
	return {
		preview: (
			<Comp {...config.base} {...picked}>
				{config.children}
			</Comp>
		),
		controls: (
			<div className="pg_controls">
				{shown.map(control)}
				{rows.length > VISIBLE && (
					<button type="button" className="pg_more" onClick={() => setMore(!more)}>
						{more ? "접기" : `${rows.length - VISIBLE}개 더 보기`}
					</button>
				)}
			</div>
		),
		code: toCode(page.title, config.base, picked, config.children),
	};
}
