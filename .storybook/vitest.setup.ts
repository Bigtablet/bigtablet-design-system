// Storybook 10.3+: preview annotations are applied automatically via @storybook/addon-vitest.

// a11y(axe) 검사는 story 렌더 직후 실행된다. 등장 애니메이션이 도는 중이면 axe 가
// 보간 중인 opacity 를 합성해 색 대비를 계산해서(예: #fafafa on #efefef) color-contrast 가
// 실패한다 — 애니메이션 타이밍에 따라 플레이키하다. 정적 상태만 검사한다.
// 진입/퇴출 transition 을 끈다 - usePresence 는 돌고 있는 애니메이션이 없으면 바로 언마운트하므로
// 오버레이가 목표값에서 시작하고 닫히면 바로 사라진다. 무한 애니메이션(Spinner 등)은 그대로 둔다.
const noTransition = document.createElement("style");
noTransition.textContent = "*, *::before, *::after { transition-duration: 0s !important; }";
document.head.appendChild(noTransition);
