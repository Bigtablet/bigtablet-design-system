// 조합 보기 - props.json 에서 값이 정해진 prop(variant · size · tone)과 boolean prop 만 골라 컨트롤을
// 자동으로 만든다. 페이지는 기본 props · children · 뺄 prop 만 적는다. 함수 · ReactNode · 객체 prop 은
// 열지 않는다 - 이상한 조합을 만들기 쉽고, 그런 쓰임은 예제가 더 잘 보여 준다
import * as DS from "@bigtablet/design-system";
import { Dropdown, SegmentedControl, Toggle } from "@bigtablet/design-system";
import { type ComponentType, useState } from "react";
import type { DocPage } from "./docs";
import { CodeBlock } from "./guides";
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

export function Playground({ page, config }: { page: DocPage; config: PlaygroundConfig }) {
	const name = [page.props].flat()[0];
	const Comp = (DS as unknown as Record<string, ComponentType<Record<string, unknown>>>)[
		page.title
	];
	const rows = ((name ? props[name] : []) as Row[]).filter(
		(p) => !config.omit?.includes(p.name) && (p.type === "boolean" || LITERALS.test(p.type)),
	);
	const [values, setValues] = useState<Record<string, Value>>({});
	if (!Comp || rows.length === 0) return null;

	const valueOf = (p: Row): Value =>
		values[p.name] ?? (p.type === "boolean" ? false : (unquote(p.default) ?? ""));
	// 기본값과 다른 것만 - 코드에도, 컴포넌트에도 그대로 넘긴다
	const picked = Object.fromEntries(
		rows
			.map((p) => [p.name, valueOf(p)] as const)
			.filter(([key, v]) => {
				const row = rows.find((r) => r.name === key);
				return v !== "" && v !== false && v !== unquote(row?.default);
			}),
	);
	const set = (key: string, v: Value) => setValues((prev) => ({ ...prev, [key]: v }));

	return (
		<div className="pg">
			<div className="pg_stage">
				<Comp {...config.base} {...picked}>
					{config.children}
				</Comp>
			</div>
			<div className="pg_controls">
				{rows.map((p) => {
					const id = `pg-${page.slug}-${p.name}`;
					if (p.type === "boolean") {
						return (
							<div key={p.name} className="pg_row">
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
					const options = optionsOf(p.type);
					// 기본값이 없는 prop 은 "기본" 칸 - 컴포넌트가 정한 값을 그대로 쓴다
					const items = [
						...(p.default ? [] : [{ value: "", label: "기본" }]),
						...options.map((o) => ({ value: o, label: o })),
					];
					return (
						<div key={p.name} className="pg_row pg_row_stack">
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
				})}
			</div>
			<div className="pg_code">
				<CodeBlock code={toCode(page.title, config.base, picked, config.children)} />
			</div>
		</div>
	);
}
