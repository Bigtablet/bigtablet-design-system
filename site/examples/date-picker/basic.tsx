import { DatePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [date, setDate] = useState("");
	const [month, setMonth] = useState("");
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
			<DatePicker
				label="생년월일"
				value={date}
				onValueChange={setDate}
				startYear={1950}
				clearable
			/>
			<DatePicker label="정산 월" mode="year-month" value={month} onValueChange={setMonth} />
		</div>
	);
}
