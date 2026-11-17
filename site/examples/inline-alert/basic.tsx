import { InlineAlert } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [shown, setShown] = useState(true);
	return (
		<div style={{ display: "grid", gap: 12 }}>
			<InlineAlert tone="warning" title="결제 수단 만료 예정">
				12월 31일에 카드가 만료됩니다. 설정에서 바꿔 주세요.
			</InlineAlert>
			{shown && (
				<InlineAlert tone="success" onDismiss={() => setShown(false)}>
					변경 사항을 저장했습니다.
				</InlineAlert>
			)}
		</div>
	);
}
