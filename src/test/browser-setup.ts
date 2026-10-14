import "@testing-library/jest-dom/vitest";
import { Globals } from "@react-spring/web";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
// 컴포넌트가 쓰는 --bt-* CSS 변수. 없으면 간격·폭 토큰이 풀리지 않아 실측이 어긋난다.
import "../styles/theme.scss";

// 레이아웃만 본다 - 스프링 보간 중의 scale/translate 가 rect 를 흔들지 않게 목표값으로 점프.
Globals.assign({ skipAnimation: true });

// `globals` 를 켜지 않은 프로젝트라 RTL 자동 cleanup 이 안 걸린다.
afterEach(cleanup);
