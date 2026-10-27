import "./browser-setup";

// 스크린샷이 흔들리지 않게 움직임을 전부 멈춘다 - 진입 transition 은 browser-setup 이 끄고,
// 여기서는 무한 애니메이션(Spinner·Skeleton)과 입력 커서 깜빡임까지 멈춘다.
const still = document.createElement("style");
still.textContent = `
*, *::before, *::after { animation: none !important; caret-color: transparent !important; }
body { margin: 0; }
`;
document.head.appendChild(still);
