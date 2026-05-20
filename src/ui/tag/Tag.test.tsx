import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tag } from "./index";

describe("Tag", () => {
	it("renders label", () => {
		render(<Tag>Frontend</Tag>);
		expect(screen.getByText("Frontend")).toBeInTheDocument();
	});

	it("applies variant class", () => {
		const { container } = render(<Tag variant="success">OK</Tag>);
		expect(container.firstChild).toHaveClass("tag_variant_success");
	});

	it("renders remove button when onRemove provided", () => {
		render(<Tag onRemove={() => {}}>Removable</Tag>);
		expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
	});

	it("calls onRemove when X clicked", () => {
		const onRemove = vi.fn();
		render(<Tag onRemove={onRemove}>X</Tag>);
		fireEvent.click(screen.getByRole("button", { name: "Remove" }));
		expect(onRemove).toHaveBeenCalled();
	});

	it("does not render remove button without onRemove", () => {
		render(<Tag>Static</Tag>);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
