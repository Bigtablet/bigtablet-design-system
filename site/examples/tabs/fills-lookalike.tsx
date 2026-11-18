import { SegmentedControl, Tab, TabList, Tabs } from "@bigtablet/design-system";

// 위는 Tabs variant="fills", 아래는 SegmentedControl - 하는 일이 다른데 거의 같아 보입니다
export default function Example() {
	return (
		<div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
			<Tabs defaultValue="info" variant="fills">
				<TabList ariaLabel="상품">
					<Tab value="info">정보</Tab>
					<Tab value="reviews">후기</Tab>
					<Tab value="qna">문의</Tab>
				</TabList>
			</Tabs>
			<SegmentedControl
				aria-label="보기 방식"
				defaultValue="list"
				items={[
					{ value: "list", label: "목록" },
					{ value: "board", label: "보드" },
					{ value: "calendar", label: "달력" },
				]}
			/>
		</div>
	);
}
