import fs from "node:fs";
import path from "node:path";
import { sassPlugin } from "esbuild-sass-plugin";
import { defineConfig } from "tsup";

export default defineConfig([
	// Pure React components bundle
	{
		entry: { index: "src/index.ts" },
		format: ["esm"],
		dts: true,
		clean: true,
		treeshake: true,
		sourcemap: false,
		// CSS 압축이 목적이다(gzip 기준 약 2KB). tsup 에 CSS 만 압축하는 옵션이 없어 JS 도 함께 압축된다 -
		// export 이름과 `/* @__PURE__ */` 표시는 남으므로 소비자 쪽 트리 쉐이킹은 그대로다.
		minify: true,
		external: ["react", "react-dom", "lucide-react"],
		esbuildPlugins: [sassPlugin({ type: "css", loadPaths: [".", "src"] })],
		loader: { ".svg": "dataurl" },
		splitting: false,
		async onSuccess() {
			const filePath = path.join(process.cwd(), "dist/index.js");
			const content = fs.readFileSync(filePath, "utf-8");

			// Add "use client" and CSS import
			let newContent = content;
			if (!content.startsWith('"use client"')) {
				newContent = `"use client";\n${content}`;
			}

			// Add CSS import after "use client" if not already present
			if (!newContent.includes("import './index.css'")) {
				const lines = newContent.split("\n");
				lines.splice(1, 0, "import './index.css';");
				newContent = lines.join("\n");
			}

			fs.writeFileSync(filePath, newContent);

			// 컴포넌트 CSS 를 `bigtablet` cascade layer 에 넣는다 - 소비자의 레이어 밖 CSS·Tailwind 유틸리티가
			// 특이도 싸움 없이 className 으로 덮을 수 있게. 순서 선언은 리셋(Tailwind `base`, 앱 `reset`)보다 위,
			// 유틸리티보다 아래에 둔다. 선언은 처음 나온 것이 순서를 정하므로 Tailwind 가 먼저 로드돼도 리셋보다
			// 아래로 가는 일은 없다(그 경우 유틸리티보다 위에 붙어 지금과 같은 동작 - `!` 로 덮는다).
			// 소비자의 요소 선택자 리셋(`* { padding: 0 }` 등)은 레이어 밖이면 DS 를 이기므로 `@layer reset` 에 둬야 한다.
			const cssPath = path.join(process.cwd(), "dist/index.css");
			const css = fs.readFileSync(cssPath, "utf-8");
			if (!css.includes("@layer bigtablet {")) {
				const body = css.replace(/^@charset "UTF-8";\n?/, ""); // minify 하면 줄바꿈이 없다
				fs.writeFileSync(
					cssPath,
					`@charset "UTF-8";\n@layer theme, base, reset, bigtablet, components, utilities;\n@layer bigtablet {\n${body}}\n`,
				);
			}
		},
	},
	// Vanilla JS bundle (for HTML/CSS/JS, Thymeleaf, JSP, etc.)
	{
		entry: { "vanilla/bigtablet": "src/vanilla/bigtablet.js" },
		format: ["iife"],
		globalName: "Bigtablet",
		dts: false,
		clean: false,
		treeshake: true,
		sourcemap: false,
		minify: true,
		outExtension: () => ({ js: ".min.js" }),
		esbuildOptions(options) {
			// bigtablet.js uses UMD pattern (module.exports) for browser compatibility.
			// Since package.json has "type": "module", esbuild treats it as ESM and warns
			// about the CommonJS `module` variable. Suppress this — the IIFE format handles
			// the global export and the UMD check is irrelevant at runtime.
			options.logOverride = { "commonjs-variable-in-esm": "silent" };
			// min.js 는 files 에서 비minified bigtablet.js 를 제외해 실제로 배포되는 유일한 vanilla JS 다.
			// esbuild 는 minify 시 legalComments 기본값이 "none" 이라 소스의 @license 배너를 떼버리는데,
			// 그러면 배포물에 라이선스 표기가 하나도 남지 않는다. 원위치에 보존한다.
			options.legalComments = "inline";
		},
	},
]);
