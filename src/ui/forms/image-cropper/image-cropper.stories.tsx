import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { Button } from "../../general/button";
import { ImageCropper, type ImageCropperHandle } from "./index";

// 데모용 샘플 이미지 (외부 네트워크 없이 렌더되도록 인라인 SVG data URL - 가로가 긴 그라디언트).
const SAMPLE =
	"data:image/svg+xml;utf8," +
	encodeURIComponent(
		`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#7AA5D2"/><stop offset="1" stop-color="#47555E"/>
      </linearGradient></defs>
      <rect width="640" height="400" fill="url(#g)"/>
      <circle cx="200" cy="150" r="90" fill="#fff" opacity="0.85"/>
      <text x="320" y="360" fill="#fff" font-size="28" text-anchor="middle">640 × 400</text>
    </svg>`,
	);

const meta = {
	title: "Components/Forms/ImageCropper",
	component: ImageCropper,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"업로드 전에 이미지에서 보일 정사각 영역을 정하는 크로퍼. 드래그/방향키로 위치, 휠·슬라이더·＋/－ 로 배율을 맞추고, 소비자가 `ref.crop()` 으로 Blob 을 받아 `Modal` 등으로 감싼다. / An image cropper: drag or arrow keys to reposition, wheel/slider/±to zoom; the consumer calls `ref.crop()` for a Blob and wraps it in a Modal.",
			},
		},
	},
	tags: ["autodocs"],
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Square: Story = {
	args: { src: SAMPLE },
};

export const Circular: Story = {
	args: { src: SAMPLE, circular: true },
	parameters: {
		docs: { description: { story: "아바타용 원형 가이드. / Circular guide for avatars." } },
	},
};

export const WithApply: Story = {
	args: { src: SAMPLE, circular: true },
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
};
