// build-modules.mjs - tsup 이 만든 dist/esm(모듈 단위 ESM)을 마무리한다
//
// tsup 의 기본 빌드는 전체를 한 덩어리(dist/index.css = style.css, dist/index.d.ts)로 만든다. 그 JS 는 첫 줄에서
// 전 컴포넌트 CSS 를 import 해 Button 하나만 써도 CSS 전체(약 20KB gzip)가 따라왔다. dist/esm 은 파일 하나를
// 모듈 하나로 두고 각 컴포넌트 JS 가 자기 `style.css` 를 import 한다. package.json `sideEffects` 가 CSS 만
// 부작용으로 표시하므로 사용처 번들러(webpack · Rollup · Vite · esbuild)는 쓰지 않는 컴포넌트를 JS 와 CSS 째로
// 뺀다. 다른 컴포넌트를 쓰는 컴포넌트(DatePicker → Popover 등)는 import 를 따라 그 CSS 도 같이 온다.
// 공통 CSS(테마 변수 · autofill · 링크)는 컴포넌트 모듈이 자기 CSS 앞에 import 한다 - 아래 3번.
//
// 여기서 하는 일
//   1. import 경로를 실제 파일로 (`./button` → `./button/index.js`) - ESM 패키지에서 webpack 은 확장자를 요구한다
//   2. `.scss` import 를 `.css` 로 바꾸고 그 SCSS 를 컴파일해 옆에 둔다 - dist/index.css 와 같은 `bigtablet` 레이어
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { compile } from "sass-embedded";

const OUT = "dist/esm";
const LAYER_ORDER = "@layer theme, base, reset, bigtablet, components, utilities;";

const files = (dir) =>
	readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? files(path) : [path];
	});

/** 출력 JS 의 상대 import 를 소스 기준으로 풀어 실제 파일 경로로 */
const specifier = (srcFile, spec, styles) => {
	if (!spec.startsWith(".")) return spec;
	const base = resolve(dirname(srcFile), spec);
	// 이미 고친 출력을 다시 돌려도 같은 결과가 나오게
	if (spec.endsWith(".css")) {
		styles.add(base.replace(/\.css$/, ".scss"));
		return spec;
	}
	if (spec.endsWith(".js")) return spec;
	if (spec.endsWith(".scss")) {
		styles.add(base);
		return spec.replace(/\.scss$/, ".css");
	}
	for (const ext of [".ts", ".tsx"]) if (existsSync(base + ext)) return `${spec}.js`;
	if (existsSync(join(base, "index.ts")) || existsSync(join(base, "index.tsx")))
		return `${spec}/index.js`;
	throw new Error(`build-modules: ${srcFile} 의 import "${spec}" 를 풀지 못했다`);
};

