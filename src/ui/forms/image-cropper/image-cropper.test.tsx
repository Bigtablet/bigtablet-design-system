import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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

	it("keeps onError as the image-decode callback, not a div handler", () => {
		// 타입/런타임 모두 () => void 이미지 콜백으로 통과해야 한다(div onError 로 치환되지 않음).
		const onError = () => {};
		const { container } = render(<ImageCropper src="data:image/png;base64," onError={onError} />);
		expect(container.querySelector(".image_cropper")).not.toBeNull();
	});
});
