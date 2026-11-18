// 컴포넌트 Props 타입에서 props 표를 뽑는다 - 문서에 손으로 쓰는 표가 없어진다.
import { writeFileSync } from "node:fs";
import ts from "typescript";
import { undash } from "./undash";

const program = ts.createProgram(["src/index.ts"], {
	jsx: ts.JsxEmit.ReactJSX,
	strict: true,
	skipLibCheck: true,
});
const checker = program.getTypeChecker();
const entry = checker.getSymbolAtLocation(program.getSourceFile("src/index.ts")!)!;
const exports = checker.getExportsOfModule(entry);
// src/index.ts 가 내보내는 *Props 전부 + props 안에서 쓰는 src/ui 인터페이스(DataViewToolbar · ConfirmOptions …).
// 컴포넌트 props 가 아닌 유틸 · 내부 타입은 뺀다
const SKIP = new Set([
	"PolymorphicProps",
	"LucideProps",
	"SentencesProps",
	"RadioGroupContextValue",
	"LocaleMessages",
]);
const isUiInterface = (s: ts.Symbol) => {
	const d = (s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s).declarations?.[0];
	return !!d && ts.isInterfaceDeclaration(d) && d.getSourceFile().fileName.includes("/src/ui/");
};
const NAMES = exports
	.filter((s) => s.name.endsWith("Props") || isUiInterface(s))
	.map((s) => s.name)
	.filter((n) => !SKIP.has(n));

// HTML · lucide 에서 물려받지만 문서에 보여야 하는 속성 - 그 컴포넌트가 이 속성으로 동작을 바꾸거나 소비자가 늘 넘긴다.
// input 하나에서 물려받아도 체크박스에 accept · maxLength 는 뜻이 없어서 컴포넌트마다 고른다.
// 나머지 HTML 속성(id · className · onClick …)은 표가 길어지기만 해서 뺀다
const NATIVE: Record<string, string[]> = {
	ButtonProps: ["disabled", "type"],
	IconButtonProps: ["disabled", "type"],
	CopyButtonProps: ["disabled"],
	TabProps: ["disabled"],
	CheckboxProps: ["checked", "defaultChecked", "disabled", "required", "name", "value"],
	RadioProps: ["disabled"],
	FileInputProps: ["accept", "multiple", "disabled", "required", "name"],
	TextFieldProps: [
		"placeholder",
		"disabled",
		"readOnly",
		"required",
		"name",
		"maxLength",
		"autoComplete",
		"type",
	],
	TextareaProps: ["placeholder", "disabled", "readOnly", "required", "name", "maxLength"],
	IconProps: ["size", "color", "strokeWidth"],
};
const declaredHere = (p: ts.Symbol) =>
	!!p.declarations?.some((d) => {
		const file = d.getSourceFile().fileName;
		return file.includes("/src/") && !file.includes("/node_modules/");
	});

const out: Record<
	string,
	{ name: string; type: string; required: boolean; default?: string; doc: string }[]
