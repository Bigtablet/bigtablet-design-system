import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FileInput } from "./index";
import "./style.scss";

// 놓은 파일을 input 에도 옮긴다 - 그래야 네이티브 폼 제출에 실린다 (#986)
describe("FileInput drop (Chromium)", () => {
	it("puts a dropped image into the input's files", () => {
		const { container } = render(<FileInput variant="preview" label="사진" name="photo" />);
		const transfer = new DataTransfer();
		transfer.items.add(new File(["x"], "a.png", { type: "image/png" }));
		// 실제 DragEvent 로 쏜다 - dataTransfer 가 진짜 FileList 를 들고 온다
		(container.querySelector(".file_input_label") as HTMLElement).dispatchEvent(
			new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
		);
		const input = container.querySelector("input[type=file]") as HTMLInputElement;
		expect(input.files?.[0]?.name).toBe("a.png");
	});

	it("passes only the first file through change once when several are dropped", () => {
		const onFiles = vi.fn();
		const onChange = vi.fn();
		const { container } = render(
			<FileInput variant="preview" label="사진" onFiles={onFiles} onChange={onChange} />,
		);
		const transfer = new DataTransfer();
		transfer.items.add(new File(["x"], "a.png", { type: "image/png" }));
		transfer.items.add(new File(["y"], "b.png", { type: "image/png" }));
		(container.querySelector(".file_input_label") as HTMLElement).dispatchEvent(
			new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer }),
		);
		expect(onFiles).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledTimes(1);
		expect((onFiles.mock.calls[0]?.[0] as FileList).length).toBe(1);
	});
});
