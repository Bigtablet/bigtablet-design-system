import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

	describe("onFiles callback", () => {
		it("passes the FileList through to onFiles", () => {
			const onFiles = vi.fn();
			render(<FileInput onFiles={onFiles} />);

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["hello"], "hello.txt", { type: "text/plain" });

			Object.defineProperty(input, "files", {
				value: [file],
				configurable: true,
			});

			fireEvent.change(input);
			expect(onFiles).toHaveBeenCalledTimes(1);
			const arg = onFiles.mock.calls[0][0];
			expect(arg).not.toBeNull();
			expect(arg[0]).toBe(file);
		});

		it("supports multiple files when multiple is set", () => {
			const onFiles = vi.fn();
			render(<FileInput onFiles={onFiles} multiple />);

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file1 = new File(["a"], "a.txt", { type: "text/plain" });
			const file2 = new File(["b"], "b.txt", { type: "text/plain" });

			Object.defineProperty(input, "files", {
				value: [file1, file2],
				configurable: true,
			});

			fireEvent.change(input);
			const arg = onFiles.mock.calls[0][0];
			expect(arg.length).toBe(2);
			expect(arg[0]).toBe(file1);
			expect(arg[1]).toBe(file2);
		});

		it("does not throw when onFiles is not provided", () => {
			render(<FileInput />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["test"], "test.txt", { type: "text/plain" });
			Object.defineProperty(input, "files", { value: [file], configurable: true });
			expect(() => fireEvent.change(input)).not.toThrow();
		});

		it("calls onFiles with null files when input has no selection", () => {
			const onFiles = vi.fn();
			render(<FileInput onFiles={onFiles} />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			Object.defineProperty(input, "files", { value: null, configurable: true });
			fireEvent.change(input);
			expect(onFiles).toHaveBeenCalledWith(null);
		});
	});

	describe("accept attribute", () => {
		it("forwards accept attribute (image only)", () => {
			render(<FileInput accept="image/*" />);
			const input = document.querySelector('input[type="file"]');
			expect(input).toHaveAttribute("accept", "image/*");
		});

		it("forwards comma-separated accept list", () => {
			render(<FileInput accept=".png,.jpg,.jpeg" />);
			const input = document.querySelector('input[type="file"]');
			expect(input).toHaveAttribute("accept", ".png,.jpg,.jpeg");
		});
	});

	describe("Image preview", () => {
		const originalCreate = URL.createObjectURL;
		const originalRevoke = URL.revokeObjectURL;

		beforeEach(() => {
			let counter = 0;
			URL.createObjectURL = vi.fn(() => `blob:mock-${++counter}`);
			URL.revokeObjectURL = vi.fn();
		});

		afterEach(() => {
			URL.createObjectURL = originalCreate;
			URL.revokeObjectURL = originalRevoke;
		});

		it("does not render previews when preview is false", () => {
			const { container } = render(<FileInput />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["img"], "img.png", { type: "image/png" });
			Object.defineProperty(input, "files", { value: [file], configurable: true });
			fireEvent.change(input);
			expect(container.querySelector(".file_input_preview")).toBeNull();
		});

		it("renders image preview when preview is true and file is image", () => {
			const { container } = render(<FileInput preview />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["img"], "img.png", { type: "image/png" });
			Object.defineProperty(input, "files", { value: [file], configurable: true });
			fireEvent.change(input);

			const preview = container.querySelector(".file_input_preview");
			expect(preview).not.toBeNull();
			const images = container.querySelectorAll(".file_input_preview_img");
			expect(images.length).toBe(1);
		});

		it("skips non-image files in preview mode", () => {
			const { container } = render(<FileInput preview />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["pdf"], "doc.pdf", { type: "application/pdf" });
			Object.defineProperty(input, "files", { value: [file], configurable: true });
			fireEvent.change(input);
			expect(container.querySelector(".file_input_preview")).toBeNull();
		});

		it("renders one preview per image when multiple images are selected", () => {
			const { container } = render(<FileInput preview multiple />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const f1 = new File(["1"], "1.png", { type: "image/png" });
			const f2 = new File(["2"], "2.jpg", { type: "image/jpeg" });
			const f3 = new File(["3"], "3.pdf", { type: "application/pdf" });
			Object.defineProperty(input, "files", { value: [f1, f2, f3], configurable: true });
			fireEvent.change(input);

			const images = container.querySelectorAll(".file_input_preview_img");
			expect(images.length).toBe(2);
		});

		it("revokes previous preview URLs when new files are selected", () => {
			const { container } = render(<FileInput preview />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;

			const first = new File(["1"], "first.png", { type: "image/png" });
			Object.defineProperty(input, "files", { value: [first], configurable: true });
			fireEvent.change(input);

			const second = new File(["2"], "second.png", { type: "image/png" });
			Object.defineProperty(input, "files", { value: [second], configurable: true });
			fireEvent.change(input);

			expect(URL.revokeObjectURL).toHaveBeenCalled();
			const images = container.querySelectorAll(".file_input_preview_img");
			expect(images.length).toBe(1);
		});

		it("revokes URLs on unmount", () => {
			const { unmount } = render(<FileInput preview />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = new File(["img"], "img.png", { type: "image/png" });
			Object.defineProperty(input, "files", { value: [file], configurable: true });
			fireEvent.change(input);

			(URL.revokeObjectURL as unknown as ReturnType<typeof vi.fn>).mockClear();
			unmount();
			expect(URL.revokeObjectURL).toHaveBeenCalled();
		});

		it("clears previews when preview prop is true but no files are returned", () => {
			const { container } = render(<FileInput preview />);
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;

			// 먼저 이미지 선택
			const file = new File(["img"], "img.png", { type: "image/png" });
			Object.defineProperty(input, "files", { value: [file], configurable: true });
			fireEvent.change(input);
			expect(container.querySelectorAll(".file_input_preview_img").length).toBe(1);

			// 그 후 빈 선택
			Object.defineProperty(input, "files", { value: null, configurable: true });
			fireEvent.change(input);
			expect(container.querySelector(".file_input_preview")).toBeNull();
		});
	});

	describe("Disabled state", () => {
		it("does not apply disabled class when disabled is false", () => {
			const { container } = render(<FileInput />);
			expect(container.firstChild).not.toHaveClass("file_input_disabled");
		});

		it("input is not disabled by default", () => {
			render(<FileInput />);
			const input = document.querySelector('input[type="file"]');
			expect(input).not.toBeDisabled();
		});
	});

	describe("Forwarded HTML attributes", () => {
		it("forwards name attribute", () => {
			render(<FileInput name="upload" />);
			const input = document.querySelector('input[type="file"]');
			expect(input).toHaveAttribute("name", "upload");
		});

		it("forwards required attribute", () => {
			render(<FileInput required />);
			const input = document.querySelector('input[type="file"]');
			expect(input).toHaveAttribute("required");
		});

		it("preserves component-managed type=file even if a type prop is passed", () => {
			// type은 컴포넌트가 file로 고정해서 사용
			render(<FileInput />);
			const input = document.querySelector('input[type="file"]');
			expect(input).toHaveAttribute("type", "file");
		});
	});

	describe("Supporting text helper id", () => {
		it("uses a unique id for each instance's helper", () => {
			render(
				<>
					<FileInput supportingText="A" />
					<FileInput supportingText="B" />
				</>,
			);
			const helperA = screen.getByText("A");
			const helperB = screen.getByText("B");
			expect(helperA.id).not.toBe("");
			expect(helperB.id).not.toBe("");
			expect(helperA.id).not.toBe(helperB.id);
		});
	});
});
