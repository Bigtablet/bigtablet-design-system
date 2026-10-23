import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// 컴포넌트가 쓰는 --bt-* CSS 변수. 없으면 간격·폭 토큰이 풀리지 않아 실측이 어긋난다.
import "../styles/theme.scss";

// 레이아웃만 본다 - 보간 중의 scale/translate 가 rect 를 흔들지 않게.
// 진입/퇴출 transition 을 끈다 - usePresence 는 돌고 있는 애니메이션이 없으면 바로 언마운트하므로
// 오버레이가 목표값에서 시작하고 닫히면 바로 사라진다. 무한 애니메이션(Spinner 등)은 그대로 둔다.
const noTransition = document.createElement("style");
noTransition.textContent = "*, *::before, *::after { transition-duration: 0s !important; }";
document.head.appendChild(noTransition);

// `globals` 를 켜지 않은 프로젝트라 RTL 자동 cleanup 이 안 걸린다. 스크롤 위치도 같은 페이지를
// 공유하므로 되돌린다 - 스크롤 잠금 테스트가 `scrollTo(0, 300)` 을 남기면 뒤 테스트의 좌표가 흔들린다.
afterEach(() => {
	cleanup();
	window.scrollTo(0, 0);
});