const styles = new Set();
const jsFiles = files(OUT).filter((f) => f.endsWith(".js"));
const code = new Map();
for (const file of jsFiles) {
	const rel = relative(OUT, file).replace(/\.js$/, "");
	const src = ["ts", "tsx"].map((ext) => join("src", `${rel}.${ext}`)).find(existsSync);
	if (!src) throw new Error(`build-modules: ${file} 의 소스를 찾지 못했다`);
	code.set(
		file,
		readFileSync(file, "utf8").replace(
			/(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.[^"']*)\2/g,
			(_, head, q, spec) => `${head}${q}${specifier(src, spec, styles)}${q}`,
		),
	);
}

// 3. 공통 CSS 는 배럴이 아니라 CSS 를 쓰는 모듈이 import 한다. 배럴에 부작용 import 가 있으면 Next 가 그 배럴을
//    "부작용 있는 모듈" 로 보고 배럴 최적화(optimizePackageImports)를 하지 않아, 배럴에서 닿는 모든 "use client"
//    컴포넌트의 CSS 를 페이지에 싣는다(Button 하나만 써도 68개 전부 - Next 16 Turbopack · webpack 실측). 배럴은
//    `export ... from` 만 남기고, 컴포넌트 CSS 를 import 하는 모듈과 cssVars(테마 변수를 가리킨다)가 공통 CSS 를
//    자기 CSS 앞에 import 한다. 번들러는 같은 파일을 한 번만 넣는다.
const BARREL = join(OUT, "index.js");
const sideEffectCss = /import\s*(["'])(\.[^"']+\.css)\1;?/g;
const base = [...code.get(BARREL).matchAll(sideEffectCss)].map((m) => resolve(OUT, m[2]));
if (base.length === 0) throw new Error("build-modules: 배럴에서 공통 CSS import 를 찾지 못했다");
// 배럴은 소스 index.ts 의 값 export 만 `export { … } from` 그대로 다시 쓴다. esbuild 출력은 이를
// `import { X } from …; export { X }` 로 바꿔 Next 가 배럴로 알아보지 못한다(타입 export 는 빠진다).
const indexSource = readFileSync("src/index.ts", "utf8");
const reexport = /^export\s+(type\s+)?\{([^}]*)\}\s*from\s*"([^"]+)";/gm;
// 위 형태가 아닌 export(`export *`, 선언 export 등)는 배럴에서 조용히 빠진다 - 빌드를 멈춘다
const unhandled = indexSource.replace(reexport, "").match(/^export\b.*$/gm);
if (unhandled)
	throw new Error(
		`build-modules: src/index.ts 의 export 를 배럴로 옮기지 못한다 - ${unhandled.join(" / ")}`,
	);
const barrel = [...indexSource.matchAll(reexport)]
	.filter(([, typeOnly]) => !typeOnly)
	.map(([, , names, from]) => {
		const values = names
			.split(",")
			.map((n) => n.trim())
			.filter((n) => n && !n.startsWith("type "));
		return values.length
			? `export { ${values.join(", ")} } from "${specifier("src/index.ts", from, styles)}";`
			: "";
	})
	.filter(Boolean);
code.set(BARREL, `${barrel.join("\n")}\n`);
const needsBase = (file, js) =>
	file !== BARREL && (/\.css["']/.test(js) || file.endsWith("css-vars.js"));
for (let [file, js] of code) {
	if (needsBase(file, js)) {
		const imports = base
			.map((css) => `import "./${relative(dirname(file), css)}";`.replace("./../", "../"))
			.join("");
		// "use client" 지시문은 파일 맨 앞이어야 한다
		const directive = js.match(/^(["'])use client\1;?/)?.[0] ?? "";
		js = directive + imports + js.slice(directive.length);
	}
	writeFileSync(file, js);
}

// 4. 토큰 모듈(@use token)이 내보내는 `@keyframes skeleton_loading` 같은 규칙은 SCSS 를 따로 컴파일하면 파일마다
//    붙는다(한 덩어리일 때는 압축기가 하나로 합쳤다). 두 파일 이상에 똑같이 나오는 @keyframes 는 모든 파일에서
//    빼고 모든 컴포넌트가 함께 불러오는 공통 CSS(theme.css) 에 한 번만 둔다.
const COMMON = resolve("src/styles/theme.scss");
if (!styles.has(COMMON)) throw new Error("build-modules: 배럴이 theme.scss 를 import 하지 않는다");
const compiled = new Map();
for (const abs of styles) {
	const { css } = await compile(relative(process.cwd(), abs), {
		loadPaths: [".", "src"],
		style: "compressed",
	});
	// compressed 출력은 비 ASCII 가 있으면 @charset 대신 BOM 을 붙인다 - 감싸면서 @charset 을 다시 쓴다
	compiled.set(abs, css.replace(/^(@charset "UTF-8";|\uFEFF)/, ""));
}
const keyframes = /@keyframes [\w-]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g;
const seen = new Map();
for (const css of compiled.values())
	for (const rule of new Set(css.match(keyframes) ?? [])) seen.set(rule, (seen.get(rule) ?? 0) + 1);
const shared = [...seen].filter(([, n]) => n > 1).map(([rule]) => rule);

let cssBytes = 0;
for (const [abs, css] of compiled) {
	let body = shared.reduce((acc, rule) => acc.replaceAll(rule, ""), css);
	if (abs === COMMON) body += shared.join("");
	const out = `@charset "UTF-8";\n${LAYER_ORDER}\n@layer bigtablet {\n${body}}\n`;
	const target = join(OUT, relative(resolve("src"), abs)).replace(/\.scss$/, ".css");
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, out);
	cssBytes += out.length;
}

console.log(
	`✓ dist/esm: JS ${jsFiles.length}개, CSS ${styles.size}개 (${(cssBytes / 1024).toFixed(1)}KB)`,
);
