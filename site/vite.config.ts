import path from "node:path";
import { defineConfig } from "vite";

const root = path.resolve(import.meta.dirname, "..");

// 패키지를 빌드하지 않고 src 를 바로 쓴다 - 예제의 import 는 소비자 코드와 같게 둔다
export default defineConfig({
	root: import.meta.dirname,
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
