import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const site = import.meta.dirname;

/**
 * 주소별 탭 제목을 index.html 에 박는다. 제목은 페이지 데이터에서 정해져서 JS 가 다 뜬 뒤에야 걸리는데,
 * 그 전까지 기본 제목이 보였다. 첫 그리기 전에 hash 로 표에서 찾아 건다 (테마 선적용과 같은 자리).
 * ponytail: 정규식으로 `slug: "…"` 다음의 첫 `title: "…"` 를 읽는다 - 페이지 파일이 리터럴로 쓰는 한 충분하다
 */
function pageTitles(): Plugin {
	const read = () => {
		const files = [
			...readdirSync(path.join(site, "pages")).map((f) => path.join(site, "pages", f)),
			path.join(site, "foundation.tsx"),
			path.join(site, "guides.tsx"),
		];
		const titles: Record<string, string> = {};
		for (const file of files) {
			for (const [, slug = "", title = ""] of readFileSync(file, "utf8").matchAll(
				/slug:\s*"([^"]*)"[\s\S]*?title:\s*"([^"]*)"/g,
			)) {
				if (slug) titles[slug] = title;
			}
		}
		return titles;
	};
	return {
		name: "page-titles",
		transformIndexHtml: {
			order: "pre",
			handler: (html, ctx) =>
				ctx.filename.endsWith("index.html")
					? html.replace(
							"</title>",
							`</title>\n\t\t<script>{const t=${JSON.stringify(read())}[location.hash.replace(/^#\\/?/,"").split("#")[0]];if(t)document.title=t}</script>`,
						)
					: html,
		},
	};
}

// 패키지를 빌드하지 않고 src 를 바로 쓴다 - 예제의 import 는 소비자 코드와 같게 둔다
export default defineConfig({
	root: site,
	plugins: [pageTitles()],
	// 파비콘 · 로고는 Storybook 과 같은 저장소 public/ 을 쓴다
	publicDir: path.join(root, "public"),
	resolve: {
		alias: {
			"@bigtablet/design-system": path.join(root, "src/index.ts"),
			src: path.join(root, "src"),
		},
	},
	css: { preprocessorOptions: { scss: { loadPaths: [root], quietDeps: true } } },
	build: { rollupOptions: { input: ["index.html", "preview.html"] } },
	server: { port: 6007 },
});
