import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./index";

// react-spring 은 setup.ts 에서 skipAnimation 이지만 퇴장 언마운트(onExitComplete)는 한 tick 늦게
// 스케줄되므로, 열림/닫힘은 fake timer 동기 단언 대신 real timer + waitFor 로 검증한다 (Popover 패턴).

describe("Tooltip", () => {
	it("does not show tooltip initially", () => {
		render(
			<Tooltip content="hint">
				<button type="button">btn</button>
			</Tooltip>,
		);
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("shows tooltip after delay on mouseEnter", async () => {
		render(
			<Tooltip content="hint" delay={50}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		// delay 전에는 아직 안 보인다.
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("hint"));
	});

	it("hides on mouseLeave (after the hoverable grace period)", async () => {
		render(
			<Tooltip content="hint" delay={0}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

		fireEvent.mouseLeave(screen.getByRole("button"));
		// WCAG 1.4.13 Hoverable - 포인터가 툴팁으로 건너갈 유예(120ms) 동안은 유지
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();
		await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
	});

	it("stays open while the pointer is over the tooltip itself (WCAG 1.4.13 Hoverable)", async () => {
		render(
			<Tooltip content="hint" delay={0}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

		fireEvent.mouseLeave(screen.getByRole("button"));
		// 유예 시간 안에 툴팁 위로 포인터 이동 → 닫힘 타이머 취소, 열림 유지
		const positionWrap = screen.getByRole("tooltip").parentElement as HTMLElement;
		fireEvent.mouseEnter(positionWrap);
		expect(screen.queryByRole("tooltip")).toBeInTheDocument();

		// 툴팁에서 떠나면 유예 후 닫힘
		fireEvent.mouseLeave(positionWrap);
		await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
	});

	it("dismisses with Escape without moving the pointer (WCAG 1.4.13 Dismissable)", async () => {
		render(
			<Tooltip content="hint" delay={0}>
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

		fireEvent.keyDown(document.body, { key: "Escape" });
		await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
	});

	it("disabled=true: never shows tooltip", () => {
		render(
			<Tooltip content="hint" disabled>
				<button type="button">btn</button>
			</Tooltip>,
		);
		// disabled 는 children 만 렌더 - Tooltip 로직 자체가 없어 hover 해도 마운트되지 않는다.
		fireEvent.mouseEnter(screen.getByRole("button"));
		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
	});

	it("portals the tooltip to the body and positions it fixed", async () => {
		// placement 는 이제 CSS 클래스가 아니라 useAnchoredPosition 이 계산한 fixed 좌표로 적용된다.
		const { container } = render(
			<Tooltip content="hint" delay={0} placement="bottom">
				<button type="button">btn</button>
			</Tooltip>,
		);
		fireEvent.mouseEnter(screen.getByRole("button"));
		await waitFor(() => expect(screen.getByRole("tooltip")).toBeInTheDocument());

		const tip = screen.getByRole("tooltip");
		// 포탈 - 트리거 wrapper 밖(body)으로 렌더된다.
		expect(container.querySelector(".tooltip_wrapper")?.contains(tip)).toBe(false);
		// 위치 컨테이너는 fixed 로 배치된다.
		const position = tip.closest(".tooltip_position") as HTMLElement;
		expect(position.style.position).toBe("fixed");
	});
});
