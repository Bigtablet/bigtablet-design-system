/**
 * 정사각 이미지 크롭의 좌표 계산. 화면 조작(드래그 이동량 + 확대 배율)을 원본 픽셀 기준
 * 정사각 영역으로 환산하는 순수 함수만 모은다 — canvas / DOM 을 모르므로 그대로 단위 테스트
 * 할 수 있다.
 *
 * 좌표 규약:
 * - 뷰포트는 한 변이 `viewportSize` 인 정사각형이고, 이미지는 그 중앙을 기준으로 놓인다.
 * - `offset` 은 이미지 중심이 뷰포트 중심에서 얼마나 밀렸는지(CSS px). 오른쪽/아래가 +.
 * - 배율은 항상 `cover` 배율 × zoom 이라 zoom=1 이면 이미지가 뷰포트를 정확히 덮는다.
 */

/** 이미지 중심의 이동량(CSS px) */
export interface CropOffset {
	x: number;
	y: number;
}

/** 원본 이미지의 natural 크기(px) */
export interface CropImageSize {
	width: number;
	height: number;
}

/** 원본 픽셀 기준 정사각 크롭 영역 (`canvas.drawImage` 의 source 인자로 그대로 사용) */
export interface CropRect {
	x: number;
	y: number;
	size: number;
}

/**
 * 이미지가 뷰포트를 빈틈없이 덮는 최소 배율(`object-fit: cover` 와 같은 계산).
 */
export const getCoverScale = (image: CropImageSize, viewportSize: number): number =>
	Math.max(viewportSize / image.width, viewportSize / image.height);

/**
 * 값을 `[-limit, limit]` 로 자른다. limit 이 0 이면 부호 있는 0(`-0`)이 나올 수 있어 0 으로
 * 정규화한다 — 그대로 두면 `translate(-0px)` 처럼 표기에 새어 나간다.
 */
const clampSymmetric = (value: number, limit: number): number => {
	const clamped = Math.min(limit, Math.max(-limit, value));
	return clamped === 0 ? 0 : clamped;
};

/**
 * 축별로 움직일 수 있는 최대 이동량. 이보다 더 밀면 이미지가 뷰포트를 덮지 못해 가장자리에
 * 빈 영역이 생긴다.
 */
export const getOffsetLimits = (
	image: CropImageSize,
	viewportSize: number,
	zoom: number,
): CropOffset => {
	const scale = getCoverScale(image, viewportSize) * zoom;
	return {
		x: Math.max(0, (image.width * scale - viewportSize) / 2),
		y: Math.max(0, (image.height * scale - viewportSize) / 2),
	};
};

/**
 * 이동량을 "이미지가 뷰포트를 계속 덮는" 범위로 제한한다. 제한이 없으면 가장자리를 넘겨 빈
 * 영역이 그대로 크롭 결과에 들어간다.
 */
export const clampCropOffset = (
	offset: CropOffset,
	image: CropImageSize,
	viewportSize: number,
	zoom: number,
): CropOffset => {
	const limits = getOffsetLimits(image, viewportSize, zoom);
	return {
		x: clampSymmetric(offset.x, limits.x),
		y: clampSymmetric(offset.y, limits.y),
	};
};

/**
 * 화면 조작 결과를 원본 픽셀 기준 크롭 영역으로 환산한다. 이동량은 항상 내부에서 다시
 * 제한하므로, 호출부가 범위를 벗어난 값을 넘겨도 이미지 바깥이 잘리지 않는다.
 */
export const getCropRect = (
	image: CropImageSize,
	viewportSize: number,
	zoom: number,
	offset: CropOffset,
): CropRect => {
	const scale = getCoverScale(image, viewportSize) * zoom;
	const size = viewportSize / scale;
	const clamped = clampCropOffset(offset, image, viewportSize, zoom);
	return {
		x: (image.width - size) / 2 - clamped.x / scale,
		y: (image.height - size) / 2 - clamped.y / scale,
		size,
	};
};
