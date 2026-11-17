import { type DateRange, DateRangePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [range, setRange] = useState<DateRange>({});
	return (
		<div style={{ maxWidth: 640 }}>
			<DateRangePicker
				value={range}
				onValueChange={setRange}
				startLabel="시작일"
				endLabel="종료일"
				clearable
			/>
		</div>
	);
}
