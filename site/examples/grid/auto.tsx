import { Card, Grid } from "@bigtablet/design-system";

// 폭에 따라 열 수가 바뀝니다 - 한 칸이 minColWidth 보다 좁아지면 줄을 바꿉니다
export default function Example() {
	return (
		<Grid cols="auto" minColWidth="180px" gap={12}>
			{["모자", "가방", "신발", "시계", "지갑", "벨트"].map((name) => (
				<Card key={name} bordered shadow="none" padding="sm">
					{name}
				</Card>
			))}
		</Grid>
	);
}
