import { animated, Globals } from "@react-spring/web";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSpringPresence } from "./use-spring-presence";

const Probe = ({ visible }: { visible: boolean }) => {
	const style = useSpringPresence({ visible, from: "translateX(20px)" });
	return <animated.div data-testid="probe" style={style} />;
};

const stubReducedMotion = (matches: boolean) => {
	vi.stubGlobal(
		"matchMedia",
		vi.fn().mockImplementation((query: string) => ({
			matches: matches && query.includes("prefers-reduced-motion"),
			media: query,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	);
};

// src/test/setup.ts 가 스위트 전체에 skipAnimation: true 를 걸어 두므로, 첫 프레임 값을
// 보려면 이 describe 안에서만 끈다. 켜진 상태에서는 어떤 스프링이든 목표값에서 시작한다.
describe("useSpringPresence enter frame", () => {
	beforeEach(() => Globals.assign({ skipAnimation: false }));
	afterEach(() => {
		Globals.assign({ skipAnimation: true });
		vi.unstubAllGlobals();
	});

	it("starts away from the target when mounted already visible", () => {
		// Toast 는 useState(true) 로 마운트한다 - `from` 이 없으면 첫 렌더의 to 가 초기값이 되어
		// 등장 모션이 사라진다.
		stubReducedMotion(false);
		render(<Probe visible />);

		const probe = screen.getByTestId("probe");
		expect(probe.style.opacity).toBe("0");
		expect(probe.style.transform).toBe("translateX(20px)");
	});

	it("starts at the target under reduced motion (no one-frame flash)", () => {
		// 반대로 reduced-motion 에서 `from` 을 주면 그 값이 한 프레임 커밋된 뒤 immediate 가
		// 점프해 모션 대신 깜빡임이 남는다. from 을 생략해 보간 구간 자체를 없앤다.
		stubReducedMotion(true);
		render(<Probe visible />);

		const probe = screen.getByTestId("probe");
		expect(probe.style.opacity).toBe("1");
		expect(probe.style.transform).toBe("translateY(0px)");
	});
});
