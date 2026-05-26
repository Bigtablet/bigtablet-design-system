import "@testing-library/jest-dom";
import { Globals } from "@react-spring/web";

// jsdom 환경에서 react-spring 애니메이션 즉시 완료 (onRest 트리거 보장)
// — 진입/퇴출 unmount 타이밍 의존 테스트가 RAF 없이 동작
Globals.assign({ skipAnimation: true });
