// 컴포넌트 Props 타입에서 props 표를 뽑는다 - 문서에 손으로 쓰는 표가 없어진다.
import { writeFileSync } from "node:fs";
import ts from "typescript";

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

const out: Record<
	string,
	{ name: string; type: string; required: boolean; default?: string; doc: string }[]
> = {};
for (const name of NAMES) {
	const sym = exports.find((s) => s.name === name)!;
	const type = checker.getDeclaredTypeOfSymbol(checker.getAliasedSymbol(sym));
	out[name] = checker
		.getPropertiesOfType(type)
		// HTML 속성은 빼고 이 저장소 src/ui 에 선언된 prop 만
		.filter((p) => p.declarations?.some((d) => d.getSourceFile().fileName.includes("/src/ui/")))
		.map((p) => {
			const decl = p.declarations![0];
			const tags = p.getJsDocTags(checker);
			const t = checker.getNonNullableType(checker.getTypeOfSymbolAtLocation(p, decl));
			let doc = ts.displayPartsToString(p.getDocumentationComment(checker));
			// 이 저장소는 기본값을 설명 끝 "(기본값: x)" 로 적는다 - 열로 옮긴다
			const found = takeDefault(doc);
			doc = found.doc;
			return {
				name: p.name,
				// 별칭(ButtonVariant)은 실제 값 목록으로 풀어 보여 준다
				type:
					t.isUnion() && t.types.every((u) => u.isLiteral())
						? t.types.map((u) => checker.typeToString(u)).join(" | ")
						: ((decl as ts.PropertySignature).type?.getText() ?? checker.typeToString(t)).replace(
								/React\./g,
								"",
							),
				required: !(p.flags & ts.SymbolFlags.Optional),
				default:
					ts.displayPartsToString(tags.find((t) => t.name === "default")?.text) || found.value,
				doc,
			};
		})
		.filter((p) => !tagged(p.name, name) && p.name !== "href" && p.name !== "ref");
}

/**
 * "(기본값: x)" 를 설명에서 떼어 낸다. 값 안의 괄호("(1–{totalPages})")까지 짝을 맞춰 읽고,
 * 값 뒤 덧붙임 말("…, type=`static`에서만 적용")은 기본값 칸이 아니라 설명 끝으로 돌려보낸다.
 */
function takeDefault(doc: string): { doc: string; value?: string } {
	const start = doc.indexOf("(기본값:");
	if (start < 0) return { doc };
	let depth = 0;
	let end = start;
	for (; end < doc.length; end++) {
		if (doc[end] === "(") depth++;
		else if (doc[end] === ")" && --depth === 0) break;
	}
	const inner = doc.slice(start + "(기본값:".length, end).trim();
	const rest = doc.slice(0, start).trimEnd() + doc.slice(end + 1);
	const comma = inner.search(/,\s/);
	if (comma < 0) return { doc: rest, value: inner };
	return { doc: `${rest} - ${inner.slice(comma + 1).trim()}`, value: inner.slice(0, comma).trim() };
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
