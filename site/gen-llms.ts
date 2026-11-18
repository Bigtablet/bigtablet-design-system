// Claude Code · Codex 같은 에이전트가 읽는 문서 - 사이트와 같은 원본(페이지 데이터 · 예제 파일 · props.json)에서 만든다.
// 패키지에 함께 실려(dist/llms) 소비 앱의 에이전트가 설치한 버전과 같은 문서를 읽는다.
//   node_modules/@bigtablet/design-system/dist/llms/index.md
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import pkg from "../package.json";
import { CATEGORIES } from "./categories";
import type { DocPage } from "./docs";
import { AGENT_RULES, componentDoc } from "./llms";

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

const source = (id: string) => readFileSync(path.join(root, "examples", `${id}.tsx`), "utf8");

function indexDoc() {
	const lines = [
		`# @bigtablet/design-system ${pkg.version}`,
		"",
		"Bigtablet 제품 화면을 만드는 React 컴포넌트와 디자인 토큰입니다. 이 폴더는 에이전트용 문서이며, 설치된 패키지 버전과 내용이 같습니다.",
		"",
		"## 쓰기 전에",
		"",
		...AGENT_RULES,
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
	writeFileSync(path.join(out, "components", `${page.slug}.md`), componentDoc(page, source));
writeFileSync(path.join(out, "index.md"), indexDoc());
console.log(`dist/llms - 컴포넌트 ${pages.length}개 + index.md`);
