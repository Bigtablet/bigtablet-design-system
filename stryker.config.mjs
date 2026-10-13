/**
 * @fileoverview 뮤테이션 테스트 설정 - `pnpm test:mutation`
 *
 * @description
 * 코드를 조금씩 바꾼 사본(뮤턴트)마다 단위 테스트를 돌려, 테스트가 그 변화를 잡는지(killed) 놓치는지
 * (survived) 본다. 커버리지는 "그 줄을 실행했는가" 만 재서, 결과를 확인하지 않는 테스트도 100% 가 된다.
 *
 * 대상은 로직이 몰린 곳부터 - 공용 훅·유틸, 키보드·포커스 처리가 많은 컴포넌트, Vanilla JS.
 * SCSS·레이아웃 결함은 jsdom 이 렌더하지 않아 이 도구로는 잡히지 않는다. CI 에는 걸지 않는다(로컬 실행).
 */
export default {
	testRunner: "vitest",
	// Stryker 는 저장소 의존성 밖 `tools/mutation` 에 따로 설치한다(이유는 그 폴더의 pnpm-workspace.yaml).
	plugins: ["@stryker-mutator/vitest-runner"],
	vitest: { configFile: "vitest.mutation.config.ts" },
	mutate: [
		"src/utils/**/*.{ts,tsx}",
		"!src/utils/**/*.test.{ts,tsx}",
		"!src/utils/**/*.type-test.tsx",
		"src/ui/display/table/index.tsx",
		"src/ui/navigation/tabs/index.tsx",
		"src/ui/forms/combobox/index.tsx",
		"src/ui/forms/date-picker/{index,calendar}.tsx",
		"src/ui/overlay/modal/index.tsx",
		"src/vanilla/bigtablet.js",
	],
	// 뮤턴트마다 그 줄을 지나는 테스트만 돌린다 - 전체를 다시 돌리면 몇 배 느리다.
	coverageAnalysis: "perTest",
	// 기본값은 코어 수만큼 프로세스를 띄워 다른 작업이 멈춘다.
	concurrency: 4,
	reporters: ["clear-text", "progress", "html", "json"],
	htmlReporter: { fileName: "reports/mutation/index.html" },
	jsonReporter: { fileName: "reports/mutation/mutation.json" },
	tempDirName: ".stryker-tmp",
	thresholds: { high: 90, low: 75, break: null },
};
