import { SegmentedControl, Tab, TabList, TabPanel, Tabs } from "@bigtablet/design-system";
import { useState } from "react";

type Range = "day" | "week" | "month";

// 밑줄 Tabs 는 내용 패널을 바꾸고, 알약 SegmentedControl 은 그 패널 안의 값 하나(기간)를 고릅니다
export default function Example() {
	const [range, setRange] = useState<Range>("week");
	return (
		<Tabs defaultValue="orders">
			<TabList ariaLabel="매장">
				<Tab value="overview">개요</Tab>
				<Tab value="orders">주문</Tab>
				<Tab value="settle">정산</Tab>
			</TabList>
			<TabPanel value="overview">오늘 매장 요약</TabPanel>
			<TabPanel value="orders">
				<div style={{ display: "grid", gap: 12, paddingTop: 16 }}>
					<SegmentedControl<Range>
						size="sm"
						aria-label="기간"
						value={range}
						onValueChange={setRange}
						items={[
							{ value: "day", label: "일" },
							{ value: "week", label: "주" },
							{ value: "month", label: "월" },
						]}
					/>
					<span>
						{range === "day" ? "오늘" : range === "week" ? "이번 주" : "이번 달"} 주문 128건
					</span>
				</div>
			</TabPanel>
			<TabPanel value="settle">정산 예정 3건</TabPanel>
		</Tabs>
	);
}
