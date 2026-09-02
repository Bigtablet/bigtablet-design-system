import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DescriptionList } from "./index";

const ITEMS = [
	{ label: "주문번호", value: "#1024" },
	{ label: "결제수단", value: "신용카드" },
];

describe("DescriptionList", () => {
	it("pairs each label with its value in a definition list", () => {
		// <div> 두 개로 만들면 스크린리더에 이름과 값의 관계가 남지 않는다.
		const { container } = render(<DescriptionList items={ITEMS} />);

		const dl = container.querySelector("dl");
		expect(dl).not.toBeNull();
		expect(dl?.querySelectorAll("dt")).toHaveLength(2);
		expect(dl?.querySelectorAll("dd")).toHaveLength(2);
		expect(screen.getByText("주문번호").tagName).toBe("DT");
		expect(screen.getByText("#1024").tagName).toBe("DD");
	});

	it("keeps the layout class off the item wrapper", () => {
		// 항목 래퍼와 레이아웃 modifier 가 같은 클래스명을 쓰면 서로의 규칙을 덮는다.
		const { container } = render(<DescriptionList items={ITEMS} layout="row" />);

		expect(container.firstElementChild).toHaveClass("description_list_layout_row");
		expect(container.querySelectorAll(".description_list_item")).toHaveLength(2);
		expect(container.querySelector(".description_list_item")).not.toHaveClass(
			"description_list_layout_row",
		);
	});

	it("marks a full-width item", () => {
		const { container } = render(
			<DescriptionList items={[...ITEMS, { label: "배송지", value: "서울시 …", full: true }]} />,
		);

		const items = container.querySelectorAll(".description_list_item");
		expect(items[2]).toHaveClass("description_list_item_full");
		expect(items[0]).not.toHaveClass("description_list_item_full");
	});

	it("renders repeated labels rather than collapsing them", () => {
		// 같은 이름의 항목이 둘 있을 수 있다 (전화번호 2개 등) - 라벨을 키로 쓰면 하나가 사라진다.
		const { container } = render(
			<DescriptionList
				items={[
					{ label: "전화번호", value: "010-1111-2222" },
					{ label: "전화번호", value: "010-3333-4444" },
				]}
			/>,
		);

		expect(container.querySelectorAll("dt")).toHaveLength(2);
		expect(screen.getByText("010-3333-4444")).toBeInTheDocument();
	});

	it("opts into dividers", () => {
		const { container, rerender } = render(<DescriptionList items={ITEMS} />);
		expect(container.firstElementChild).not.toHaveClass("description_list_divided");

		rerender(<DescriptionList items={ITEMS} divided />);
		expect(container.firstElementChild).toHaveClass("description_list_divided");
	});

	it("hands the root element to a ref", () => {
		const ref = { current: null as HTMLDListElement | null };
		render(<DescriptionList items={ITEMS} ref={ref} />);

		expect(ref.current?.tagName).toBe("DL");
	});
});
