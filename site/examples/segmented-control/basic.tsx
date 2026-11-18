import { SegmentedControl } from "@bigtablet/design-system";
import { useState } from "react";

type View = "list" | "board" | "calendar";

export default function Example() {
	const [view, setView] = useState<View>("list");
	return (
		<SegmentedControl<View>
			aria-label="보기 방식"
			value={view}
			onValueChange={setView}
			items={[
				{ value: "list", label: "목록" },
				{ value: "board", label: "보드" },
				{ value: "calendar", label: "달력" },
			]}
		/>
	);
}
