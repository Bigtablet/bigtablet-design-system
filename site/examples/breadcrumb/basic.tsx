import { Breadcrumb } from "@bigtablet/design-system";
import { useState } from "react";

const TRAIL = ["홈", "주문", "A-1024"];

// 상위 단계를 누르면 그 단계까지로 줄어듭니다. 실제 앱에서는 href 로 이동합니다
export default function Example() {
	const [depth, setDepth] = useState(TRAIL.length);
	return (
		<Breadcrumb
			items={TRAIL.slice(0, depth).map((label, i) =>
				i < depth - 1 ? { label, href: "#", onClick: () => setDepth(i + 1) } : { label },
			)}
		/>
	);
}
