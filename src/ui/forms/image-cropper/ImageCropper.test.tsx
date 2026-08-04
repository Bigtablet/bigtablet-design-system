import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { ImageCropper } from "./index";

/**
 * 휠 줌은 기본 스크롤을 막아야 한다 — React 의 `onWheel` 은 루트에 `passive: true` 로 위임되므로
 * 그 안의 `preventDefault()` 가 무시되고("Unable to preventDefault inside passive event listener
 * invocation") 확대하는 동안 뒤 페이지가 함께 스크롤됐다. 네이티브 `passive: false` 등록으로 고쳤다.
 */

beforeAll(() => {
	URL.createObjectURL = () => "blob:preview";
	URL.revokeObjectURL = () => {};
});

const file = () => new File(["x"], "photo.png", { type: "image/png" });

/** jsdom 은 natural 크기를 0 으로 주므로 심어 준 뒤 load 를 발생시킨다. */
const loadImage = (width = 800, height = 600) => {
	const image = document.querySelector(".image_cropper_image") as HTMLImageElement;
	Object.defineProperty(image, "naturalWidth", { value: width, configurable: true });
	Object.defineProperty(image, "naturalHeight", { value: height, configurable: true });
	fireEvent.load(image);
};

/** 휠을 굴린다. `fireEvent` 는 이벤트가 취소되지 않았을 때만 true 를 돌려준다. */
const wheelOverViewport = () => fireEvent.wheel(screen.getByRole("group"), { deltaY: -120 });

describe("ImageCropper wheel zoom", () => {
	it("preventDefault 가 먹는 리스너로 휠을 받는다", () => {
		render(<ImageCropper src={file()} />);
		loadImage();

		// passive 리스너였다면 preventDefault 가 무시돼 이벤트가 취소되지 않는다(= true).
		expect(wheelOverViewport()).toBe(false);
	});

	it("휠로 배율이 올라간다", () => {
		render(<ImageCropper src={file()} />);
		loadImage();

		const zoomSlider = screen.getByLabelText("배율") as HTMLInputElement;
		const before = Number(zoomSlider.value);

		wheelOverViewport();

		expect(Number(zoomSlider.value)).toBeGreaterThan(before);
	});

	it("이미지가 로드되기 전 휠은 아무것도 하지 않는다", () => {
		render(<ImageCropper src={file()} />);

		// 리스너 자체가 붙지 않으므로 기본 스크롤을 막지 않는다.
		expect(wheelOverViewport()).toBe(true);
	});
});

describe("ImageCropper labels", () => {
	it("기본 문구는 한국어다", () => {
		render(<ImageCropper src={file()} />);

		expect(screen.getByRole("group", { name: "이미지 위치와 배율 조정" })).toBeInTheDocument();
		expect(screen.getByLabelText("확대")).toBeInTheDocument();
	});

	it("모든 문구를 소비자 로케일로 갈아 끼울 수 있다", () => {
		// 다국어 앱에서 한국어가 그대로 낭독되던 자리들 — 전부 prop 으로 열려 있어야 한다.
		render(
			<ImageCropper
				src={file()}
				label="Adjust image position and zoom"
				hint="Drag to move, scroll to zoom."
				zoomOutLabel="Zoom out"
				zoomLabel="Zoom"
				zoomInLabel="Zoom in"
			/>,
		);

		expect(
			screen.getByRole("group", { name: "Adjust image position and zoom" }),
		).toBeInTheDocument();
		expect(screen.getByText("Drag to move, scroll to zoom.")).toBeInTheDocument();
		expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
		expect(screen.getByLabelText("Zoom")).toBeInTheDocument();
		expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
	});

	it("이동 여유가 없다는 안내도 갈아 끼울 수 있다", () => {
		render(<ImageCropper src={file()} noPanHint="No room to pan." />);
		// 정사각 원본은 뷰포트를 꽉 채워 이동 여유가 없다.
		loadImage(400, 400);

		expect(screen.getByText("No room to pan.")).toBeInTheDocument();
	});
});
