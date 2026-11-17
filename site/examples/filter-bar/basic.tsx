import {
	type DateRange,
	DateRangePicker,
	Dropdown,
	FilterBar,
	TextField,
} from "@bigtablet/design-system";
import { useState } from "react";

export default function Example() {
	const [query, setQuery] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [range, setRange] = useState<DateRange>({});
	const dirty = !!query || !!status || !!range.start;
	return (
		<FilterBar
			canReset={dirty}
			onReset={() => {
				setQuery("");
				setStatus(null);
				setRange({});
			}}
			onSubmit={() => {}}
		>
			<TextField label="검색" value={query} onValueChange={setQuery} />
			<Dropdown
				label="상태"
				value={status}
				onValueChange={setStatus}
				options={[
					{ value: "paid", label: "결제 완료" },
					{ value: "refund", label: "환불" },
				]}
			/>
			<DateRangePicker value={range} onValueChange={setRange} />
		</FilterBar>
	);
}
