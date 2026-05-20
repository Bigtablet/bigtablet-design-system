import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "../../ui/avatar";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Container } from "../../ui/container";
import { EmptyState } from "../../ui/empty-state";
import { Grid } from "../../ui/grid";
import { Hero } from "../../ui/hero";
import { MediaCard } from "../../ui/media-card";
import { Section } from "../../ui/section";
import { Sidebar, SidebarItem, SidebarSection } from "../../ui/sidebar";
import { Stack } from "../../ui/stack";
import { Tab, TabList, TabPanel, Tabs } from "../../ui/tabs";
import { Tag } from "../../ui/tag";

const meta: Meta = {
	title: "Guide/Page Composition",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"**Page Composition** — DS v3.0 컴포넌트를 합성한 실제 페이지 패턴 예시.\n\nSection + Container + Grid + Hero + Sidebar + Tabs + Avatar + Badge + Tag 조합.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── Marketing Page ─────────────────────────────────────────────────────────

export const MarketingPage: Story = {
	name: "마케팅 페이지",
	render: () => (
		<div style={{ minHeight: "100vh", background: "#fff" }}>
			{/* Hero */}
			<Hero
				title="매장 운영을 더 스마트하게"
				subtitle="Bigtablet으로 주문·재고·직원 관리를 한 곳에서"
				backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&q=80"
				overlay="dark"
				height="lg"
				align="center"
				primaryAction={{ label: "무료 체험 시작", onClick: () => {} }}
				secondaryAction={{ label: "데모 보기", onClick: () => {} }}
			/>

			{/* Feature Grid */}
			<Section spacing="lg" bg="default">
				<Container size="xl">
					<Stack gap={32}>
						<Stack gap={8} align="center">
							<Tag variant="navy">핵심 기능</Tag>
							<h2
								style={{
									margin: 0,
									fontSize: 32,
									fontWeight: 700,
									color: "#121212",
									textAlign: "center",
								}}
							>
								왜 Bigtablet인가요?
							</h2>
							<p style={{ margin: 0, color: "#666", textAlign: "center", maxWidth: 480 }}>
								수천 개의 매장이 신뢰하는 올인원 솔루션
							</p>
						</Stack>

						<Grid cols="auto" minColWidth="260px" gap={24}>
							{[
								{ title: "실시간 주문 관리", desc: "POS 연동으로 주문 현황 즉시 파악" },
								{ title: "스마트 재고 추적", desc: "재고 부족 전 자동 알림" },
								{ title: "직원 스케줄링", desc: "근무 배치와 급여 정산 통합" },
								{ title: "매출 분석 대시보드", desc: "일별·월별 매출 트렌드 한눈에" },
								{ title: "고객 멤버십", desc: "적립·쿠폰으로 재방문 유도" },
								{ title: "멀티 매장 관리", desc: "체인점 전체를 하나의 계정으로" },
							].map((f) => (
								<div
									key={f.title}
									style={{
										padding: "24px",
										background: "#F2F5F8",
										borderRadius: "12px",
										border: "1px solid #DDE3E9",
									}}
								>
									<div
										style={{
											width: 40,
											height: 40,
											borderRadius: 8,
											background: "#47555E",
											marginBottom: 12,
										}}
									/>
									<h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 700, color: "#121212" }}>
										{f.title}
									</h3>
									<p style={{ margin: 0, fontSize: 14, color: "#666" }}>{f.desc}</p>
								</div>
							))}
						</Grid>
					</Stack>
				</Container>
			</Section>

			{/* Case Studies */}
			<Section spacing="lg" bg="dim">
				<Container size="xl">
					<Stack gap={32}>
						<h2
							style={{
								margin: 0,
								fontSize: 28,
								fontWeight: 700,
								color: "#121212",
								textAlign: "center",
							}}
						>
							고객 사례
						</h2>
						<Grid cols={3} gap={24}>
							{[
								{
									title: "강남 카페 매출 32% 상승",
									img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
									tag: "카페",
								},
								{
									title: "편의점 체인 재고 로스 절반으로",
									img: "https://images.unsplash.com/photo-1601933973783-43cf8a7d4c5f?w=600&q=80",
									tag: "편의점",
								},
								{
									title: "레스토랑 홀 회전율 1.4배 증가",
									img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
									tag: "레스토랑",
								},
							].map((c) => (
								<MediaCard
									key={c.title}
									title={c.title}
									image={{ src: c.img, alt: c.title }}
									tag={c.tag}
									shadow="md"
								/>
							))}
						</Grid>
					</Stack>
				</Container>
			</Section>

			{/* CTA Navy */}
			<Section spacing="lg" bg="navy">
				<Container size="md">
					<Stack gap={24} align="center">
						<h2
							style={{
								margin: 0,
								fontSize: 32,
								fontWeight: 700,
								color: "#fff",
								textAlign: "center",
							}}
						>
							지금 바로 시작하세요
						</h2>
						<p style={{ margin: 0, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
							14일 무료 체험 · 신용카드 불필요
						</p>
						<Stack direction="horizontal" gap={12}>
							<Button variant="primary" size="lg">
								무료 체험 시작
							</Button>
							<Button variant="ghost" size="lg" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
								영업팀 문의
							</Button>
						</Stack>
					</Stack>
				</Container>
			</Section>
		</div>
	),
};

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

export const AdminDashboard: Story = {
	name: "어드민 대시보드",
	render: () => (
		<div style={{ display: "flex", minHeight: "100vh", background: "#F2F5F8" }}>
			{/* Sidebar */}
			<Sidebar
				header={
					<img
						src="/images/logo/bigtablet.png"
						alt="Bigtablet"
						height={26}
						style={{ filter: "brightness(0) invert(1)" }}
					/>
				}
			>
				<SidebarSection label="메인">
					<SidebarItem
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<rect x="3" y="3" width="7" height="7" />
								<rect x="14" y="3" width="7" height="7" />
								<rect x="14" y="14" width="7" height="7" />
								<rect x="3" y="14" width="7" height="7" />
							</svg>
						}
						active
					>
						대시보드
					</SidebarItem>
					<SidebarItem
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
								<line x1="3" y1="6" x2="21" y2="6" />
								<path d="M16 10a4 4 0 0 1-8 0" />
							</svg>
						}
						badge={<Badge shape="count" variant="danger">5</Badge>}
					>
						주문
					</SidebarItem>
					<SidebarItem
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<line x1="12" y1="1" x2="12" y2="23" />
								<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
							</svg>
						}
					>
						매출
					</SidebarItem>
				</SidebarSection>
				<SidebarSection label="관리">
					<SidebarItem
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
						}
					>
						직원
					</SidebarItem>
					<SidebarItem
						icon={
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="3" />
								<path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
							</svg>
						}
					>
						설정
					</SidebarItem>
				</SidebarSection>
			</Sidebar>

			{/* Main content */}
			<div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
				{/* Header */}
				<Stack direction="horizontal" justify="between" align="center" gap={0} style={{ marginBottom: 24 }}>
					<Stack gap={4}>
						<h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#121212" }}>대시보드</h1>
						<p style={{ margin: 0, fontSize: 14, color: "#888" }}>2026년 5월 20일 화요일</p>
					</Stack>
					<Stack direction="horizontal" gap={12} align="center">
						<Badge shape="dot" variant="success" />
						<Avatar name="박상민" size="md" />
					</Stack>
				</Stack>

				{/* Stats */}
				<Grid cols={4} gap={16} style={{ marginBottom: 24 }}>
					{[
						{ label: "오늘 매출", value: "₩1,284,000", delta: "+12%" },
						{ label: "신규 주문", value: "47", delta: "+8%" },
						{ label: "활성 직원", value: "12", delta: "0%" },
						{ label: "재고 부족", value: "3", delta: "-2개" },
					].map((stat) => (
						<div
							key={stat.label}
							style={{
								background: "#fff",
								borderRadius: 12,
								padding: "20px 24px",
								border: "1px solid #E5E5E5",
							}}
						>
							<p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>{stat.label}</p>
							<p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: "#121212" }}>
								{stat.value}
							</p>
							<p style={{ margin: 0, fontSize: 12, color: "#47555E", fontWeight: 600 }}>
								{stat.delta}
							</p>
						</div>
					))}
				</Grid>

				{/* Tabs section */}
				<div
					style={{
						background: "#fff",
						borderRadius: 12,
						border: "1px solid #E5E5E5",
						padding: "24px",
					}}
				>
					<Tabs defaultValue="recent">
						<TabList>
							<Tab value="recent">최근 주문</Tab>
							<Tab value="pending">처리 대기</Tab>
							<Tab value="completed">완료</Tab>
						</TabList>
						<TabPanel value="recent">
							<Stack gap={12} style={{ marginTop: 16 }}>
								{[
									{ id: "#1024", customer: "김민준", amount: "₩42,000", status: "processing" },
									{ id: "#1023", customer: "이서연", amount: "₩18,500", status: "completed" },
									{ id: "#1022", customer: "박지훈", amount: "₩67,000", status: "pending" },
								].map((order) => (
									<Stack
										key={order.id}
										direction="horizontal"
										align="center"
										justify="between"
										gap={0}
										style={{
											padding: "12px 16px",
											background: "#F2F5F8",
											borderRadius: 8,
										}}
									>
										<Stack direction="horizontal" gap={12} align="center">
											<Avatar name={order.customer} size="sm" />
											<Stack gap={2}>
												<span style={{ fontSize: 14, fontWeight: 600 }}>{order.customer}</span>
												<span style={{ fontSize: 12, color: "#888" }}>{order.id}</span>
											</Stack>
										</Stack>
										<Stack direction="horizontal" gap={12} align="center">
											<span style={{ fontSize: 14, fontWeight: 600 }}>{order.amount}</span>
											<Tag
												variant={
													order.status === "completed"
														? "success"
														: order.status === "processing"
															? "navy"
															: "warning"
												}
											>
												{order.status === "completed"
													? "완료"
													: order.status === "processing"
														? "처리중"
														: "대기"}
											</Tag>
										</Stack>
									</Stack>
								))}
							</Stack>
						</TabPanel>
						<TabPanel value="pending">
							<EmptyState
								title="처리 대기 주문 없음"
								description="모든 주문이 처리되었습니다."
								style={{ padding: "32px 0" }}
							/>
						</TabPanel>
						<TabPanel value="completed">
							<EmptyState
								title="완료된 주문"
								description="오늘 완료된 주문이 없습니다."
								style={{ padding: "32px 0" }}
							/>
						</TabPanel>
					</Tabs>
				</div>
			</div>
		</div>
	),
};
