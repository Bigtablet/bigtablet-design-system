import { Table, type TableColumn } from "@bigtablet/design-system";

interface Member {
	id: string;
	name: string;
	role: string;
}

const columns: TableColumn<Member>[] = [
	{ key: "name", header: "이름" },
	{ key: "role", header: "역할" },
];

// 처음 불러오는 동안 - 행 자리에 스켈레톤이 보입니다
export default function Example() {
	return (
		<Table ariaLabel="구성원" columns={columns} data={[]} keyExtractor={(m) => m.id} isLoading />
	);
}
