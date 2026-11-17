import { Icon, iconSize } from "@bigtablet/design-system";
import { Bell, Settings, Star } from "lucide-react";

// 크기는 iconSize 토큰(xs 14 ~ xl 32)으로, 색은 글자색을 따릅니다
export default function Example() {
	return (
		<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
			<Icon icon={Bell} size={iconSize.sm} />
			<Icon icon={Settings} size={iconSize.md} />
			<Icon icon={Star} size={iconSize.lg} aria-label="즐겨찾기" />
		</div>
	);
}
