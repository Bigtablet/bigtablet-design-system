import { ImageCropper } from "@bigtablet/design-system";

export default function Example() {
	return (
		<ImageCropper
			src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800"
			circular
			label="프로필 사진 자르기"
			hint="끌어서 위치를, 슬라이더로 크기를 맞춥니다"
		/>
	);
}
