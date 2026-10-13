import { defineConfig } from "vitest/config";
import { unitTest } from "./vitest.config";

// 뮤테이션 테스트(`stryker.config.mjs`) 전용 - `vitest.config.ts` 의 `unit` 프로젝트 설정만 쓴다.
// 기본 설정은 storybook 브라우저 프로젝트도 같이 들고 있어, Stryker 가 그대로 쓰면 뮤턴트마다
// Chromium 을 띄운다.
export default defineConfig({ test: unitTest });
