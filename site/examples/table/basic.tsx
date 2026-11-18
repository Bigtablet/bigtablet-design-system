import { Table, type TableColumn, type TableSort } from "@bigtablet/design-system";
import { useState } from "react";

interface Member {
	id: string;
	name: string;
	role: string;
	joined: string;
}

const DATA: Member[] = [
	{ id: "1", name: "박상민", role: "관리자", joined: "2024-03-02" },
	{ id: "2", name: "김지원", role: "디자이너", joined: "2025-01-15" },
	{ id: "3", name: "이수아", role: "개발자", joined: "2025-07-30" },
];

const columns: TableColumn<Member>[] = [
	{ key: "name", header: "이름", sortable: true },
	{ key: "role", header: "역할" },
	{ key: "joined", header: "가입일", sortable: true },
];

export default function Example() {
	const [sort, setSort] = useState<TableSort>();
	const rows = sort
		? [...DATA].sort((a, b) => {
				const k = sort.key as keyof Member;
				return (a[k] < b[k] ? -1 : 1) * (sort.direction === "asc" ? 1 : -1);
			})
		: DATA;
	return (
		<Table
			ariaLabel="구성원"
			columns={columns}
			data={rows}
			keyExtractor={(m) => m.id}
			sort={sort}
			onSortChange={setSort}
		/>
	);
}
