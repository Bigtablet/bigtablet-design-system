import { unitTest } from "../../vitest.config";

// 뮤테이션 테스트(`stryker.config.mjs`) 전용 - 저장소 `vitest.config.ts` 의 `unit` 프로젝트 설정만 쓴다.
// 기본 설정은 브라우저 프로젝트도 같이 들고 있어, Stryker 가 그대로 쓰면 뮤턴트마다 Chromium 을 띄운다.
// 실행 위치가 저장소 루트라 Vite 의 root(process.cwd())도 루트 - include · setupFiles 경로가 그대로 맞는다.
// `vitest/config` 는 import 하지 않는다 - 이 폴더의 vitest 와 루트 vitest 가 섞이지 않게.
export default { test: unitTest };
