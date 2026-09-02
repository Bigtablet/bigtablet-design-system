"use client";

import {
	type CSSProperties,
	type HTMLAttributes,
	type KeyboardEvent,
	type PointerEvent,
	type Ref,
	type SyntheticEvent,
	useCallback,
	useEffect,
	useId,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { cn } from "../../../utils";
import { useFieldControl } from "../field";
import {
	type CropImageSize,
	type CropOffset,
	clampCropOffset,
	getCoverScale,
	getCropRect,
	getOffsetLimits,
} from "./crop.util";
import "./style.scss";

export type { CropImageSize, CropOffset, CropRect } from "./crop.util";

/** 크롭 배율 슬라이더 눈금 — 연속값이라 화면상 부드럽게 움직이게 둔다. */
const ZOOM_STEP = 0.01;
/** 키보드 방향키 한 번의 위치 이동량(px). */
const PAN_STEP = 8;
/** 키보드 `+`/`-` 한 번의 배율 변화량. */
const ZOOM_KEY_STEP = 0.1;
/** 마우스 휠 한 번의 배율 변화 계수. */
const WHEEL_ZOOM_FACTOR = 0.0015;

export interface ImageCropperHandle {
	/** 현재 보이는 정사각 영역을 잘라 Blob 으로 돌려준다. 소비자의 "적용" 버튼에서 호출. */
	crop: () => Promise<Blob>;
	/** 배율·위치를 초기 상태(전체가 보이는 zoom=min, 중앙)로 되돌린다. */
	reset: () => void;
}

// 소비자가 붙이는 표준 div 속성(id·data-*·aria-*·style 등)을 루트로 전달한다.
// onError 는 이미지 디코드 실패 콜백(공개 API)이라 div 의 onError 와 충돌하지 않게 Omit.
// children·dangerouslySetInnerHTML 은 루트가 항상 자체 JSX 자식(뷰포트/힌트/줌)을 렌더하므로
// 넘어오면 "Can only set one of children or dangerouslySetInnerHTML" 런타임 에러 → 둘 다 Omit.
export interface ImageCropperProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "onError" | "children" | "dangerouslySetInnerHTML"> {
	/** 크롭/리셋을 호출할 imperative 핸들 (React 19 ref-as-prop). */
	ref?: Ref<ImageCropperHandle>;
	/** 크롭할 이미지. `File`/`Blob`(로컬) 또는 이미지 URL 문자열. */
	src: File | Blob | string;
	/** 결과물 한 변 길이(px). 기본 512. */
	outputSize?: number;
	/** 결과 MIME. `"auto"`(기본)는 PNG 는 PNG 로, 나머지는 JPEG 로 통일. */
	outputType?: "auto" | "image/jpeg" | "image/png" | "image/webp";
	/** JPEG/WebP 인코딩 품질(0~1). 기본 0.92. */
	quality?: number;
	/** 원형 가이드(아바타용). 기본 false(둥근 사각형 가이드). */
	circular?: boolean;
	/** 뷰포트 한 변 길이(px). 기본 240. */
	viewportSize?: number;
	/** 최소 배율. 기본 1(이미지가 뷰포트를 딱 덮음). */
	minZoom?: number;
	/** 최대 배율. 기본 3. */
	maxZoom?: number;
	/** 이미지 로드 완료 시. */
	onReady?: (size: CropImageSize) => void;
	/** 이미지 디코딩 실패 시(손상 파일 등). */
	onError?: () => void;
	className?: string;
	/** 뷰포트 접근성 레이블. 기본 "이미지 위치와 배율 조정". */
	label?: string;
	/** 뷰포트 아래 조작 안내 문구. 기본 "드래그(또는 방향키)로 위치, 휠·슬라이더로 배율을 맞추세요." */
	hint?: string;
	/** 축소 버튼 접근성 레이블. 기본 "축소". */
	zoomOutLabel?: string;
	/** 배율 슬라이더 접근성 레이블. 기본 "배율". */
	zoomLabel?: string;
	/** 확대 버튼 접근성 레이블. 기본 "확대". */
	zoomInLabel?: string;
	/** 이동 여유가 없을 때 스크린리더로 알리는 문구. 기본 "이미지가 뷰포트를 딱 채워 이동 여유가 없습니다." */
	noPanHint?: string;
}

const resolveOutputType = (
	srcType: string,
	outputType: NonNullable<ImageCropperProps["outputType"]>,
): string => {
	if (outputType !== "auto") return outputType;
	return srcType === "image/png" ? "image/png" : "image/jpeg";
};

/**
 * 업로드 전에 이미지에서 보일 정사각 영역을 정하는 크로퍼. 뷰포트 안에서 **드래그(또는 방향키)**
 * 로 위치를, **휠·슬라이더·＋/－ 버튼(또는 `+`/`-` 키)** 으로 배율을 맞춘다. 모달은 포함하지
 * 않으므로 소비자가 `Modal` 등으로 감싸고, 적용 버튼에서 `ref.crop()` 을 호출해 Blob 을 받는다.
 *
 * ```tsx
 * const cropperRef = useRef<ImageCropperHandle>(null);
 * <ImageCropper ref={cropperRef} src={file} circular />
 * // 적용:
 * const blob = await cropperRef.current!.crop();
 * ```
 *
 * 원격 URL 을 넘기면 `canvas.drawImage` 가 서버의 CORS(`Access-Control-Allow-Origin`)에
 * 의존한다 — 확실히 자르려면 로컬 `File`/`Blob` 을 권장한다.
 */
export function ImageCropper({
	ref,
	src,
	outputSize = 512,
	outputType = "auto",
	quality = 0.92,
	circular = false,
	viewportSize = 240,
	minZoom = 1,
	maxZoom = 3,
	onReady,
	onError,
	className,
	label = "이미지 위치와 배율 조정",
	hint = "드래그(또는 방향키)로 위치, 휠·슬라이더로 배율을 맞추세요.",
	zoomOutLabel = "축소",
	zoomLabel = "배율",
	zoomInLabel = "확대",
	noPanHint = "이미지가 뷰포트를 딱 채워 이동 여유가 없습니다.",
	...rest
}: ImageCropperProps) {
	const imageRef = useRef<HTMLImageElement>(null);
	// 휠 리스너를 네이티브로 붙일 대상 — 아래 wheel effect 참고.
	const viewportRef = useRef<HTMLDivElement>(null);
	// pointerdown 시점의 좌표/이동량을 담아 두고 move 에서 차이만 더한다.
	const dragRef = useRef<{ pointerId: number; x: number; y: number; offset: CropOffset } | null>(
		null,
	);
	// 한 화면에 크로퍼가 여러 개여도 aria-describedby 가 충돌하지 않도록 인스턴스별 고유 id.
	const hintId = useId();
	// Field 가 감싸면 그 라벨·설명이 뷰포트 그룹의 이름과 설명이 된다.
	const field = useFieldControl();

	// File/Blob 은 objectURL 로, 문자열은 그대로. objectURL 은 언마운트 시 해제한다.
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [srcType, setSrcType] = useState<string>("");
	useEffect(() => {
		if (typeof src === "string") {
			setPreviewUrl(src);
			setSrcType("");
			return;
		}
		const url = URL.createObjectURL(src);
		setPreviewUrl(url);
		setSrcType(src.type);
		return () => URL.revokeObjectURL(url);
	}, [src]);

	const [imageSize, setImageSize] = useState<CropImageSize | null>(null);
	const [zoom, setZoom] = useState(minZoom);
	// 휠 핸들러가 최신 배율을 읽되, 배율이 바뀔 때마다 리스너를 다시 붙이지는 않게 한다.
	// zoom 을 바꾸는 곳(applyZoom·리셋)에서 setZoom 과 함께 즉시 동기화한다 — 렌더 중 대입은
	// (중단된 렌더가 커밋 안 되는 값을 남길 수 있어) 피하고, useEffect(커밋 후)의 한 틱 지연도 없앤다.
	const zoomRef = useRef(zoom);
	const [offset, setOffset] = useState<CropOffset>({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);

	// src(또는 minZoom)가 바뀌면 조작 상태를 리셋한다. imageSize=null 로 되돌리면 새 이미지의
	// onLoad 에서 다시 기록된다.
	// src 는 body 에서 읽지 않지만 새 이미지로 교체될 때 리셋을 걸기 위한 의도적 트리거 의존성이다.
	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional trigger dependency
	useEffect(() => {
		setImageSize(null);
		setZoom(minZoom);
		zoomRef.current = minZoom;
		setOffset({ x: 0, y: 0 });
	}, [src, minZoom]);

	const handleImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
		const size = {
			width: event.currentTarget.naturalWidth,
			height: event.currentTarget.naturalHeight,
		};
		setImageSize(size);
		onReady?.(size);
	};

	const applyZoom = useCallback(
		(next: number) => {
			const clampedZoom = Math.min(maxZoom, Math.max(minZoom, next));
			setZoom(clampedZoom);
			zoomRef.current = clampedZoom;
			if (imageSize) {
				setOffset((prev) => clampCropOffset(prev, imageSize, viewportSize, clampedZoom));
			}
		},
		[imageSize, maxZoom, minZoom, viewportSize],
	);

	const panBy = useCallback(
		(dx: number, dy: number) => {
			if (!imageSize) return;
			setOffset((prev) =>
				clampCropOffset({ x: prev.x + dx, y: prev.y + dy }, imageSize, viewportSize, zoom),
			);
		},
		[imageSize, viewportSize, zoom],
	);

	const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (!imageSize) return;
		event.currentTarget.setPointerCapture(event.pointerId);
		dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, offset };
		setDragging(true);
	};

	const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const drag = dragRef.current;
		if (!drag || !imageSize || drag.pointerId !== event.pointerId) return;
		const moved = {
			x: drag.offset.x + (event.clientX - drag.x),
			y: drag.offset.y + (event.clientY - drag.y),
		};
		setOffset(clampCropOffset(moved, imageSize, viewportSize, zoom));
	};

	// pointer capture 는 pointerup/cancel 에서 브라우저가 자동 해제하므로 추적만 끊는다.
	const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
		if (dragRef.current?.pointerId === event.pointerId) {
			dragRef.current = null;
			setDragging(false);
		}
	};

	// 휠 줌은 React 의 onWheel 이 아니라 네이티브 리스너로 붙인다 — React 는 wheel 을 루트에
	// `passive: true` 로 위임하므로 핸들러 안의 preventDefault 가 무시되고("Unable to
	// preventDefault inside passive event listener invocation") 확대하는 동안 뒤 페이지가 함께
	// 스크롤된다. `passive: false` 로 직접 등록해야 기본 스크롤을 막을 수 있다.
	useEffect(() => {
		const viewport = viewportRef.current;
		if (!viewport || !imageSize) return;

		const handleWheel = (event: globalThis.WheelEvent) => {
			event.preventDefault();
			applyZoom(zoomRef.current - event.deltaY * WHEEL_ZOOM_FACTOR * zoomRef.current);
		};

		viewport.addEventListener("wheel", handleWheel, { passive: false });
		return () => viewport.removeEventListener("wheel", handleWheel);
	}, [imageSize, applyZoom]);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (!imageSize) return;
		switch (event.key) {
			case "ArrowLeft":
				panBy(-PAN_STEP, 0);
				break;
			case "ArrowRight":
				panBy(PAN_STEP, 0);
				break;
			case "ArrowUp":
				panBy(0, -PAN_STEP);
				break;
			case "ArrowDown":
				panBy(0, PAN_STEP);
				break;
			case "+":
			case "=":
				applyZoom(zoom + ZOOM_KEY_STEP);
				break;
			case "-":
			case "_":
				applyZoom(zoom - ZOOM_KEY_STEP);
				break;
			default:
				return;
		}
		event.preventDefault();
	};

	useImperativeHandle(
		ref,
		() => ({
			reset: () => {
				setZoom(minZoom);
				zoomRef.current = minZoom;
				setOffset({ x: 0, y: 0 });
			},
			crop: () =>
				new Promise<Blob>((resolve, reject) => {
					const image = imageRef.current;
					if (!image || !imageSize) {
						reject(new Error("ImageCropper: image not loaded"));
						return;
					}
					const rect = getCropRect(imageSize, viewportSize, zoom, offset);
					const canvas = document.createElement("canvas");
					canvas.width = outputSize;
					canvas.height = outputSize;
					const context = canvas.getContext("2d");
					if (!context) {
						reject(new Error("ImageCropper: 2d context unavailable"));
						return;
					}
					context.drawImage(
						image,
						rect.x,
						rect.y,
						rect.size,
						rect.size,
						0,
						0,
						outputSize,
						outputSize,
					);
					const type = resolveOutputType(srcType, outputType);
					canvas.toBlob(
						(blob) =>
							blob ? resolve(blob) : reject(new Error("ImageCropper: toBlob returned null")),
						type,
						quality,
					);
				}),
		}),
		[imageSize, offset, outputSize, outputType, quality, srcType, viewportSize, zoom, minZoom],
	);

	const scale = imageSize ? getCoverScale(imageSize, viewportSize) * zoom : 1;
	const limits = imageSize ? getOffsetLimits(imageSize, viewportSize, zoom) : { x: 0, y: 0 };
	const canPan = limits.x > 0 || limits.y > 0;

	const viewportStyle: CSSProperties = { width: viewportSize, height: viewportSize };
	const imageStyle: CSSProperties = imageSize
		? {
				width: imageSize.width * scale,
				height: imageSize.height * scale,
				transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
			}
		: { visibility: "hidden" };

	return (
		// className 은 위에서 별도 구조분해되어 rest 에 없으므로 spread 순서와 무관하게 충돌하지 않는다.
		<div {...rest} className={cn("image_cropper", className)}>
			{/* biome-ignore lint/a11y/useSemanticElements: 드래그+방향키 조작 표면이라 role=group + 안내 텍스트로 처리 */}
			<div
				ref={viewportRef}
				className={cn("image_cropper_viewport", dragging && "image_cropper_viewport_dragging")}
				style={viewportStyle}
				role="group"
				aria-labelledby={field?.labelId}
				aria-label={field?.labelId ? undefined : label}
				aria-describedby={[field?.describedBy, hintId].filter(Boolean).join(" ")}
				tabIndex={imageSize ? 0 : -1}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerEnd}
				onPointerCancel={handlePointerEnd}
				onKeyDown={handleKeyDown}
			>
				{/* biome-ignore lint/performance/noImgElement: DS is framework-agnostic - local blob preview needs natural size + canvas access, next/image doesn't apply */}
				<img
					ref={imageRef}
					src={previewUrl || undefined}
					alt=""
					className="image_cropper_image"
					draggable={false}
					crossOrigin={typeof src === "string" ? "anonymous" : undefined}
					onLoad={handleImageLoad}
					onError={onError}
					style={imageStyle}
				/>
				<div
					className={cn(
						"image_cropper_mask",
						circular && "image_cropper_mask_circular",
						dragging && "image_cropper_mask_active",
					)}
					aria-hidden="true"
				/>
			</div>

			<p id={hintId} className="image_cropper_hint">
				{hint}
			</p>

			<div className="image_cropper_zoom">
				<button
					type="button"
					className="image_cropper_zoom_button"
					aria-label={zoomOutLabel}
					disabled={!imageSize || zoom <= minZoom}
					onClick={() => applyZoom(zoom - ZOOM_KEY_STEP)}
				>
					−
				</button>
				<input
					type="range"
					className="image_cropper_zoom_slider"
					aria-label={zoomLabel}
					min={minZoom}
					max={maxZoom}
					step={ZOOM_STEP}
					value={zoom}
					disabled={!imageSize}
					onChange={(event) => applyZoom(Number(event.target.value))}
				/>
				<button
					type="button"
					className="image_cropper_zoom_button"
					aria-label={zoomInLabel}
					disabled={!imageSize || zoom >= maxZoom}
					onClick={() => applyZoom(zoom + ZOOM_KEY_STEP)}
				>
					＋
				</button>
			</div>
			{/* 위치 슬라이더가 없어도 미세 조정이 가능하도록 상태만 노출(스크린리더에 여유 안내) */}
			<span className="image_cropper_sr_only" aria-live="polite">
				{imageSize && !canPan ? noPanHint : ""}
			</span>
		</div>
	);
}
