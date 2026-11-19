import { DateCalendar } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [value, setValue] = useState<string | null>("2026-11-17");
	return (
		<div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
			<DateCalendar value={value} onValueChange={setValue} />
			<span>선택: {value ?? "-"}</span>
		</div>
	);
}
