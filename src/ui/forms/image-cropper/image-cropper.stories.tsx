import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "../../general/button";
import { ImageCropper, type ImageCropperHandle } from "./index";

/** 데모용 샘플 이미지 (외부 네트워크 없이 렌더되도록 인라인 SVG data URL). */
const sample = (w: number, h: number, label: string) =>
	`data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7AA5D2"/><stop offset="1" stop-color="#47555E"/>
      </linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#g)"/>
      <circle cx="${w * 0.3}" cy="${h * 0.35}" r="${Math.min(w, h) * 0.22}" fill="#fff" opacity="0.85"/>
      <text x="${w / 2}" y="${h - 18}" fill="#fff" font-size="24" text-anchor="middle">${label}</text>
    </svg>`,
	)}`;

const LANDSCAPE = sample(640, 400, "640 × 400");
const PORTRAIT = sample(400, 640, "400 × 640");
const SQUARE = sample(500, 500, "500 × 500");

const meta = {
	title: "Components/Forms/ImageCropper",
	component: ImageCropper,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component: [
					"업로드 전에 이미지에서 보일 **정사각 영역**을 정하는 크로퍼입니다. 뷰포트 안에서 **드래그(또는 방향키)** 로 위치를, **마우스 휠 · 슬라이더 · ＋/－ 버튼(또는 `+`/`-` 키)** 으로 배율을 맞춥니다. 모달을 포함하지 않으므로 소비자가 `Modal` 등으로 감싸고, 적용 버튼에서 `ref.crop()` 을 호출해 잘린 `Blob` 을 받습니다.",
					"",
					"An image cropper for choosing a **square region** before upload. **Drag (or arrow keys)** to reposition, **wheel · slider · ±buttons (or `+`/`-`)** to zoom. It renders no modal — wrap it yourself and call `ref.crop()` from your apply button to get the cropped `Blob`.",
					"",
					"```tsx",
					"const cropperRef = useRef<ImageCropperHandle>(null);",
					"<ImageCropper ref={cropperRef} src={file} circular />;",
					"// apply:",
					"const blob = await cropperRef.current!.crop();",
					"```",
					"",
					"> 원격 URL 은 `canvas.drawImage` 가 서버 CORS 에 의존합니다 — 확실히 자르려면 로컬 `File`/`Blob` 을 권장합니다. / Remote URLs depend on server CORS; prefer a local `File`/`Blob`.",
				].join("\n"),
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		src: { control: false, description: "크롭할 이미지 (`File`/`Blob`/URL). / Image to crop." },
		circular: {
			control: "boolean",
			description: "원형 가이드(아바타용). / Circular guide for avatars.",
		},
		viewportSize: {
			control: { type: "number", min: 160, max: 320, step: 8 },
			description: "뷰포트 한 변(px). / Viewport side length (px).",
		},
		outputSize: {
			control: { type: "number", min: 128, max: 1024, step: 64 },
			description: "결과물 한 변(px). / Output side length (px).",
		},
		outputType: {
			control: "select",
			options: ["auto", "image/jpeg", "image/png", "image/webp"],
			description:
				"결과 MIME. `auto` 는 PNG 만 유지, 나머지는 JPEG. / Output MIME; `auto` keeps PNG else JPEG.",
		},
		quality: {
			control: { type: "number", min: 0.5, max: 1, step: 0.02 },
			description:
				"JPEG/WebP 품질 (컨트롤 0.5~1, prop 자체는 0~1 허용). / JPEG/WebP quality (control 0.5–1; the prop accepts 0–1).",
		},
		minZoom: {
			control: { type: "number", min: 1, max: 3, step: 0.5 },
			description: "최소 배율. / Min zoom.",
		},
		maxZoom: {
			control: { type: "number", min: 1, max: 6, step: 0.5 },
			description: "최대 배율. / Max zoom.",
		},
		label: {
			control: "text",
			description: "뷰포트 접근성 레이블. / Viewport accessibility label.",
		},
		hint: {
			control: "text",
			description: "뷰포트 아래 조작 안내 문구. / Operation hint under the viewport.",
		},
		zoomOutLabel: {
			control: "text",
			description: "축소 버튼 레이블. / Zoom-out button label.",
		},
		zoomLabel: {
			control: "text",
			description: "배율 슬라이더 레이블. / Zoom slider label.",
		},
		zoomInLabel: {
			control: "text",
			description: "확대 버튼 레이블. / Zoom-in button label.",
		},
		noPanHint: {
			control: "text",
			description:
				"이동 여유가 없을 때 스크린리더로 알리는 문구. / Announced when the image has no room to pan.",
		},
		ref: { table: { disable: true } },
		onReady: { table: { disable: true } },
		onError: { table: { disable: true } },
	},
	args: { src: LANDSCAPE },
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 모든 컨트롤을 만져볼 수 있는 기본 놀이터. / Interactive playground. */
export const Playground: Story = {};

