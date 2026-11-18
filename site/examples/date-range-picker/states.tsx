import { type DateRange, DateRangePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [range, setRange] = useState<DateRange>({});
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 360 }}>
			<DateRangePicker value={range} onValueChange={setRange} required />
			<DateRangePicker
				value={{ start: "2026-01-01", end: "2026-01-31" }}
				onValueChange={() => {}}
				disabled
			/>
		</div>
	);
}
