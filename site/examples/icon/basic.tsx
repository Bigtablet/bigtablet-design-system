import { Icon } from "@bigtablet/design-system";
import { Bell, Settings, Star } from "lucide-react";

// 크기는 icon 토큰(xs 14 ~ xl 32)으로, 색은 글자색을 따릅니다
export default function Example() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
			<Icon icon={Bell} size="sm" />
			<Icon icon={Settings} size="md" />
			<Icon icon={Star} size="lg" />
		</div>
	);
}
