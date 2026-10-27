import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

const dirname =
	typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// `unit` 프로젝트 설정 - 뮤테이션 테스트(`vitest.mutation.config.ts`)도 이 객체를 그대로 쓴다.
export const unitTest = {
	include: ["src/**/*.test.{ts,tsx}"],
	// `*.browser.test.*` 는 실제 레이아웃이 필요해 `browser` 프로젝트(Chromium)에서만 돈다.
	// `*.visual.test.*` 는 기준 스크린샷 비교라 Playwright 이미지 안에서만 돈다 (`visual` 프로젝트).
	exclude: [
		...configDefaults.exclude,
		"src/**/*.browser.test.{ts,tsx}",
		"src/**/*.visual.test.{ts,tsx}",
	],
	environment: "jsdom",
	globals: true,
	setupFiles: ["./src/test/setup.ts"],
};

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "json-summary", "html"],
			include: ["src/ui/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"],
			// `.docs.ts` 는 Storybook meta 설명 전용 문자열이다 - 런타임 import 도, 번들 포함도
			// 없으므로 테스트 대상이 아니다. `*.test.*`·`*.stories.*` 와 같은 이유로 뺀다.
			// `.type-test.*` 는 tsc 가 검사하는 타입 단정 파일이다 - 실행되지 않으니 0% 로 잡혀 수치만 깎는다.
			exclude: [
				"**/*.test.{ts,tsx}",
				"**/*.type-test.{ts,tsx}",
				"**/*.stories.{ts,tsx}",
				"**/*.docs.{ts,tsx}",
			],
		},
		projects: [
			// Unit tests with jsdom
			{
				extends: true,
				test: { name: "unit", ...unitTest },
			},
			// 레이아웃 테스트 - jsdom 은 rect 가 전부 0 이라 배치·잘림·스크롤 잠금을 못 잰다
			{
				extends: true,
				// 컴포넌트 SCSS 가 `@use "src/styles/token"` 으로 루트 기준 경로를 쓴다
				css: { preprocessorOptions: { scss: { loadPaths: [dirname], quietDeps: true } } },
				// 첫 실행 도중 의존성을 새로 발견해 재최적화하면 React 가 두 벌 로드된다(Invalid hook call)
				optimizeDeps: {
					include: [
						"react",
						"react-dom",
						"react-dom/client",
						"react/jsx-dev-runtime",
						"@testing-library/react",
						"lucide-react",
					],
				},
				test: {
					name: "browser",
					include: ["src/**/*.browser.test.{ts,tsx}"],
					setupFiles: ["./src/test/browser-setup.ts"],
					browser: {
						enabled: true,
						headless: true,
						// headless Chromium 은 기본으로 스크롤바를 숨긴다(폭 0) - 그러면 스크롤 잠금의
						// 스크롤바 폭 보정이 아무 일도 안 해 테스트가 공회전한다.
						provider: playwright({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } }),
						instances: [{ browser: "chromium" }],
					},
				},
			},
			// 시각 회귀 - 기준 스크린샷과 픽셀 비교 (#879). 렌더는 OS·폰트에 묶이므로 기준 이미지는
			// CI 와 같은 Playwright 이미지(linux)에서만 만들고 비교한다. 파일 이름에 platform 이 붙어
			// 맥에서 돌리면 비교할 기준이 없어 실패한다 - 로컬에서는 돌리지 않는다 (docs/TESTING.md).
			{
				extends: true,
				css: { preprocessorOptions: { scss: { loadPaths: [dirname], quietDeps: true } } },
				optimizeDeps: {
					include: [
						"react",
						"react-dom",
						"react-dom/client",
						"react/jsx-dev-runtime",
						"@testing-library/react",
						"lucide-react",
					],
				},
				test: {
					name: "visual",
					include: ["src/**/*.visual.test.{ts,tsx}"],
					setupFiles: ["./src/test/visual-setup.ts"],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: "chromium" }],
						viewport: { width: 800, height: 600 },
						expect: {
							toMatchScreenshot: {
								// 기본 위치(`__screenshots__`)는 실패 스크린샷과 함께 gitignore 돼 있다
								resolveScreenshotPath: ({
									root,
									testFileDirectory,
									testFileName,
									arg,
									browserName,
									platform,
									ext,
								}) =>
									`${root}/${testFileDirectory}/__visual__/${testFileName}/${arg}-${browserName}-${platform}${ext}`,
							},
						},
					},
				},
			},
			// Storybook tests with browser
			{
				extends: true,
				plugins: [
					// The plugin will run tests for the stories defined in your Storybook config
					// See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
					storybookTest({ configDir: path.join(dirname, ".storybook") }),
				],
				test: {
					name: "storybook",
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: "chromium" }],
					},
					setupFiles: [".storybook/vitest.setup.ts"],
				},
			},
		],
	},
});
