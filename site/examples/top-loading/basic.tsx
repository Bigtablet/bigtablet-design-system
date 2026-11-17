import { Button, TopLoading } from "@bigtablet/design-system";
import { useState } from "react";

// 화면 맨 위에 붙는 진행 줄 - 페이지 이동 · 큰 저장에 씁니다
export default function Example() {
	const [loading, setLoading] = useState(false);
	return (
		<>
			<TopLoading isLoading={loading} ariaLabel="페이지 불러오는 중" />
			<Button
				variant="outline"
				onClick={() => {
					setLoading(true);
					setTimeout(() => setLoading(false), 2000);
				}}
			>
				2초 동안 불러오기
			</Button>
		</>
	);
}
