import { defineConfig } from "vitest/config";

// 뮤테이션 테스트(`stryker.config.mjs`) 전용 - `vitest.config.ts` 의 `unit` 프로젝트만 떼어 낸 것.
// 기본 설정은 storybook 브라우저 프로젝트도 같이 들고 있어, Stryker 가 그대로 쓰면 뮤턴트마다
// Chromium 을 띄운다. 단위 테스트 설정을 바꾸면 여기도 맞춘다.
export default defineConfig({
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
	},
});
