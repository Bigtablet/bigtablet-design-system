// 컴포넌트 문서 밖의 에이전트 문서 (#1093) - 토큰 · 화면 조합 · 쓰지 말 것. gen-llms 가 dist/llms 와 사이트 llms.txt 옆에 낸다.
// 토큰은 사이트 Foundation 페이지와 같은 원본(token-data.ts), 조합은 타입 검사 · axe 검사를 받는 예제 파일(examples/recipes)이다
import { COLOR_GROUPS, collect, show, type Token, TYPE_GROUPS } from "./token-data";

// 표 칸 - 백슬래시를 먼저 겹쳐야 뒤에 넣는 `\|` 와 섞이지 않는다
const cell = (text: string) =>
	text.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\n+/g, " ");

const tokenTable = (items: Token[]) => [
	"| SCSS | CSS 변수 | 값 | 다크 | 설명 |",
	"|---|---|---|---|---|",
	...items.map(
		(t) =>
			`| ${t.scss ? `\`${t.scss}\`` : t.name} | ${t.css ? `\`${t.css}\`` : "-"} | ${cell(show(t.light))} | ${
				t.dark === undefined ? "-" : cell(show(t.dark))
			} | ${t.description ? cell(t.description) : ""} |`,
	),
];

/** dist/llms/tokens.md - 토큰 이름 · 값 전체. 에이전트가 없는 토큰을 지어내지 않게 */
export function tokensDoc() {
	const lines = [
		"# 디자인 토큰",
		"",
		"색 · 간격 · 글자 · 모서리 · 그림자 · 모션은 이 표에 있는 이름만 씁니다. 표에 없는 이름(`$spacing_18` 같은)은 없습니다 - 사이 값이 필요하면 가까운 단계로 맞춥니다.",
		"",
		'- SCSS: `@use "@bigtablet/design-system/scss/token" as token;` 뒤 `token.$이름` · `@include token.믹스인`',
		"- CSS: `var(--bt-…)` - 라이트 · 다크 테마에 따라 값이 바뀝니다. 다크 칸이 비어 있으면 두 테마가 같습니다",
		"- 글자에는 `color.text.*` 와 `-on-surface` 로 끝나는 색만 씁니다. `status.*` 의 배경용 색을 글자에 쓰면 다크에서 대비가 무너집니다",
		"",
		"## 색",
	];
	for (const [key, title, desc] of COLOR_GROUPS) {
		lines.push("", `### ${title} (\`${key}\`)`, "");
		if (desc) lines.push(desc, "");
		lines.push(...tokenTable(collect(`semantic.color.${key}`)));
	}
	lines.push(
		"",
		"## 글자 (SCSS 믹스인)",
		"",
		"크기가 아니라 역할로 고릅니다 - 믹스인 하나가 크기 · 줄 높이 · 굵기를 함께 정합니다.",
		"",
		"| 믹스인 | 크기 / 줄 높이 · 굵기 |",
		"|---|---|",
	);
	for (const key of TYPE_GROUPS) {
		for (const t of collect(`semantic.typography.${key}`)) {
			const v = t.light as Record<string, string | number>;
			if (t.scss)
				lines.push(`| \`${t.scss}\` | ${v.fontSize} / ${v.lineHeight} · ${v.fontWeight} |`);
		}
	}
	const groups: [string, string, string][] = [
		[
			"글꼴",
			"semantic.typography.font-family",
			"크기 · 굵기는 위 믹스인이 정하고, 글꼴만 따로 쓸 때 이 토큰을 씁니다.",
		],
		["간격", "semantic.spacing", "여백 · gap 은 이 단계만 씁니다."],
		["모서리", "semantic.radius", ""],
		["그림자", "base.elevation", "카드는 level1, 메뉴 · 팝오버는 level2, 모달은 더 높게."],
		[
			"모션",
			"base.motion",
			"`$transition_*` 는 길이와 곡선을 함께 담습니다 - 뒤에 곡선을 또 붙이지 않습니다.",
		],
		[
			"화면 폭",
			"base.breakpoint",
			"600px 미만이 좁은 화면(compact)입니다. SCSS 는 `@include token.compact`.",
		],
		["겹침 순서", "semantic.layer", ""],
		["아이콘 크기", "base.icon-size", "lucide-react 의 `size` 에 넣는 값입니다."],
	];
	for (const [title, path, desc] of groups) {
		lines.push("", `## ${title}`, "");
		if (desc) lines.push(desc, "");
		lines.push(...tokenTable(collect(path)));
	}
	return `${lines.join("\n")}\n`;
}

/** 화면 조합 - 컴포넌트를 하나씩이 아니라 화면 단위로 묻는 경우가 많다 */
export const RECIPES = [
	{
		id: "recipes/admin-list",
		title: "관리자 목록 화면",
		desc: "AppShell(사이드바 + 고정 헤더) 안에 PageHeader 와 DataView. DataView 가 검색 · 표 · 페이지 · 로딩 · 빈 상태 · 오류를 함께 맡아 Table · Pagination · EmptyState 를 따로 조립하지 않습니다.",
	},
	{
		id: "recipes/form-page",
		title: "폼 화면",
		desc: "PageHeader + Card 안 Form · Field. 검증 · 서버 에러는 `Form` 의 `errors` 로 이름별로 넘기고, 저장 결과는 Toast 로 알립니다.",
	},
	{
		id: "recipes/landing",
		title: "마케팅 랜딩",
		desc: "NavBar · Hero 다음 Section(배경을 끝까지) > Container(글 폭) > Grid > Card.",
	},
];

