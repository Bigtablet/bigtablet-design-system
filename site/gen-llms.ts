// Claude Code · Codex 같은 에이전트가 읽는 문서 - 사이트와 같은 원본(페이지 데이터 · 예제 파일 · props.json)에서 만든다.
// 패키지에 함께 실려(dist/llms) 소비 앱의 에이전트가 설치한 버전과 같은 문서를 읽는다.
//   node_modules/@bigtablet/design-system/dist/llms/index.md
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import pkg from "../package.json";
import { CATEGORIES } from "./categories";
import type { DocPage, PropsName } from "./docs";
import props from "./props.json";

const root = import.meta.dirname;
const out = path.join(root, "..", "dist", "llms");

const pages: DocPage[] = [];
for (const file of readdirSync(path.join(root, "pages"))) {
	const mod = await import(path.join(root, "pages", file));
	pages.push(...(Object.values(mod) as DocPage[]));
}
// 사이트 사이드바와 같은 순서
const groups = CATEGORIES.filter((c) => pages.some((p) => p.category === c));
pages.sort(
	(a, b) =>
		groups.indexOf(a.category) - groups.indexOf(b.category) || (a.order ?? 99) - (b.order ?? 99),
);

const source = (id: string) =>
	readFileSync(path.join(root, "examples", `${id}.tsx`), "utf8").trim();
const cell = (text: string) => text.replace(/\|/g, "\\|").replace(/\n+/g, " ");

function componentDoc(page: DocPage) {
	const lines = [`# ${page.title} (${page.name})`, "", page.summary, "", "## 언제 쓰는가", ""];
	for (const [situation, pick, self] of page.when) {
		lines.push(
			`- ${situation}: ${self ? "**" : ""}${pick}${self ? "**" : ""}${self ? "" : " (다른 컴포넌트)"}`,
		);
	}
	lines.push("", "## 예제");
	for (const ex of page.examples) {
		lines.push("", `### ${ex.title}`, "");
		if (ex.desc) lines.push(ex.desc, "");
		lines.push("```tsx", source(ex.id), "```");
	}
	// 페이지의 props 표 + 그 타입 칸이 가리키는 하위 타입(DataViewToolbar · TableColumn …) 표.
	// 사이트는 링크로 넘어가면 되지만 에이전트는 이 파일 하나로 끝내야 한다
	const names: PropsName[] = page.props ? [page.props].flat() : [];
	for (const name of names) {
		for (const p of props[name]) {
			for (const ref of p.type.match(/\b[A-Z]\w+/g) ?? []) {
				if (ref in props && !names.includes(ref as PropsName)) names.push(ref as PropsName);
			}
		}
	}
	for (const name of names) {
		lines.push("", `## ${name}`, "", "| Prop | 타입 | 기본값 | 설명 |", "|---|---|---|---|");
		for (const p of props[name]) {
			const def = "default" in p && p.default ? `\`${cell(p.default)}\`` : "-";
			lines.push(
				`| \`${p.name}\`${p.required ? " (필수)" : ""} | \`${cell(p.type)}\` | ${def} | ${cell(p.doc)} |`,
			);
		}
	}
	if (page.notes?.length) {
		lines.push("", "## 알아 둘 것", "", ...page.notes.map((n) => `- ${n}`));
	}
	return `${lines.join("\n")}\n`;
}

function indexDoc() {
	const lines = [
		`# @bigtablet/design-system ${pkg.version}`,
		"",
		"Bigtablet 제품 화면을 만드는 React 컴포넌트와 디자인 토큰입니다. 이 폴더는 에이전트용 문서이며, 설치된 패키지 버전과 내용이 같습니다.",
		"",
		"## 쓰기 전에",
		"",
		'- 모든 컴포넌트는 `import { Button } from "@bigtablet/design-system"` 로 가져옵니다. CSS 는 따로 import 하지 않습니다.',
		"- `useToast` 를 쓰면 `ToastProvider`, `useConfirm` · `useAlert` 를 쓰면 `AlertProvider` 를 앱 최상위에 한 번 둡니다. `ThemeProvider` 는 테마를 앱에서 바꿀 때만 필요하고, 없으면 OS 설정을 따릅니다.",
		'- 색 · 간격 값을 하드코딩하지 않습니다. SCSS 는 `@use "@bigtablet/design-system/scss/token" as token;` 의 토큰, CSS 는 `var(--bt-…)` 를 씁니다.',
		'- 고를 때는 각 문서의 "언제 쓰는가" 를 먼저 봅니다. 굵은 줄이 그 컴포넌트를 쓰는 경우이고, 나머지는 다른 컴포넌트를 쓰는 경우입니다.',
		"",
		"## 컴포넌트",
	];
	for (const group of groups) {
		lines.push("", `### ${group}`, "");
		for (const p of pages.filter((x) => x.category === group)) {
			lines.push(
				`- [${p.title}](components/${p.slug}.md) (${p.name}): ${p.summary.split(/(?<=다\.)\s/)[0]}`,
			);
		}
	}
	return `${lines.join("\n")}\n`;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, "components"), { recursive: true });
for (const page of pages)
	writeFileSync(path.join(out, "components", `${page.slug}.md`), componentDoc(page));
writeFileSync(path.join(out, "index.md"), indexDoc());
console.log(`dist/llms - 컴포넌트 ${pages.length}개 + index.md`);
