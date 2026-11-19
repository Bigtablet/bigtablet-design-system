import {
	AppShell,
	Badge,
	Button,
	DataView,
	NavBar,
	PageHeader,
	Sidebar,
	SidebarItem,
	SidebarSection,
	type TableColumn,
} from "@bigtablet/design-system";
import { Home, Settings, ShoppingBag, Users } from "lucide-react";
import { useState } from "react";

interface Order {
	id: string;
	customer: string;
	amount: number;
	status: "paid" | "refund";
}

const ORDERS: Order[] = Array.from({ length: 12 }, (_, i) => ({
	id: `A-${1000 + i}`,
	customer: ["박상민", "김지원", "이수아"][i % 3] as string,
	amount: 12000 + i * 3100,
	status: i % 4 === 0 ? "refund" : "paid",
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
			o.status === "paid" ? <Badge tone="success">결제 완료</Badge> : <Badge>환불</Badge>,
	},
];

// 관리자 목록 화면 - AppShell(사이드바 + 헤더) 안에 PageHeader 와 DataView(검색 · 표 · 페이지 · 로딩 · 빈 상태)
export default function Example() {
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const pageSize = 5;
	const rows = ORDERS.filter((o) => o.customer.includes(search) || o.id.includes(search));
	return (
		<AppShell
			sidebar={
				<Sidebar header={<strong>Bigtablet</strong>} headerCollapsed={<strong>B</strong>}>
					<SidebarSection label="운영">
						<SidebarItem icon={<Home size={18} />}>대시보드</SidebarItem>
						<SidebarItem icon={<ShoppingBag size={18} />} active>
							주문
						</SidebarItem>
					</SidebarSection>
					<SidebarSection label="관리">
						<SidebarItem icon={<Users size={18} />}>구성원</SidebarItem>
						<SidebarItem icon={<Settings size={18} />}>설정</SidebarItem>
					</SidebarSection>
				</Sidebar>
			}
			header={<NavBar layout="fluid" sticky brand={<span>관리자</span>} />}
		>
			<PageHeader
				title="주문"
				description="오늘 들어온 주문입니다"
				actions={<Button>주문 추가</Button>}
			/>
			<DataView
				ariaLabel="주문 목록"
				query={{ data: rows.slice((page - 1) * pageSize, page * pageSize) }}
				columns={columns}
				rowKey={(o) => o.id}
				toolbar={{
					search: true,
					searchValue: search,
					onSearchChange: (v) => {
						setSearch(v);
						setPage(1);
					},
				}}
				pagination={{
					page,
					totalPages: Math.max(1, Math.ceil(rows.length / pageSize)),
					onPageChange: setPage,
				}}
			/>
		</AppShell>
	);
}
