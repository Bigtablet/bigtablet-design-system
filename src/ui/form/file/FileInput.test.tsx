import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileInput } from "./index";

describe("FileInput", () => {
    it("renders with default label", () => {
        render(<FileInput />);
        expect(screen.getByText("파일 선택")).toBeInTheDocument();
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
        const label = screen.getByText("파일 선택");

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
        const label = screen.getByText("파일 선택");
        expect(label).toHaveClass("file_input_label");
    });
});
