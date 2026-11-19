import { Button, Card, Container, Grid, Hero, NavBar, Section } from "@bigtablet/design-system";

const FEATURES = [
	["주문", "들어온 주문을 실시간으로 봅니다"],
	["재고", "모자라기 전에 알려 줍니다"],
	["매출", "기간별로 비교합니다"],
];

// 마케팅 랜딩 - NavBar · Hero · Section(배경) > Container(글 폭) > Grid > Card
export default function Example() {
	return (
		<div>
			<NavBar brand={<strong>Bigtablet</strong>} actions={<Button size="sm">시작하기</Button>} />
			<Hero
				height="sm"
				title="매장 운영을 한 화면에서"
				subtitle="주문 · 재고 · 매출을 실시간으로 봅니다"
				primaryAction={{ label: "시작하기", href: "#" }}
			/>
			<Section bg="dim" spacing="sm">
				<Container size="lg">
					{/* Hero 가 h1, 카드 제목이 h3 이라 사이에 구역 제목(h2)을 둔다 - 제목 단계를 건너뛰지 않게 */}
					<h2>할 수 있는 일</h2>
					<Grid cols={3} gap={16} singleColOnMobile>
						{FEATURES.map(([title, body]) => (
							<Card key={title} heading={title} shadow="none">
								{body}
							</Card>
						))}
					</Grid>
				</Container>
			</Section>
		</div>
	);
}
