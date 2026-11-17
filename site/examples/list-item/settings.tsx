import { ListItem, Toggle } from "@bigtablet/design-system";
import { Bell, Lock } from "lucide-react";

export default function Example() {
	return (
		<div style={{ maxWidth: 480 }}>
			<ListItem
				leadingElement={<Bell size={20} />}
				label="알림"
				supportingText="주문이 들어오면 알려 줍니다"
				trailingElement={<Toggle ariaLabel="알림" defaultChecked />}
			/>
			<ListItem
				leadingElement={<Lock size={20} />}
				label="비밀번호 변경"
				metadata="3개월 전"
				onClick={() => {}}
			/>
		</div>
	);
}
