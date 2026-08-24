// Storybook 10.3+: preview annotations are applied automatically via @storybook/addon-vitest.

import { Globals } from "@react-spring/web";

// a11y(axe) 검사는 story 렌더 직후 실행된다. 등장 애니메이션이 도는 중이면 axe 가
// 보간 중인 opacity 를 합성해 색 대비를 계산해서(예: #fafafa on #efefef) color-contrast 가
// 실패한다 — 애니메이션 타이밍에 따라 플레이키하다. 스프링을 목표값으로 점프시켜
// 정적 상태만 검사한다. 애니메이션 자체는 unit 테스트(src/ui/**/**.test.tsx)에서 검증한다.
Globals.assign({ skipAnimation: true });
