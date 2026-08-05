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
