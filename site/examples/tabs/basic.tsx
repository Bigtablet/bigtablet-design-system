import { Tab, TabList, TabPanel, Tabs } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Tabs defaultValue="info">
			<TabList ariaLabel="상품">
				<Tab value="info">정보</Tab>
				<Tab value="reviews">후기</Tab>
				<Tab value="qna">문의</Tab>
			</TabList>
			<TabPanel value="info">상품 정보</TabPanel>
			<TabPanel value="reviews">후기 128개</TabPanel>
			<TabPanel value="qna">문의 3개</TabPanel>
		</Tabs>
	);
}
