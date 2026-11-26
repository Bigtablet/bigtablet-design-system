import { DatePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [date, setDate] = useState("");
	return (
		<div style={{ maxWidth: 420 }}>
			<DatePicker
				label="생년월일"
				value={date}
				onValueChange={setDate}
				min="1950-01-01"
				max="today"
				clearable
			/>
		</div>
	);
}
