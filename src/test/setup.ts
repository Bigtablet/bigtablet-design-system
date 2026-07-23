import "@testing-library/jest-dom";
import { Globals } from "@react-spring/web";
import { afterEach } from "vitest";

// jsdom 환경에서 react-spring 애니메이션 즉시 완료 (onRest 트리거 보장)
// - 진입/퇴출 unmount 타이밍 의존 테스트가 RAF 없이 동작
Globals.assign({ skipAnimation: true });

// Modal/Drawer/Alert 는 document.body 에 스크롤락 카운터(dataset.openModals)와
// overflow 를 공유한다(여러 오버레이 동시 오픈 조율용 - production 의도된 설계).
// 이 전역이 테스트 파일 간 누수되면 특정 실행 순서에서 스크롤락 상태가 새어 flaky 해진다.
// RTL 자동 cleanup(afterEach, LIFO 로 먼저 실행되어 언마운트+카운터 정리) 이후 이 훅이
// 실행되므로, 정상 케이스엔 no-op 안전망이고 누수 시엔 다음 테스트를 깨끗한 상태로 격리한다.
afterEach(() => {
	document.body.style.overflow = "";
	delete document.body.dataset.openModals;
	delete document.body.dataset.originalOverflow;
});
