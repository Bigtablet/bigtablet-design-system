import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar } from "./index";

describe("Avatar", () => {
	it("renders image when src provided", () => {
		const { container } = render(<Avatar src="/me.jpg" name="박상민" />);
		const img = container.querySelector("img");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("alt", "박상민");
	});

	it("renders initials when no src", () => {
		const { container } = render(<Avatar name="박상민" />);
		expect(container.querySelector(".avatar_initials")).toHaveTextContent("박");
	});

	it("extracts initials from multi-word name (first + last)", () => {
		const { container } = render(<Avatar name="Sangmin Park" />);
		expect(container.querySelector(".avatar_initials")).toHaveTextContent("SP");
	});

	it("applies size class", () => {
		const { container } = render(<Avatar name="P" size="lg" />);
		expect(container.firstChild).toHaveClass("avatar_size_lg");
	});

	it("applies shape class", () => {
		const { container } = render(<Avatar name="P" shape="square" />);
		expect(container.firstChild).toHaveClass("avatar_shape_square");
	});

	it("uses custom bgColor when no image", () => {
		const { container } = render(<Avatar name="P" bgColor="#7AA5D2" />);
		expect(container.firstChild).toHaveStyle({ background: "#7AA5D2" });
	});
	it("shows the image again when a new src replaces a broken one", () => {
		// 실패 여부를 boolean 으로 들고 있으면 한 번 깨진 뒤 사진을 새로 올려도 계속 이니셜만
		// 나온다. 목록에서 같은 자리를 재사용하는 행도 앞 행의 실패 상태를 물려받는다.
		const { rerender, container } = render(<Avatar src="/broken.png" name="박상민" />);
		const img = container.querySelector("img") as HTMLImageElement;
		fireEvent.error(img);
		expect(container.querySelector("img")).toBeNull();

		rerender(<Avatar src="/fresh.png" name="박상민" />);
		expect(container.querySelector("img")).toHaveAttribute("src", "/fresh.png");
	});
});