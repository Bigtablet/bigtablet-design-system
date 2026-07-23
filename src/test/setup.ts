import "@testing-library/jest-dom";
import { Globals } from "@react-spring/web";
import { afterEach, beforeEach } from "vitest";

// jsdom 환경에서 react-spring 애니메이션 즉시 완료 (onRest 트리거 보장)
// - 진입/퇴출 unmount 타이밍 의존 테스트가 RAF 없이 동작
Globals.assign({ skipAnimation: true });

// Modal/Drawer/Alert 는 document.body 에 스크롤락 카운터(dataset.openModals)와
// overflow 를 공유한다(여러 오버레이 동시 오픈 조율용 - production 의도된 설계).
// 이 전역이 테스트 간 누수되면 스크롤락 상태가 새어 flaky 해진다:
// react-spring 퇴출(useSpringPresence) 의 unmount 가 skipAnimation 이라도 onRest 스케줄
// 때문에 한 tick 늦게 실행될 수 있어, 앞 테스트 오버레이의 스크롤락 cleanup 이 테스트
// 경계를 넘어 body 를 더럽히는 경우가 있다(coverage 계측 타이밍에서 재현).
//
// beforeEach 가 결정적 방어선: 각 테스트 렌더 직전 body 스크롤락 전역을 초기화해, 오버레이가
// originalOverflow 를 항상 깨끗한 값으로 저장하도록 보장한다. afterEach 는 teardown 위생용.
function resetBodyScrollLock() {
	document.body.style.overflow = "";
	delete document.body.dataset.openModals;
	delete document.body.dataset.originalOverflow;
}

beforeEach(resetBodyScrollLock);
afterEach(resetBodyScrollLock);