> = {};
for (const name of NAMES) {
	const sym = exports.find((s) => s.name === name)!;
	const type = checker.getDeclaredTypeOfSymbol(checker.getAliasedSymbol(sym));
	const all = checker.getPropertiesOfType(type);
	// 이 저장소 src/ 에 선언된 prop(공용 `as` 포함) 먼저, 그 뒤에 NATIVE 로 고른 물려받은 속성
	const own = all.filter(declaredHere);
	const native = all.filter((p) => !declaredHere(p) && NATIVE[name]?.includes(p.name));
	out[name] = [...own, ...native]
		.map((p) => {
			const inherited = !declaredHere(p);
			const decl = p.declarations![0];
			const tags = p.getJsDocTags(checker);
			const t = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(p, decl));
			let doc = inherited
				? `HTML \`${p.name}\` 속성을 그대로 넘깁니다`
				: ts.displayPartsToString(p.getDocumentationComment(checker));
			// 이 저장소는 기본값을 설명 끝 "(기본값: x)" 로 적는다 - 열로 옮긴다
			const found = takeDefault(doc);
			// JSDoc 은 80자 안팎에서 줄을 바꿔 쓴다 - 그 줄바꿈은 문장 중간이라 잇고, 빈 줄(문단)만 남긴다
			// 목록 항목("- `auto`: …")은 문단 하나씩으로 - 줄을 이으면 항목이 한 문장에 섞인다
			doc = found.doc
				.replace(/\n\s*[-*]\s+/g, "\n\n")
				.split(/\n\s*\n/)
				.map((para) => undash(para.replace(/\s*\n\s*/g, " ").trim()))
				.filter(Boolean)
				.join("\n\n");
			return {
				name: p.name,
				// 별칭(ButtonVariant)은 실제 값 목록으로 풀어 보여 준다
				type:
					// `as` 는 PolymorphicProps 의 타입 매개변수(T)라 그대로 두면 뜻이 없다
					p.name === "as"
						? "ElementType"
						: t.isUnion() && t.types.every((u) => u.isLiteral())
							? t.types.map((u) => checker.typeToString(u)).join(" | ")
							: ((decl as ts.PropertySignature).type?.getText() ?? checker.typeToString(t))
									.replace(/React\./g, "")
									.replace(/\s*\|\s*undefined$/, ""),
				required: !(p.flags & ts.SymbolFlags.Optional),
				// 통째로 문자열 값인 기본값("현재 {page}쪽 - …")은 실제 문구라 건드리지 않는다
				default: ((v) => (v && !/^".*"$/.test(v) ? undash(v) : v))(
					ts.displayPartsToString(tags.find((t) => t.name === "default")?.text) || found.value,
				),
				doc,
			};
		})
		.filter((p) => !tagged(p.name, name));
}

/**
 * "(기본값: x)" 를 설명에서 떼어 낸다. 값 안의 괄호("(1–{totalPages})")까지 짝을 맞춰 읽고,
 * 값 뒤 덧붙임 말("…, type=`static`에서만 적용")은 기본값 칸이 아니라 설명 끝으로 돌려보낸다.
 */
function takeDefault(doc: string): { doc: string; value?: string } {
	// "(기본값: x)" · "(기본: x)" · "(기본 x)" 가 섞여 쓰인다
	const head = doc.match(/\(기본(?:값)?[:\s]/);
	if (!head || head.index === undefined) return { doc };
	const start = head.index;
	let depth = 0;
	let end = start;
	for (; end < doc.length; end++) {
		if (doc[end] === "(") depth++;
		else if (doc[end] === ")" && --depth === 0) break;
	}
	// "기본값:" 은 늘 기본값이다. 짧은 "(기본 x)" · "(기본: x)" 는 문장 중간의 덧붙임("`closeOnOverlay`(기본
	// `true`), Escape …" - 다른 prop 의 기본값)일 수 있어 설명 · 문단 끝에 올 때만 이 prop 의 기본값으로 본다
	if (head[0] !== "(기본값:" && !/^\s*(?:\.|$|\n)/.test(doc.slice(end + 1))) return { doc };
	const inner = doc.slice(start + head[0].length, end).trim();
	const rest = doc.slice(0, start).trimEnd() + doc.slice(end + 1);
	const bare = (v: string) => v.trim().replace(/^`(.*)`$/, "$1");
	const comma = inner.search(/[,:]\s|\s[-–—]\s/);
	if (comma < 0) return { doc: rest, value: bare(inner) };
	const note = inner
		.slice(comma + 1)
		.replace(/^[-–—]\s*/, "")
		.trim();
	return { doc: `${rest} - ${note}`, value: bare(inner.slice(0, comma)) };
}

// @deprecated 는 표에서 뺀다
function tagged(prop: string, owner: string) {
	const sym = exports.find((s) => s.name === owner)!;
	const p = checker.getDeclaredTypeOfSymbol(checker.getAliasedSymbol(sym)).getProperty(prop);
	return !!p?.getJsDocTags(checker).some((t) => t.name === "deprecated");
}

writeFileSync("site/props.json", `${JSON.stringify(out, null, "\t")}\n`);
console.log(
	Object.entries(out)
		.map(([k, v]) => `${k} ${v.length}`)
		.join(" · "),
);
