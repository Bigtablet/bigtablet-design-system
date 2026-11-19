import { Button, EmptyState } from "@bigtablet/design-system";

export default function Example() {
	return (
		<EmptyState
			title="아직 주문이 없습니다"
			description="첫 상품을 등록하면 주문이 여기에 쌓입니다"
			action={<Button>상품 등록</Button>}
		/>
	);
}
