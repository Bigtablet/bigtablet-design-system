import { Card, Grid } from "@bigtablet/design-system";

export default function Example() {
	return (
		<Grid cols={3} gap={16} singleColOnMobile>
			{["매출", "주문", "방문"].map((label) => (
				<Card key={label} heading={label} bordered shadow="none">
					지난주보다 12% 늘었습니다
				</Card>
			))}
		</Grid>
	);
}
