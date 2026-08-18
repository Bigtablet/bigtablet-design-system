import "@testing-library/jest-dom";
import { Globals } from "@react-spring/web";
import { afterEach, beforeEach } from "vitest";

// jsdom 환경에서 react-spring 애니메이션 즉시 완료 (onRest 트리거 보장)
// - 진입/퇴출 unmount 타이밍 의존 테스트가 RAF 없이 동작
Globals.assign({ skipAnimation: true });

// Modal/Drawer/Alert 는 document.body 에 스크롤락 카운터(dataset.openModals)와
// overflow 를 공유한다(여러 오버레이 동시 오픈 조율용 - production 의도된 설계).
// 이 전역이 테스트 간 누수되면 오버레이가 originalOverflow 를 오염된 값으로 저장한다.
// beforeEach 로 각 테스트 렌더 직전 초기화, afterEach 는 teardown 위생용.
//
// 주의: 이건 테스트 간 격리용일 뿐, 한 테스트 안의 비동기 unmount 를 대신 처리하지 않는다.
// 퇴출 spring 은 act 밖에서 setState 하므로 portal 제거 커밋과 useEffect cleanup flush 가
// 한 tick 벌어진다 - 잠금 해제를 단언하려면 waitFor 안에서 함께 기다릴 것.
function resetBodyScrollLock() {
	document.body.style.overflow = "";
	document.body.style.paddingRight = "";
	document.documentElement.style.scrollbarGutter = "";
	document.documentElement.style.removeProperty("--bt-scrollbar-width");
	delete document.body.dataset.openModals;
	delete document.body.dataset.originalOverflow;
	delete document.body.dataset.originalScrollbarGutter;
	delete document.body.dataset.originalPaddingRight;
}

beforeEach(resetBodyScrollLock);
afterEach(resetBodyScrollLock);
