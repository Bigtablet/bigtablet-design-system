import { Badge, DataView, type TableColumn } from "@bigtablet/design-system";
import { useState } from "react";

interface Order {
	id: string;
	customer: string;
	amount: number;
	status: "paid" | "refund";
}

const ALL: Order[] = Array.from({ length: 23 }, (_, i) => ({
	id: `A-${1000 + i}`,
	customer: ["박상민", "김지원", "이수아"][i % 3] as string,
	amount: 12000 + i * 3100,
	status: i % 5 === 0 ? "refund" : "paid",
}));

const columns: TableColumn<Order>[] = [
	{ key: "id", header: "주문 번호" },
	{ key: "customer", header: "고객" },
	{
		key: "amount",
		header: "금액",
		align: "right",
		render: (o) => `${o.amount.toLocaleString()}원`,
	},
	{
		key: "status",
		header: "상태",
		render: (o) =>
			o.status === "paid" ? (
				<Badge tone="success">결제 완료</Badge>
			) : (
				<Badge tone="neutral">환불</Badge>
			),
	},
];

// 로딩 · 빈 상태 · 오류 · 검색 · 페이지를 한 컴포넌트가 맡습니다
export default function Example() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const filtered = ALL.filter((o) => o.customer.includes(search) || o.id.includes(search));
	const pageSize = 5;
	return (
		<DataView
			ariaLabel="주문 목록"
			query={{ data: filtered.slice((page - 1) * pageSize, page * pageSize) }}
			columns={columns}
			rowKey={(o) => o.id}
			toolbar={{
				search: true,
				searchValue: search,
				onSearchChange: (v) => {
					setSearch(v);
					setPage(1);
				},
				searchPlaceholder: "고객 · 주문 번호",
			}}
			pagination={{
				page,
				totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
				onPageChange: setPage,
			}}
		/>
	);
}
