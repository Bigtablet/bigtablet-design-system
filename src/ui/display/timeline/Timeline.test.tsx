import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, type TimelineItem } from "./index";

const ITEMS: TimelineItem[] = [
	{ id: 1, title: "주문 접수", time: "오후 1:32", status: "done" },
	{ id: 2, title: "배송 출발", time: "오후 1:48", status: "active", description: "이동 중" },
	{ id: 3, title: "배송 완료", time: "예상 오후 2:05" },
];

describe("Timeline", () => {
	it("renders an ordered list so the sequence survives", () => {
		// <div> 로 만들면 "3개 중 2번째" 라는 순서 정보가 스크린리더에 남지 않는다.
		const { container } = render(<Timeline items={ITEMS} />);

		expect(container.querySelector("ol")).not.toBeNull();
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
	});

	it("defaults a status-less item to pending", () => {
		const { container } = render(<Timeline items={ITEMS} />);

		const items = container.querySelectorAll(".timeline_item");
		expect(items[0]).toHaveClass("timeline_item_done");
		expect(items[1]).toHaveClass("timeline_item_active");
		expect(items[2]).toHaveClass("timeline_item_pending");
	});

	it("tells the statuses apart by shape, not only by colour", () => {
		// 배경색만 다르면 색을 구분하지 못하는 사용자에게 done 과 active 가 같아 보인다
		// (WCAG 1.4.1). 아이콘을 주지 않은 경우가 그 상태였다.
		const { container } = render(
			<Timeline
				items={[
					{ id: 1, title: "done", status: "done" },
					{ id: 2, title: "active", status: "active" },
					{ id: 3, title: "pending" },
				]}
			/>,
		);

		const indicators = container.querySelectorAll(".timeline_indicator");
		// done - 체크 글리프
		expect(indicators[0].querySelector(".timeline_glyph")).not.toBeNull();
		// active - 꽉 찬 점
		expect(indicators[1].querySelector(".timeline_dot")).not.toBeNull();
		expect(indicators[1].querySelector(".timeline_dot")).not.toHaveClass("timeline_dot_hollow");
		// pending - 빈 원
		expect(indicators[2].querySelector(".timeline_dot")).toHaveClass("timeline_dot_hollow");
	});

	it("falls back to a dot when an item has no icon", () => {
		const { container } = render(
			<Timeline
				items={[
					{ id: 1, title: "A" },
					{ id: 2, title: "B", icon: <span>★</span> },
				]}
			/>,
		);

		const indicators = container.querySelectorAll(".timeline_indicator");
		expect(indicators[0].querySelector(".timeline_dot")).not.toBeNull();
		expect(indicators[1].querySelector(".timeline_dot")).toBeNull();
		expect(indicators[1]).toHaveTextContent("★");
	});

	it("keeps the indicator out of the accessibility tree", () => {
		// 점과 연결선은 장식이다 - 읽히면 항목마다 의미 없는 소리가 하나씩 늘어난다.
		const { container } = render(<Timeline items={ITEMS} />);

		for (const el of container.querySelectorAll(".timeline_indicator")) {
			expect(el).toHaveAttribute("aria-hidden", "true");
		}
	});

	it("omits time and description when they are absent", () => {
		const { container } = render(<Timeline items={[{ id: 1, title: "A" }]} />);

		expect(container.querySelector(".timeline_time")).toBeNull();
		expect(container.querySelector(".timeline_description")).toBeNull();
	});

	it("renders extra content under an item", () => {
		render(
			<Timeline items={[{ id: 1, title: "A", children: <button type="button">영수증</button> }]} />,
		);

		expect(screen.getByRole("button", { name: "영수증" })).toBeInTheDocument();
	});

	it("hands the root element to a ref", () => {
		const ref = { current: null as HTMLOListElement | null };
		render(<Timeline items={ITEMS} ref={ref} />);

		expect(ref.current?.tagName).toBe("OL");
	});
});