/** dist/llms/recipes.md */
export function recipesDoc(source: (id: string) => string) {
	const lines = [
		"# 화면 조합",
		"",
		"자주 만드는 화면을 DS 컴포넌트로 조합한 예입니다. 각 컴포넌트의 세부 prop 은 components/*.md 를 봅니다.",
	];
	for (const r of RECIPES) {
		lines.push("", `## ${r.title}`, "", r.desc, "", "```tsx", source(r.id).trim(), "```");
	}
	return `${lines.join("\n")}\n`;
}

/**
 * 쓰지 말 것 - 예전 버전 코드로 배운 에이전트가 자주 만드는 옛 이름 · 지운 prop · deprecated (docs/MIGRATION.md).
 * [컴포넌트 props 이름, 쓰지 말 것, 대신] - props 가 있는 줄은 테스트가 "지운 이름은 없고 대신 쓸 이름은 있다" 를 확인한다
 */
export const AVOID: {
	/** props 표 이름 - 있으면 지운 prop · 대신 쓸 prop 이다 */
	props?: string;
	component?: string;
	avoid: string;
	use: string;
	why?: string;
}[] = [
	{ props: "DropdownSingleProps", component: "Dropdown", avoid: "onChange", use: "onValueChange" },
	{ props: "DatePickerProps", component: "DatePicker", avoid: "onChange", use: "onValueChange" },
	{ props: "PaginationProps", component: "Pagination", avoid: "onChange", use: "onPageChange" },
	{ props: "SwitchProps", component: "Switch", avoid: "onChange", use: "onCheckedChange" },
	{
		avoid: "`Toggle` · `ToggleProps`",
		use: "`Switch` · `SwitchProps`",
		why: '4.15.0 에서 이름을 바꿨다 - 같은 컴포넌트 (`role="switch"`). 옛 이름은 deprecated 별칭',
	},
	{
		avoid:
			'날짜 `minDate` · `selectableRange` · `startYear`/`endYear` · `mode="year-month"`, TimePicker `minTime`/`maxTime`',
		use: '`min` · `max` (`"today"` 도 받는다) · `isDateDisabled` · `MonthPicker`',
		why: "4.15.0 에서 날짜 · 시간 범위 prop 이름을 통일했다. 옛 이름은 deprecated",
	},
	{
		props: "TextFieldProps",
		component: "TextField",
		avoid: "onChangeAction",
		use: "onValueChange",
	},
	{ props: "FilterBarProps", component: "FilterBar", avoid: "loading", use: "isLoading" },
	{
		avoid: '`<Badge variant="success">` · Alert · Toast 의 `variant` 로 의미 색',
		use: "`tone` (info · success · warning · error)",
	},
	{
		avoid: '`Tabs variant="fills"`',
		use: "패널을 바꾸면 기본 `line`, 값만 고르면 `SegmentedControl`",
		why: "deprecated - 이후 버전에서 제거",
	},
	{ avoid: '`IconButton variant="standard"` · `"outlined"`', use: '`"text"` · `"outline"`' },
	{ avoid: '`Card variant="outlined"`', use: '`"outline"`' },
	{
		avoid: "SCSS 믹스인 `glass_light` · `hover_lift` · `hover_glow` · `slashed_zero`",
		use: '`<Card variant="glass">` · `<Card interactive>` · `token.legible_identifiers`',
		why: "deprecated - 색 · 그림자를 하드코딩한다",
	},
	{
		avoid: '`import "@bigtablet/design-system/style.css"`',
		use: "아무것도 - 컴포넌트를 import 하면 그 CSS 가 같이 온다. 같이 쓰면 CSS 가 두 번 실린다(토큰 객체만 쓰는 모듈에서 테마 변수가 필요할 때만 style.css)",
	},
	{
		avoid: "컴포넌트에 `dangerouslySetInnerHTML` 넘기기",
		use: "children 으로 React 노드",
		why: "props 에서 지웠다 - 타입 에러",
	},
	{ avoid: "색 · 간격 값 하드코딩(`#111`, `14px`)", use: "tokens.md 의 토큰" },
];

/** dist/llms/avoid.md */
export function avoidDoc() {
	const lines = [
		"# 쓰지 말 것",
		"",
		"예전 버전에 있던 이름이나 지금은 권하지 않는 방법입니다. 이 표의 왼쪽을 쓰고 있다면 오른쪽으로 바꿉니다. 버전별 자세한 내용은 [MIGRATION.md](https://github.com/Bigtablet/bigtablet-design-system/blob/main/docs/MIGRATION.md) 에 있습니다.",
		"",
		"| 쓰지 말 것 | 대신 | 이유 |",
		"|---|---|---|",
		...AVOID.map(
			(a) =>
				`| ${a.props ? `${a.component} \`${a.avoid}\`` : a.avoid} | ${
					a.props ? `\`${a.use}\`` : a.use
				} | ${a.why ?? (a.props ? "지운 이름 - 타입 에러" : "")} |`,
		),
	];
	return `${lines.join("\n")}\n`;
}
