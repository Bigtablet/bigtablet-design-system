import { MonthPicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [month, setMonth] = useState("");
	return (
		<div style={{ maxWidth: 320 }}>
			<MonthPicker label="정산 월" value={month} onValueChange={setMonth} max="today" clearable />
		</div>
	);
}
