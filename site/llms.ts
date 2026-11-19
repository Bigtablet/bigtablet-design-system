// 에이전트가 읽는 마크다운 - 빌드(gen-llms → dist/llms)와 사이트의 "마크다운 복사" 가 같은 함수를 쓴다.
// 예제 원본을 읽는 방법만 다르다(빌드는 fs, 사이트는 import.meta.glob) - 그래서 source 를 받는다
import type { DocPage, PropsName } from "./docs";
import props from "./props.json";

/** dist/llms/index.md 의 "쓰기 전에" - 컴포넌트 문서 한 장만 복사해 갈 때도 앞에 붙는다 */
export const AGENT_RULES = [
	'- 모든 컴포넌트는 `import { Button } from "@bigtablet/design-system"` 로 가져옵니다. CSS 는 따로 import 하지 않습니다.',
	"- `useToast` 를 쓰면 `ToastProvider`, `useConfirm` · `useAlert` 를 쓰면 `AlertProvider` 를 앱 최상위에 한 번 둡니다. `ThemeProvider` 는 테마를 앱에서 바꿀 때만 필요하고, 없으면 OS 설정을 따릅니다.",
	'- 색 · 간격 값을 하드코딩하지 않습니다. SCSS 는 `@use "@bigtablet/design-system/scss/token" as token;` 의 토큰, CSS 는 `var(--bt-…)` 를 씁니다. 토큰 이름 · 값은 tokens.md 에 있는 것만 씁니다.',
	"- `onChange` · 의미 색 `variant` 같은 옛 이름을 쓰기 전에 avoid.md 를 봅니다 - 지운 이름은 타입 에러가 납니다.",
	'- 고를 때는 각 문서의 "언제 쓰는가" 를 먼저 봅니다. 굵은 줄이 그 컴포넌트를 쓰는 경우이고, 나머지는 다른 컴포넌트를 쓰는 경우입니다.',
];

/** 앱의 CLAUDE.md · AGENTS.md 에 넣는 줄 */
export const AGENT_SNIPPET = `## UI
- 화면은 @bigtablet/design-system 컴포넌트로 만든다. 쓰기 전에 node_modules/@bigtablet/design-system/dist/llms/index.md 를 읽고, 고른 컴포넌트의 문서(dist/llms/components/*.md)를 따른다.`;

// 표 칸 - 백슬래시를 먼저 겹쳐야 뒤에 넣는 `\|` 와 섞이지 않는다
const cell = (text: string) =>
	text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n+/g, " ");

export function componentDoc(page: DocPage, source: (id: string) => string) {
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
		lines.push("```tsx", source(ex.id).trim(), "```");
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
