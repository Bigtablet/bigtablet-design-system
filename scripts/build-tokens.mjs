// build-tokens.mjs - src/styles/tokens.json(원본) → SCSS · TS · 테마 CSS 변수 생성
//
//   pnpm tokens          생성 파일을 다시 쓴다
//   pnpm tokens --check  생성 결과가 커밋본과 다르면 실패 (tokens.test.ts 가 같은 검사를 한다)
//
// 각 토큰의 `$extensions["com.bigtablet"]` 가 출력 이름을 정한다. 규칙을 이름에서 추론하지 않는다 -
// tokens.json 의 경로는 Figma 변수 이름으로 쓰여(bigtablet-figma-plugins sync-tokens.js) SCSS/TS 이름과
// 다르고, 바꾸면 Figma 쪽 변수가 갈린다.
//   scss     "폴더/변수"   → src/styles/<폴더>/_tokens.scss 의 `$변수`. "@이름" 이면 mixin (typography)
//   ts       "export.경로" → src/styles/<폴더>/index.ts 의 `export const export = {...}` (배열이면 여러 곳)
//   tsType   "number"      → "600px" 를 600 으로
//   css      CSS 변수 이름 → src/styles/_theme-tokens.scss 의 light/dark mixin
//   cssMode  var      SCSS 는 `var(--x)` (색 · 그림자 - 테마를 따라간다)
//            fallback SCSS 는 `var(--x, 값)` (모서리 · 간격 · 글꼴 - 사용처가 덮어쓴다)
//            define   CSS 변수만 정의하고 SCSS 는 값 그대로 (z-index)
// dark 값은 `$extensions["com.bigtablet.theme"].dark`.
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const SOURCE = "src/styles/tokens.json";
const HEADER =
	"생성 파일 - 직접 고치지 말 것. 원본은 src/styles/tokens.json, `pnpm tokens` 로 다시 만든다.";

/** TS export 이름 → 폴더 */
const TS_HOME = {
	a11y: "a11y",
	controlHeight: "a11y",
	baseBorderWidth: "border-width",
	borderWidth: "border-width",
	breakpoints: "breakpoints",
	baseColors: "colors",
	colors: "colors",
	elevation: "elevation",
	iconSize: "icon",
	motion: "motion",
	opacity: "opacity",
	radius: "radius",
	skeleton: "skeleton",
	spacing: "spacing",
	baseTypography: "typography",
	typography: "typography",
	zIndex: "z-index",
};

// ── 읽기 ───────────────────────────────────────────────────────────────────

/** 토큰을 파일 순서대로. 그룹 `$description` 은 그 그룹 첫 토큰 앞에 붙인다 */
const collect = (json) => {
	const tokens = [];
	const byPath = new Map();
	const walk = (node, path, groupNotes) => {
		if ("$value" in node) {
			const token = {
				path: path.join("."),
				node,
				meta: node.$extensions?.["com.bigtablet"] ?? {},
				groupNotes,
			};
			tokens.push(token);
			byPath.set(token.path, token);
			return;
		}
		let notes = node.$description && path.length > 0 ? [node.$description] : [];
		for (const [key, child] of Object.entries(node)) {
			if (key.startsWith("$") || typeof child !== "object") continue;
			walk(child, [...path, key], [...groupNotes, ...notes]);
			notes = [];
			groupNotes = [];
		}
	};
	walk(json, [], []);
	return { tokens, byPath };
};

// ── 값 ─────────────────────────────────────────────────────────────────────

const shadow = (layers) =>
	layers
		.map((l) => `${l.x === 0 ? "0" : `${l.x}px`} ${l.y}px ${l.blur}px ${l.spread}px ${l.color}`)
		.join(", ");

const makeResolver = (byPath) => {
	const target = (ref) => {
		const token = byPath.get(ref);
		if (!token) throw new Error(`tokens.json: 참조 대상이 없다 - {${ref}}`);
		return token;
	};
	const interpolate = (value, each) =>
		typeof value === "string"
			? value.replace(/\{([^}]+)\}/g, (_, ref) => each(target(ref)))
			: String(value);

	/** CSS 에 쓰는 실제 값 (light). 참조는 끝까지 따라간다 */
	const raw = (token, value = token.node.$value) => {
		if (Array.isArray(value))
			return shadow(value.map((l) => ({ ...l, color: interpolate(l.color, raw) })));
		return interpolate(value, (t) => raw(t));
	};
	const dark = (token) => {
		const value = token.node.$extensions?.["com.bigtablet.theme"]?.dark;
		return value === undefined ? undefined : raw(token, value);
	};
	/** SCSS 변수 자리에 들어갈 값 - CSS 변수를 가진 토큰은 그 var() 로 */
	const scss = (token) => {
		const { css, cssMode } = token.meta;
		if (css && cssMode === "var") return `var(${css})`;
		if (css && cssMode === "fallback") return `var(${css}, ${raw(token)})`;
		const value = token.node.$value;
		if (Array.isArray(value)) return raw(token);
		return interpolate(value, (t) => scss(t));
	};
	const ts = (token) => {
		const value = token.node.$value;
		if (token.node.$type === "typography") {
			const out = {};
			for (const [key, sub] of Object.entries(value)) {
				// 기본 글꼴은 컴포넌트 루트가 이미 정한다 - 역할 스타일은 크기·굵기만 바꾼다
				if (key === "fontFamily" && sub === "{base.typography.font-family-primary}") continue;
				const resolved = raw(token, sub);
				out[key] = key === "fontWeight" ? Number(resolved) : resolved;
			}
			return out;
		}
		const resolved = raw(token);
		if (
			token.meta.tsType === "number" ||
			token.node.$type === "number" ||
			token.node.$type === "fontWeight"
		)
			return Number.parseFloat(resolved);
		return resolved;
	};
	return { raw, dark, scss, ts, target };
};

