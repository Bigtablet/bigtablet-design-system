import { TimePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [time, setTime] = useState("");
	return (
		<div style={{ display: "grid", gap: 16, maxWidth: 240 }}>
			<TimePicker label="시작 시각" value={time} onValueChange={setTime} required />
			<TimePicker label="마감 시각" value="18:00" onValueChange={() => {}} disabled />
		</div>
	);
}