/** 둥근 사각 가이드(기본). / Rounded-square guide (default). */
export const Square: Story = { args: { src: SQUARE } };

/** 아바타용 원형 가이드. / Circular guide for avatars. */
export const Circular: Story = { args: { circular: true } };

/** 가로가 긴 원본 — 좌우로만 드래그해 보이는 부분을 고른다. / Landscape source: pan horizontally. */
export const LandscapeSource: Story = {
	args: { src: LANDSCAPE },
	parameters: {
		docs: {
			description: {
				story:
					"cover 배율이라 세로는 꽉 차고 가로만 여유가 생긴다. / With cover scaling, height fills the viewport while only width has room to pan.",
			},
		},
	},
};

/** 세로가 긴 원본 — 위아래로만 드래그. / Portrait source: pan vertically. */
export const PortraitSource: Story = { args: { src: PORTRAIT } };

/** 모든 문구를 소비자 로케일로 교체한 예. / Every string replaced with the consumer's locale. */
export const Localized: Story = {
	args: {
		src: SQUARE,
		circular: true,
		label: "Adjust image position and zoom",
		hint: "Drag (or use arrow keys) to move, scroll or use the slider to zoom.",
		zoomOutLabel: "Zoom out",
		zoomLabel: "Zoom",
		zoomInLabel: "Zoom in",
		noPanHint: "The image fills the viewport, so there is no room to pan.",
	},
	parameters: {
		docs: {
			description: {
				story:
					"기본값은 한국어라, 다국어 앱은 이 prop 들로 갈아 끼운다. / Defaults are Korean, so multilingual apps swap them through these props.",
			},
		},
	},
};

/** 적용/초기화 버튼과 함께 쓰는 실제 패턴 — `ref.crop()` 결과를 원형으로 미리본다. */
export const WithApply: Story = {
	args: { src: PORTRAIT, circular: true },
	render: (args) => {
		const ref = useRef<ImageCropperHandle>(null);
		const [result, setResult] = useState<string | null>(null);
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
				<ImageCropper {...args} ref={ref} />
				<div style={{ display: "flex", gap: 8 }}>
					<Button variant="outline" onClick={() => ref.current?.reset()}>
						초기화
					</Button>
					<Button
						onClick={async () => {
							const blob = await ref.current?.crop();
							if (blob) setResult(URL.createObjectURL(blob));
						}}
					>
						적용
					</Button>
				</div>
				{result && (
					// biome-ignore lint/performance/noImgElement: 데모 결과 미리보기
					<img
						src={result}
						alt="크롭 결과"
						width={96}
						height={96}
						style={{ borderRadius: "50%" }}
					/>
				)}
			</div>
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					"소비 앱 패턴: 크로퍼 + 적용 버튼에서 `ref.crop()` → `Blob`. / Real pattern: apply button calls `ref.crop()`.",
			},
		},
	},
};

export const WithForwardedAttributes: Story = {
	args: { src: SQUARE },
	render: (args) => (
		<ImageCropper {...args} id="avatar-cropper" data-section="profile" aria-label="프로필 이미지" />
	),
	parameters: {
		docs: {
			description: {
				story: [
					'`ImageCropperProps` 는 `Omit<HTMLAttributes<HTMLDivElement>, "onError">` 를 확장해 표준 div 속성(`id`·`data-*`·`aria-*`·`style` 등)을 **루트 요소**로 전달합니다. 폼/오버레이가 크로퍼를 식별하거나 라벨을 연결할 때 씁니다. `onError` 는 이미지 디코드 실패 콜백으로 그대로 유지됩니다.',
					"",
					'`ImageCropperProps` extends `Omit<HTMLAttributes<HTMLDivElement>, "onError">`, forwarding standard div attributes (`id`, `data-*`, `aria-*`, `style`, …) onto the **root element**. `onError` stays the image-decode callback.',
				].join("\n"),
			},
		},
	},
};
