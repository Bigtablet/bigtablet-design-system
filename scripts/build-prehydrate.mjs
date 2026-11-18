// build-prehydrate.mjs - src/text/prehydrate.ts → 인라인 스크립트 문자열(src/text/prehydrate-script.ts)
//
//   pnpm prehydrate          생성 파일을 다시 쓴다
//   pnpm prehydrate --check  생성 결과가 커밋본과 다르면 실패 (prehydrate-script.test.ts 가 같은 검사를 한다)
//
// BalancedTextScript 가 <script> 안에 그대로 넣는다 - SSR 앱에서 하이드레이션 전에 서버 HTML 의 줄을 고른다 (#1085).
// 엔진(core · layout · dom · measure)을 함께 묶어 의존성 없이 혼자 돈다.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const OUT = "src/text/prehydrate-script.ts";

/** 생성 파일 내용 */
export const generate = async () => {
	// vite(라이브러리 모드)로 묶는다 - esbuild 를 직접 의존하지 않으려고. 엔진(core · layout · dom · measure)이 함께 들어간다
	const [output] = await build({
		configFile: false,
		logLevel: "silent",
		build: {
			write: false,
			minify: true,
			target: "es2020",
			lib: { entry: "scripts/prehydrate-entry.ts", formats: ["iife"], name: "btPrehydrate" },
		},
	});
	const chunk = output.output.find((o) => o.type === "chunk");
	// <script> 안에 그대로 들어가니 닫는 태그가 섞이면 안 된다
	const code = chunk.code.trim().replace(/<\/(script)/gi, "<\\/$1");
	const source = `// 생성 파일 - 직접 고치지 말 것. 원본은 src/text/prehydrate.ts, \`pnpm prehydrate\` 로 다시 만든다.
// biome-ignore-all lint/suspicious/noTemplateCurlyInString: 묶인(minify) 코드를 문자열로 담았다 - 안의 \${} 는 그 코드의 템플릿이다
/** 하이드레이션 전에 서버 HTML 의 BalancedText 줄을 고르는 인라인 스크립트 (#1085) */
export const balancedTextScript =
	${JSON.stringify(code)};
`;
	// 커밋본이 biome 을 통과하게 - 따옴표 고르기 등을 biome 에 맡긴다
	return execFileSync("node_modules/.bin/biome", ["format", `--stdin-file-path=${OUT}`], {
		input: source,
		encoding: "utf8",
	});
};

/** 커밋본과 다른가 */
export const isStale = async () => {
	try {
		return readFileSync(OUT, "utf8") !== (await generate());
	} catch {
		return true;
	}
};

// 경로는 저장소 루트 기준 - pnpm 스크립트와 vitest 모두 루트에서 돈다
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	if (process.argv.includes("--check")) {
		if (await isStale()) {
			console.error(`❌ ${OUT} 이 src/text 와 다릅니다 - pnpm prehydrate 를 실행하세요`);
			process.exit(1);
		}
		console.log(`✓ ${OUT} - src/text 와 같습니다`);
	} else {
		writeFileSync(OUT, await generate());
		console.log(`✓ ${OUT} 생성`);
	}
}
