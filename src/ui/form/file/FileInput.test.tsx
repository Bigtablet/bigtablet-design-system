import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileInput } from "./index";

describe("FileInput", () => {
	it("renders with default label", () => {
		render(<FileInput />);
		expect(screen.getByText("Choose file")).toBeInTheDocument();
	});

	it("renders with custom label", () => {
		render(<FileInput label="Upload file" />);
		expect(screen.getByText("Upload file")).toBeInTheDocument();
	});

	it("renders file input", () => {
		render(<FileInput />);
		const input = document.querySelector('input[type="file"]');
		expect(input).toBeInTheDocument();
	});

	it("associates label with input", () => {
		render(<FileInput />);
		const input = document.querySelector('input[type="file"]') as HTMLInputElement;
		const label = screen.getByText("Choose file");

		expect(label).toHaveAttribute("for", input.id);
	});

	it("calls onFiles when file is selected", () => {
		const onFiles = vi.fn();
		render(<FileInput onFiles={onFiles} />);

		const input = document.querySelector('input[type="file"]') as HTMLInputElement;
		const file = new File(["test"], "test.txt", { type: "text/plain" });

		Object.defineProperty(input, "files", {
			value: [file],
		});

		fireEvent.change(input);
		expect(onFiles).toHaveBeenCalled();
	});

	it("is disabled when disabled prop is true", () => {
		render(<FileInput disabled />);
		const input = document.querySelector('input[type="file"]');
		expect(input).toBeDisabled();
	});

	it("applies disabled class when disabled", () => {
		const { container } = render(<FileInput disabled />);
		expect(container.firstChild).toHaveClass("file_input_disabled");
	});

	it("applies custom className", () => {
		const { container } = render(<FileInput className="custom-file" />);
		expect(container.firstChild).toHaveClass("custom-file");
	});

	it("passes through HTML attributes", () => {
		render(<FileInput accept=".pdf,.doc" multiple />);
		const input = document.querySelector('input[type="file"]');

		expect(input).toHaveAttribute("accept", ".pdf,.doc");
		expect(input).toHaveAttribute("multiple");
	});

	it("has file_input class on root", () => {
		const { container } = render(<FileInput />);
		expect(container.firstChild).toHaveClass("file_input");
	});

	it("has file_input_control class on input", () => {
		render(<FileInput />);
		const input = document.querySelector('input[type="file"]');
		expect(input).toHaveClass("file_input_control");
	});

	it("has file_input_label class on label", () => {
		render(<FileInput />);
		const label = screen.getByText("Choose file");
		expect(label).toHaveClass("file_input_label");
	});

	it("renders supportingText when provided", () => {
		render(<FileInput supportingText="PDF, DOC 파일만 업로드 가능합니다" />);
		expect(screen.getByText("PDF, DOC 파일만 업로드 가능합니다")).toBeInTheDocument();
	});

	it("links input to supportingText via aria-describedby", () => {
		render(<FileInput supportingText="PDF only" />);
		const input = document.querySelector('input[type="file"]') as HTMLInputElement;
		const helper = screen.getByText("PDF only");
		expect(input).toHaveAttribute("aria-describedby", helper.id);
	});

	it("does not set aria-describedby when supportingText is not provided", () => {
		render(<FileInput />);
		const input = document.querySelector('input[type="file"]');
		expect(input).not.toHaveAttribute("aria-describedby");
	});
});
