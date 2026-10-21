import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
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

/**
 * ImageCropperProps 가 Omit<HTMLAttributes<HTMLDivElement>, "onError" | "children" |
 * "dangerouslySetInnerHTML"> 를 확장해 소비자의 표준 div 속성을 루트로 전달하되,
 * 내부 className·공개 onError(이미지) 는 보존하는지 검증.
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

/**
 * 탭으로 위치 이동 - 드래그를 못 하는 사용자의 단일 포인터 대안(WCAG 2.5.7).
 * 800x600 이미지가 240 뷰포트를 덮으면 320x240 이라 가로로만 ±40px 움직일 수 있다.
 */
describe("ImageCropper tap to center", () => {
	beforeAll(() => {
		Element.prototype.setPointerCapture ??= () => {};
	});

	const setup = () => {
		render(<ImageCropper src={file()} />);
		loadImage();
		const viewport = screen.getByRole("group");
		viewport.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 240, height: 240 }) as DOMRect;
		return viewport;
	};
	const offsetX = () => {
		const image = document.querySelector(".image_cropper_image") as HTMLElement;
		return Number(/calc\(-50% \+ (-?[\d.]+)px\)/.exec(image.style.transform)?.[1]);
	};
	const press = (viewport: HTMLElement, from: number, to = from, end = "pointerUp") => {
		fireEvent.pointerDown(viewport, { pointerId: 1, clientX: from, clientY: 120 });
		if (to !== from) fireEvent.pointerMove(viewport, { pointerId: 1, clientX: to, clientY: 120 });
		fireEvent[end as "pointerUp"](viewport, { pointerId: 1, clientX: to, clientY: 120 });
	};

	it("moves the tapped point toward the center", () => {
		const viewport = setup();
		// 가운데(120)보다 20px 왼쪽을 탭 → 이미지가 오른쪽으로 20px
		press(viewport, 100);
		expect(offsetX()).toBe(20);
	});

	it("clamps so the image still covers the viewport", () => {
		const viewport = setup();
		press(viewport, 0);
		expect(offsetX()).toBe(40);
	});

	it("ignores tiny jitter within the tap slop", () => {
		const viewport = setup();
		// 3px 흔들림은 여전히 탭 - 결과는 누른 지점 기준
		press(viewport, 100, 103);
		expect(offsetX()).toBe(20);
	});

	it("does not recenter after a real drag", () => {
		const viewport = setup();
		press(viewport, 100, 130);
		// 드래그만큼(30, 한계 40 안)만 움직이고 놓을 때 추가 이동이 없다
		expect(offsetX()).toBe(30);
	});

	it("does not recenter on pointercancel", () => {
		const viewport = setup();
		press(viewport, 100, 100, "pointerCancel");
		expect(offsetX()).toBe(0);
	});
});