// ── 출력 ───────────────────────────────────────────────────────────────────

const lines = (text) => (text ? String(text).split("\n") : []);
const kebab = (key) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const scssNotes = (token, indent = "") =>
	[...token.groupNotes, ...lines(token.node.$description)]
		.flatMap(lines)
		.map((l) => `${indent}// ${l}`.trimEnd());

const buildScss = (tokens, value) => {
	const files = new Map();
	for (const token of tokens) {
		if (!token.meta.scss) continue;
		const [dir, name] = token.meta.scss.split("/");
		if (!files.has(dir)) files.set(dir, []);
		const out = files.get(dir);
		out.push(...scssNotes(token));
		if (name.startsWith("@")) {
			const props = Object.entries(value.ts(token)).map(([k, v]) => `${kebab(k)}: ${v};`);
			out.push(`@mixin ${name.slice(1)} { ${props.join(" ")} }`);
		} else {
			out.push(`$${name}: ${value.scss(token)};`);
		}
	}
	return new Map(
		[...files].map(([dir, body]) => [
			`src/styles/${dir}/_tokens.scss`,
			`// ${HEADER}\n\n${body.join("\n")}\n`,
		]),
	);
};

const tsLiteral = (value, indent) => {
	if (typeof value === "number") return String(value);
	// biome 과 같은 따옴표 - 값에 " 가 있으면 ' 로 감싼다
	if (typeof value === "string")
		return value.includes('"') && !value.includes("'") ? `'${value}'` : JSON.stringify(value);
	const pad = "\t".repeat(indent + 1);
	const body = Object.entries(value).map(([k, v]) => {
		const key = /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k);
		return `${v.notes ?? ""}${pad}${key}: ${tsLiteral(v.value, indent + 1)},`;
	});
	return `{\n${body.join("\n")}\n${"\t".repeat(indent)}}`;
};

const buildTs = (tokens, value) => {
	const roots = new Map(); // export 이름 → 중첩 트리 { key: { value, notes } }
	for (const token of tokens) {
		const paths = [token.meta.ts ?? []].flat();
		for (const path of paths) {
			const [root, ...keys] = path.split(".");
			if (!TS_HOME[root]) throw new Error(`build-tokens: ${path} 의 export 가 TS_HOME 에 없다`);
			if (!roots.has(root)) roots.set(root, {});
			let node = roots.get(root);
			for (const key of keys.slice(0, -1)) {
				node[key] ??= { value: {} };
				node = node[key].value;
			}
			const leaf = value.ts(token);
			const notes = lines(token.node.$description);
			const pad = "\t".repeat(keys.length);
			node[keys.at(-1)] = {
				value:
					typeof leaf === "object"
						? Object.fromEntries(Object.entries(leaf).map(([k, v]) => [k, { value: v }]))
						: leaf,
				notes: notes.length ? `${pad}/** ${notes.join(" ")} */\n` : "",
			};
		}
	}
	const files = new Map();
	for (const [root, tree] of roots) {
		const file = `src/styles/${TS_HOME[root]}/index.ts`;
		const prev = files.get(file) ?? `// ${HEADER}\n`;
		files.set(file, `${prev}\nexport const ${root} = ${tsLiteral(tree, 0)} as const;\n`);
	}
	return files;
};

const buildTheme = (tokens, value) => {
	const light = [];
	const dark = [];
	for (const token of tokens) {
		if (!token.meta.css) continue;
		light.push(...scssNotes(token, "\t"), `\t${token.meta.css}: ${value.raw(token)};`);
		const d = value.dark(token);
		if (d !== undefined) dark.push(`\t${token.meta.css}: ${d};`);
	}
	return new Map([
		[
			"src/styles/_theme-tokens.scss",
			`// ${HEADER}\n// theme.scss 가 :root 와 다크 셀렉터에서 include 한다.\n\n@mixin light {\n${light.join("\n")}\n}\n\n@mixin dark {\n${dark.join("\n")}\n}\n`,
		],
	]);
};

/** 생성 결과 { 경로: 내용 } */
export const generate = (json = JSON.parse(readFileSync(SOURCE, "utf8"))) => {
	const { tokens, byPath } = collect(json);
	const value = makeResolver(byPath);
	return new Map([
		...buildScss(tokens, value),
		...buildTs(tokens, value),
		...buildTheme(tokens, value),
	]);
};

/** 커밋본과 다른 생성 파일 경로 */
export const stale = (files = generate()) =>
	[...files]
		.filter(([path, content]) => {
			try {
				return readFileSync(path, "utf8") !== content;
			} catch {
				return true;
			}
		})
		.map(([path]) => path);

// 경로는 저장소 루트 기준 - pnpm 스크립트와 vitest 모두 루트에서 돈다
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const files = generate();
	if (process.argv.includes("--check")) {
		const changed = stale(files);
		if (changed.length > 0) {
			console.error(
				`❌ 생성 파일이 tokens.json 과 다릅니다 - pnpm tokens 를 실행하세요:\n  ${changed.join("\n  ")}`,
			);
			process.exit(1);
		}
		console.log(`✓ 생성 파일 ${files.size}개 - tokens.json 과 같습니다`);
	} else {
		for (const [path, content] of files) writeFileSync(path, content);
		console.log(`✓ ${files.size}개 파일 생성`);
	}
}
