// Claude Code · Codex 같은 에이전트가 읽는 문서 - 사이트와 같은 원본(페이지 데이터 · 예제 파일 · props.json)에서 만든다.
// 패키지에 함께 실려(dist/llms) 소비 앱의 에이전트가 설치한 버전과 같은 문서를 읽는다.
//   node_modules/@bigtablet/design-system/dist/llms/index.md
// `--site <폴더>` 면 문서 사이트 빌드본에 llms.txt + components/*.md 로 낸다 (#1061) - 패키지를 깔기 전이나
// 웹에서 읽는 에이전트용. 사이트는 main 최신이라 설치한 버전과 다를 수 있음을 목차에 적는다
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import pkg from "../package.json";
import { CATEGORIES } from "./categories";
import type { DocPage } from "./docs";
import { AGENT_RULES, componentDoc } from "./llms";

const root = import.meta.dirname;
const siteAt = process.argv.indexOf("--site");
const site = siteAt > 0 ? process.argv[siteAt + 1] : undefined;
// 값 없이 플래그만 오면 조용히 패키지용으로 빠지지 않게 - 사이트에 llms.txt 가 없는데 빌드가 성공으로 보인다
if (siteAt > 0 && !site) throw new Error("--site 에는 폴더 경로가 필요합니다");
const out = site ? path.resolve(site) : path.join(root, "..", "dist", "llms");

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
		site
			? "Bigtablet 제품 화면을 만드는 React 컴포넌트와 디자인 토큰입니다. 이 문서는 문서 사이트(main 최신)에서 냅니다. 앱에 설치된 버전과 다를 수 있으니, 설치했다면 node_modules/@bigtablet/design-system/dist/llms/index.md 를 우선합니다."
			: "Bigtablet 제품 화면을 만드는 React 컴포넌트와 디자인 토큰입니다. 이 폴더는 에이전트용 문서이며, 설치된 패키지 버전과 내용이 같습니다.",
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

// 사이트 빌드본은 다른 파일도 있는 폴더라 통째로 지우지 않는다 - 컴포넌트 문서 폴더만 새로
rmSync(site ? path.join(out, "components") : out, { recursive: true, force: true });
mkdirSync(path.join(out, "components"), { recursive: true });
for (const page of pages)
	writeFileSync(path.join(out, "components", `${page.slug}.md`), componentDoc(page, source));
// llms.txt 는 사이트 루트의 관례 이름이다 (llmstxt.org)
const indexName = site ? "llms.txt" : "index.md";
writeFileSync(path.join(out, indexName), indexDoc());
console.log(`${path.relative(process.cwd(), out)} - 컴포넌트 ${pages.length}개 + ${indexName}`);
