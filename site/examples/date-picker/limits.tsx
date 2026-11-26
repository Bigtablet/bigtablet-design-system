import { DatePicker } from "@bigtablet/design-system";
import { useState } from "react";

// 주말은 예약을 받지 않는다
const isWeekend = (date: string) => {
	const day = new Date(`${date}T00:00`).getDay();
	return day === 0 || day === 6;
};

export default function Example() {
	const [date, setDate] = useState("");
	return (
		<div style={{ maxWidth: 320 }}>
			<DatePicker
				label="방문 예약일"
				variant="calendar"
				value={date}
				onValueChange={setDate}
				min="today"
				isDateDisabled={isWeekend}
			/>
		</div>
	);
}
