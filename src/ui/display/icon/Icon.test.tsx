import { render } from "@testing-library/react";
import { Search } from "lucide-react";
import { describe, expect, it } from "vitest";
import { Icon } from "./index";

describe("Icon", () => {
	it("hides itself from screen readers when it has no label", () => {
		// 라벨 없는 아이콘은 장식이다 - 노출하면 스크린리더가 의미 없는 그래픽을 읽는다.
		const { container } = render(<Icon icon={Search} />);
		const svg = container.querySelector("svg");

		expect(svg).toHaveAttribute("aria-hidden", "true");
		expect(svg).toHaveAttribute("focusable", "false");
	});

	it("stays exposed when it carries a label", () => {
		// 라벨이 있으면 그 아이콘이 의미를 지닌다 - 숨기면 그 의미가 사라진다.
		const { container } = render(<Icon icon={Search} aria-label="검색" />);
		const svg = container.querySelector("svg");

		expect(svg).toHaveAttribute("aria-label", "검색");
		expect(svg).not.toHaveAttribute("aria-hidden");
		expect(svg).not.toHaveAttribute("focusable");
	});

	it("passes lucide props through", () => {
		const { container } = render(<Icon icon={Search} size={20} strokeWidth={2.5} />);
		const svg = container.querySelector("svg");

		expect(svg).toHaveAttribute("width", "20");
		expect(svg).toHaveAttribute("stroke-width", "2.5");
	});

	it("lets an explicit aria-hidden win over the automatic one", () => {
		// 라벨을 주면서도 숨기려는 소비자가 있다 - 스프레드가 자동값 뒤에 오는지 확인한다.
		const { container } = render(<Icon icon={Search} aria-label="검색" aria-hidden={true} />);

		expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
	});
});
