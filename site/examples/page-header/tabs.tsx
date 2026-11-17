import { PageHeader, Tab, TabList, TabPanel, Tabs } from "@bigtablet/design-system";

// Tabs 가 PageHeader 와 본문을 함께 감싸고, tabs 칸에는 TabList 만 둡니다
export default function Example() {
	return (
		<Tabs defaultValue="all">
			<PageHeader
				title="주문"
				tabs={
					<TabList ariaLabel="주문 상태">
						<Tab value="all">전체</Tab>
						<Tab value="paid">결제 완료</Tab>
						<Tab value="refund">환불</Tab>
					</TabList>
				}
			/>
			<TabPanel value="all">전체 주문 목록</TabPanel>
			<TabPanel value="paid">결제 완료 목록</TabPanel>
			<TabPanel value="refund">환불 목록</TabPanel>
		</Tabs>
	);
}
