import {
	CopyButton,
	DatePicker,
	Dropdown,
	LocaleProvider,
	Table,
	type TableColumn,
} from "@bigtablet/design-system";
import { useState } from "react";

interface Row {
	id: string;
	name: string;
}

// DS 가 스스로 렌더하는 문구(안내 문구 · 버튼 · 빈 목록 …)가 locale 하나로 바뀝니다. 앱이 넘긴 글(label · header)은 그대로입니다
function Sample({ labels }: { labels: { country: string; date: string; list: string } }) {
	const [date, setDate] = useState("");
	const columns: TableColumn<Row>[] = [{ key: "name", header: labels.list }];
	return (
		<div style={{ display: "grid", gap: 12 }}>
			<Dropdown label={labels.country} options={[{ value: "kr", label: "Korea" }]} />
			<DatePicker label={labels.date} variant="calendar" value={date} onValueChange={setDate} />
			<CopyButton text="https://bigtablet.com" style={{ justifySelf: "start" }} />
			<Table ariaLabel={labels.list} columns={columns} data={[]} keyExtractor={(r) => r.id} />
		</div>
	);
}

export default function Example() {
	return (
		<div
			style={{
				display: "grid",
				gap: 24,
				gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
			}}
		>
			<Sample labels={{ country: "국가", date: "날짜", list: "목록" }} />
			<LocaleProvider locale="en">
				<Sample labels={{ country: "Country", date: "Date", list: "List" }} />
			</LocaleProvider>
		</div>
	);
}
