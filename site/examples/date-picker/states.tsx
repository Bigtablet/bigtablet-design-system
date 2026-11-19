import { DatePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [date, setDate] = useState("");
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
			<DatePicker label="입사일" value={date} onValueChange={setDate} required />
			<DatePicker label="계약 시작일" value="2026-01-02" onValueChange={() => {}} disabled />
		</div>
	);
}
