import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ImageCropper } from "./index";

/**
 * ImageCropperProps 가 Omit<HTMLAttributes<HTMLDivElement>, "onError" | "children"> 를 확장해
 * 소비자의 표준 div 속성을 루트로 전달하되, 내부 className·공개 onError(이미지) 는 보존하는지 검증.
 */
describe("ImageCropper native attribute forwarding", () => {
	it("forwards id/data-*/aria-* to the root while keeping the base class", () => {
		const { container } = render(
			<ImageCropper
				src="data:image/png;base64,"
				id="avatar-cropper"
				data-testid="cropper-root"
				aria-hidden="true"
				className="custom"
			/>,
		);
		const root = container.querySelector(".image_cropper");
		expect(root).not.toBeNull();
		expect(root).toHaveAttribute("id", "avatar-cropper");
		expect(root).toHaveAttribute("data-testid", "cropper-root");
		expect(root).toHaveAttribute("aria-hidden", "true");
		// 소비자 className 은 합쳐지되 기반 클래스는 유지
		expect(root).toHaveClass("image_cropper", "custom");
	});

	it("wires onError to the image element's error event, not a div handler", () => {
		const onError = vi.fn();
		const { container } = render(<ImageCropper src="data:image/png;base64," onError={onError} />);
		const img = container.querySelector(".image_cropper_image");
		expect(img).not.toBeNull();
		// 이미지 디코드 실패 시에만 불려야 한다 — 렌더만으로는 호출되지 않음.
		expect(onError).not.toHaveBeenCalled();
		fireEvent.error(img as HTMLImageElement);
		expect(onError).toHaveBeenCalledTimes(1);
	});
});
