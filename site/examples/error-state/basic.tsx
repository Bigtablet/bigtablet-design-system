import { Button, ErrorState } from "@bigtablet/design-system";

export default function Example() {
	return (
		<ErrorState
			variant="widget"
			title="매출을 불러오지 못했습니다"
			description="잠시 뒤 다시 시도해 주세요"
			action={<Button variant="outline">다시 시도</Button>}
		/>
	);
}
