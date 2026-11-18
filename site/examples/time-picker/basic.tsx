import { TimePicker } from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [time, setTime] = useState("");
	return (
		<div style={{ maxWidth: 320 }}>
			<TimePicker label="알림 시각" value={time} onValueChange={setTime} minuteStep={15} />
		</div>
	);
}
