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
import { avoidDoc, recipesDoc, tokensDoc } from "./llms-docs";

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
		"## 함께 볼 문서",
		"",
		...GUIDES.map(([file, title, desc]) => `- [${title}](${file}): ${desc}`),
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

/** 컴포넌트 밖의 문서 (#1093) - [파일, 제목, 한 줄 설명, 내용] */
const GUIDES: [string, string, string, string][] = [
	[
		"tokens.md",
		"디자인 토큰",
		"색 · 간격 · 글자 · 모서리 · 그림자 · 모션의 이름과 값. 여기 없는 토큰은 없습니다",
		tokensDoc(),
	],
	[
		"recipes.md",
		"화면 조합",
		"관리자 목록 · 폼 · 랜딩 화면을 컴포넌트로 조합한 예",
		recipesDoc(source),
	],
	["avoid.md", "쓰지 말 것", "옛 이름 · 지운 prop · deprecated 와 대신 쓸 것", avoidDoc()],
	[
		"text.md",
		"줄바꿈 (`/text`)",
		"BalancedText · BalancedTextScript(SSR) · Sentences - 한국어 글이 어색한 자리에서 갈리지 않게",
		readFileSync(path.join(root, "llms", "text.md"), "utf8"),
	],
	[
		"vanilla.md",
		"Vanilla (HTML/CSS/JS)",
		"React 없는 서버 템플릿(Thymeleaf · JSP · PHP)에서 같은 모양으로 쓰는 클래스 · 스크립트",
		readFileSync(path.join(root, "..", "docs", "VANILLA.md"), "utf8"),
	],
];

// 사이트 빌드본은 다른 파일도 있는 폴더라 통째로 지우지 않는다 - 컴포넌트 문서 폴더만 새로
rmSync(site ? path.join(out, "components") : out, { recursive: true, force: true });
mkdirSync(path.join(out, "components"), { recursive: true });
const components = pages.map((page) => componentDoc(page, source));
for (const [i, page] of pages.entries())
	writeFileSync(path.join(out, "components", `${page.slug}.md`), components[i] as string);
for (const [file, , , content] of GUIDES) writeFileSync(path.join(out, file), content);
// llms.txt 는 사이트 루트의 관례 이름이다 (llmstxt.org)
const indexName = site ? "llms.txt" : "index.md";
const index = indexDoc();
writeFileSync(path.join(out, indexName), index);
// 한 번에 넣는 한 파일 - 웹에서 읽는 에이전트가 링크를 따라가지 않아도 되게. 사이트는 관례 이름 llms-full.txt.
// Vanilla 는 React 앱에 필요 없어 빼고 목차에서 vanilla.md 로 잇는다
const fullName = site ? "llms-full.txt" : "full.md";
const full = [
	index,
	...GUIDES.filter(([file]) => file !== "vanilla.md").map(([, , , content]) => content),
	...components,
].join("\n---\n\n");
writeFileSync(path.join(out, fullName), full);
console.log(
	`${path.relative(process.cwd(), out)} - 컴포넌트 ${pages.length}개 + ${indexName} · ${fullName} · ${GUIDES.map(([f]) => f).join(" · ")}`,
);
