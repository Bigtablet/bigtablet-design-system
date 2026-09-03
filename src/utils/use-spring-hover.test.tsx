import { animated } from "@react-spring/web";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSpringHover } from "./use-spring-hover";

const Probe = (options?: { scale?: number; lift?: number }) => {
	const { style, bind } = useSpringHover(options);
	// biome-ignore lint/a11y/useSemanticElements: 훅의 bind 를 그대로 붙여 검사하는 프로브다
	return <animated.div data-testid="target" role="button" tabIndex={0} style={style} {...bind} />;
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

describe("useSpringHover", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("rests at the neutral transform", () => {
		stubReducedMotion(false);
		render(<Probe />);

		expect(screen.getByTestId("target")).toHaveStyle({
			transform: "translateY(0px) scale(1)",
		});
	});

	it("lifts on hover and settles back on leave", async () => {
		stubReducedMotion(false);
		render(<Probe />);
		const target = screen.getByTestId("target");

		fireEvent.mouseEnter(target);
		await waitFor(() => expect(target).toHaveStyle({ transform: "translateY(-2px) scale(1.02)" }));

		fireEvent.mouseLeave(target);
		await waitFor(() => expect(target).toHaveStyle({ transform: "translateY(0px) scale(1)" }));
	});

	it("lifts on focus too - keyboard users get the same emphasis", async () => {
		stubReducedMotion(false);
		render(<Probe />);
		const target = screen.getByTestId("target");

		fireEvent.focus(target);
		await waitFor(() => expect(target).toHaveStyle({ transform: "translateY(-2px) scale(1.02)" }));

		fireEvent.blur(target);
		await waitFor(() => expect(target).toHaveStyle({ transform: "translateY(0px) scale(1)" }));
	});

	it("honours the scale and lift options", async () => {
		stubReducedMotion(false);
		render(<Probe scale={1.1} lift={-8} />);
		const target = screen.getByTestId("target");

		fireEvent.mouseEnter(target);
		await waitFor(() => expect(target).toHaveStyle({ transform: "translateY(-8px) scale(1.1)" }));
	});

	it("jumps to the hovered transform without motion under reduced motion", async () => {
		// WCAG 2.3.3 - 모션은 없애지만 강조 자체는 남긴다(`immediate: true`).
		stubReducedMotion(true);
		render(<Probe />);
		const target = screen.getByTestId("target");

		fireEvent.mouseEnter(target);

		// `immediate` 는 보간을 없애지 최종 상태를 없애지 않는다 - 강조는 남고 움직임만 사라진다.
		// (커밋 자체는 리렌더 뒤라 한 틱이 필요하다.)
		await waitFor(() => expect(target).toHaveStyle({ transform: "translateY(-2px) scale(1.02)" }));
	});
});
