import type { Meta, StoryObj } from "@storybook/react";
import {
	BarChart3,
	Briefcase,
	Home,
	LineChart,
	Receipt,
	Settings,
	ShieldCheck,
	Sparkles,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { Avatar } from "../../ui/display/avatar";
import { Badge } from "../../ui/display/badge";
import { Breadcrumb } from "../../ui/navigation/breadcrumb";
import { Button } from "../../ui/general/button";
import { Card } from "../../ui/display/card";
import { Chip } from "../../ui/display/chip";
import { Container } from "../../ui/layout/container";
import { Grid } from "../../ui/layout/grid";
import { Hero } from "../../ui/display/hero";
import { Section } from "../../ui/layout/section";
import { Sidebar, SidebarItem, SidebarSection } from "../../ui/navigation/sidebar";
import { Stack } from "../../ui/layout/stack";
import { Tab, TabList, TabPanel, Tabs } from "../../ui/navigation/tabs";
import { Table } from "../../ui/display/table";

const meta: Meta = {
	title: "Cookbook/Layout Patterns",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"**레이아웃 패턴 cookbook** — 마케팅 페이지·대시보드·관리자 목록 등 자주 쓰는 페이지 골격을 Section / Container / Grid / Stack 조합으로 정리했습니다.\n\n페이지 단위로 복붙해 시작점으로 사용하세요.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── Marketing Hero + Feature Grid ──────────────────────────────────────────

export const MarketingHeroFeatureGrid: Story = {
	name: "마케팅: 히어로 + 기능 그리드",
	render: () => (
		<div style={{ minHeight: "100vh", background: "#fff" }}>
			<Hero
				eyebrow="신규 출시"
				title="더 빠르게, 더 단순하게"
				subtitle="Bigtablet으로 매장 운영의 복잡함을 한 줄로 정리하세요."
				overlay="navy"
				height="lg"
				align="center"
				primaryAction={{ label: "무료로 시작하기", onClick: () => {} }}
				secondaryAction={{ label: "기능 살펴보기", onClick: () => {} }}
			/>

			<Section spacing="lg" bg="default">
				<Container size="xl">
					<Stack gap={32}>
						<Stack gap={8} align="center">
							<Chip type="static" tone="accent" label="핵심 가치" />
							<h2
								style={{
									margin: 0,
									fontSize: 32,
									fontWeight: 700,
									color: "#121212",
									textAlign: "center",
									letterSpacing: "-0.02em",
								}}
							>
								필요한 모든 것이 하나의 화면에
							</h2>
							<p
								style={{
									margin: 0,
									fontSize: 16,
									color: "#666",
									textAlign: "center",
									maxWidth: 520,
								}}
							>
								주문, 결제, 재고, 직원까지 — 매장의 흐름을 끊김 없이 연결합니다.
							</p>
						</Stack>

						<Grid cols="auto" minColWidth="280px" gap={24}>
							{[
								{
									icon: <Zap size={22} />,
									title: "1초 만에 결제",
									desc: "QR·NFC·카드 모두 지원하는 통합 결제 모듈",
								},
								{
									icon: <ShieldCheck size={22} />,
									title: "안전한 데이터",
									desc: "ISO 27001 인증 · 한국 리전 전용 클라우드",
								},
								{
									icon: <Sparkles size={22} />,
									title: "AI 매출 인사이트",
									desc: "이상 패턴 자동 감지로 사고를 사전에 예방",
								},
								{
									icon: <Briefcase size={22} />,
									title: "직원·근태 관리",
									desc: "스케줄·급여·평가까지 한 번에",
								},
								{
									icon: <LineChart size={22} />,
									title: "실시간 대시보드",
									desc: "오늘의 매출과 트렌드를 한눈에",
								},
								{
									icon: <TrendingUp size={22} />,
									title: "성장 리포트",
									desc: "주간·월간 리포트를 이메일로 자동 발송",
								},
							].map((feature) => (
								<Card key={feature.title} bordered padding="lg" shadow="sm">
									<Stack gap={12}>
										<div
											style={{
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												width: 44,
												height: 44,
												borderRadius: 12,
												background:
													"linear-gradient(135deg, #47555E 0%, #303841 100%)",
												color: "#fff",
											}}
										>
											{feature.icon}
										</div>
										<h3
											style={{
												margin: 0,
												fontSize: 16,
												fontWeight: 700,
												color: "#121212",
											}}
										>
											{feature.title}
										</h3>
										<p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.55 }}>
											{feature.desc}
										</p>
									</Stack>
								</Card>
							))}
						</Grid>
					</Stack>
				</Container>
			</Section>
		</div>
	),
};

// ─── Sidebar Layout ─────────────────────────────────────────────────────────

export const SidebarLayout: Story = {
	name: "사이드바 레이아웃",
	render: () => (
		<div style={{ display: "flex", minHeight: "100vh", background: "#F2F5F8" }}>
			<Sidebar
				header={
					<div style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: "-0.02em" }}>
						Bigtablet
					</div>
				}
			>
				<SidebarSection label="메인">
					<SidebarItem icon={<Home size={20} />} active>
						홈
					</SidebarItem>
					<SidebarItem
						icon={<Receipt size={20} />}
						trailing={<Badge shape="count" variant="accent" count={3} />}
					>
						주문
					</SidebarItem>
					<SidebarItem icon={<BarChart3 size={20} />}>매출</SidebarItem>
				</SidebarSection>
				<SidebarSection label="관리">
					<SidebarItem icon={<Users size={20} />}>직원</SidebarItem>
					<SidebarItem icon={<Settings size={20} />}>설정</SidebarItem>
				</SidebarSection>
			</Sidebar>

			<div style={{ flex: 1, padding: 32, overflowY: "auto" }}>
				<Stack gap={24}>
					<Stack gap={4}>
						<h1
							style={{
								margin: 0,
								fontSize: 24,
								fontWeight: 700,
								color: "#121212",
								letterSpacing: "-0.02em",
							}}
						>
							홈
						</h1>
						<p style={{ margin: 0, fontSize: 14, color: "#666" }}>
							오늘 매장의 흐름을 빠르게 확인하세요.
						</p>
					</Stack>

					<Card bordered padding="lg" shadow="sm">
						<Stack gap={12}>
							<Stack direction="horizontal" justify="between" align="center">
								<h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#121212" }}>
									최근 활동
								</h2>
								<Button variant="text" size="sm">
									모두 보기
								</Button>
							</Stack>
							<p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
								사이드바 + main content 영역의 기본 골격입니다. Sidebar 컴포넌트와 우측 Stack
								기반 레이아웃을 조합해 어드민·관리자 페이지를 빠르게 시작할 수 있습니다.
							</p>
						</Stack>
					</Card>
				</Stack>
			</div>
		</div>
	),
};

// ─── Two-column Dashboard ───────────────────────────────────────────────────

const STAT_CARDS = [
	{
		label: "오늘 매출",
		value: "₩1,284,000",
		delta: "+12%",
		positive: true,
		icon: <TrendingUp size={20} />,
	},
	{
		label: "신규 주문",
		value: "47",
		delta: "+8건",
		positive: true,
		icon: <Receipt size={20} />,
	},
	{
		label: "방문 고객",
		value: "182",
		delta: "+5%",
		positive: true,
		icon: <Users size={20} />,
	},
	{
		label: "객단가",
		value: "₩7,054",
		delta: "-2%",
		positive: false,
		icon: <BarChart3 size={20} />,
	},
];

export const TwoColumnDashboard: Story = {
	name: "투-컬럼 대시보드",
	render: () => (
		<div style={{ padding: 32, background: "#F2F5F8", minHeight: "100vh" }}>
			<Container size="xl">
				<Stack gap={24}>
					<Stack direction="horizontal" justify="between" align="center">
						<Stack gap={4}>
							<h1
								style={{
									margin: 0,
									fontSize: 24,
									fontWeight: 700,
									color: "#121212",
									letterSpacing: "-0.02em",
								}}
							>
								오늘의 매출
							</h1>
							<p style={{ margin: 0, fontSize: 14, color: "#666" }}>
								2026년 5월 20일 화요일 · 영업 중
							</p>
						</Stack>
						<Stack direction="horizontal" gap={8}>
							<Button variant="outline" size="sm">
								기간 선택
							</Button>
							<Button variant="filled" size="sm">
								리포트 내보내기
							</Button>
						</Stack>
					</Stack>

					{/* 상단 stat cards (4-column → 모바일에선 1열 자동) */}
					<Grid cols={4} gap={16}>
						{STAT_CARDS.map((stat) => (
							<Card key={stat.label} bordered padding="md" shadow="sm">
								<Stack gap={12}>
									<Stack direction="horizontal" justify="between" align="center">
										<span style={{ fontSize: 13, color: "#888" }}>{stat.label}</span>
										<span style={{ color: "#47555E" }}>{stat.icon}</span>
									</Stack>
									<span style={{ fontSize: 24, fontWeight: 700, color: "#121212" }}>
										{stat.value}
									</span>
									<span
										style={{
											fontSize: 12,
											fontWeight: 600,
											color: stat.positive ? "#047857" : "#B91C1C",
										}}
									>
										{stat.delta}
									</span>
								</Stack>
							</Card>
						))}
					</Grid>

					{/* 차트 + 사이드 정보 */}
					<Grid cols={3} gap={16}>
						<div style={{ gridColumn: "span 2" }}>
							<Card bordered padding="lg" shadow="sm">
								<Stack gap={16}>
									<Stack direction="horizontal" justify="between" align="center">
										<h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#121212" }}>
											시간대별 매출
										</h2>
										<Chip type="static" size="sm" tone="success" label="실시간" />
									</Stack>
									<div
										aria-label="매출 차트 영역"
										style={{
											height: 240,
											borderRadius: 12,
											background:
												"linear-gradient(180deg, rgba(122, 165, 210, 0.10) 0%, rgba(122, 165, 210, 0) 100%)",
											border: "1px dashed #CBD5E1",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "#94A3B8",
											fontSize: 13,
										}}
									>
										차트 자리 (Recharts / Tremor 등으로 대체)
									</div>
								</Stack>
							</Card>
						</div>
						<Card bordered padding="lg" shadow="sm">
							<Stack gap={16}>
								<h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#121212" }}>
									Best 메뉴
								</h2>
								<Stack gap={12}>
									{[
										{ name: "아메리카노", count: 42 },
										{ name: "라떼", count: 28 },
										{ name: "샌드위치", count: 15 },
										{ name: "쿠키", count: 12 },
									].map((item, idx) => (
										<Stack
											key={item.name}
											direction="horizontal"
											justify="between"
											align="center"
										>
											<Stack direction="horizontal" gap={12} align="center">
												<span
													style={{
														width: 24,
														height: 24,
														borderRadius: "50%",
														background: idx === 0 ? "#303841" : "#F2F5F8",
														color: idx === 0 ? "#fff" : "#666",
														fontSize: 12,
														fontWeight: 700,
														display: "inline-flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													{idx + 1}
												</span>
												<span style={{ fontSize: 14, fontWeight: 500, color: "#121212" }}>
													{item.name}
												</span>
											</Stack>
											<span style={{ fontSize: 13, color: "#666", fontWeight: 600 }}>
												{item.count}건
											</span>
										</Stack>
									))}
								</Stack>
							</Stack>
						</Card>
					</Grid>
				</Stack>
			</Container>
		</div>
	),
};

// ─── List Page ──────────────────────────────────────────────────────────────

const ORDERS = [
	{
		id: "#1024",
		customer: "김민준",
		items: "아메리카노 2 · 케이크 1",
		amount: "₩42,000",
		status: "processing",
	},
	{
		id: "#1023",
		customer: "이서연",
		items: "라떼 1",
		amount: "₩18,500",
		status: "completed",
	},
	{
		id: "#1022",
		customer: "박지훈",
		items: "샌드위치 2 · 주스 1",
		amount: "₩67,000",
		status: "pending",
	},
	{
		id: "#1021",
		customer: "최유진",
		items: "에스프레소 1",
		amount: "₩5,500",
		status: "completed",
	},
	{
		id: "#1020",
		customer: "정도윤",
		items: "쿠키 3",
		amount: "₩12,000",
		status: "cancelled",
	},
];

const STATUS_LABELS: Record<string, { label: string; tone: "success" | "accent" | "warning" | "error" }> = {
	completed: { label: "완료", tone: "success" },
	processing: { label: "처리중", tone: "accent" },
	pending: { label: "대기", tone: "warning" },
	cancelled: { label: "취소", tone: "error" },
};

export const ListPage: Story = {
	name: "리스트 페이지",
	render: () => (
		<div style={{ padding: 32, background: "#F2F5F8", minHeight: "100vh" }}>
			<Container size="xl">
				<Stack gap={20}>
					<Breadcrumb
						items={[
							{ label: "홈", href: "#" },
							{ label: "주문 관리", href: "#" },
							{ label: "주문 목록" },
						]}
					/>

					<Stack direction="horizontal" justify="between" align="center">
						<Stack gap={4}>
							<h1
								style={{
									margin: 0,
									fontSize: 24,
									fontWeight: 700,
									color: "#121212",
									letterSpacing: "-0.02em",
								}}
							>
								주문 목록
							</h1>
							<p style={{ margin: 0, fontSize: 14, color: "#666" }}>
								오늘 들어온 모든 주문을 한 곳에서 확인하세요.
							</p>
						</Stack>
						<Button variant="filled" size="md">
							새 주문 등록
						</Button>
					</Stack>

					<Card bordered padding="none" shadow="sm">
						<div style={{ padding: "16px 16px 0" }}>
							<Tabs defaultValue="all" variant="line">
								<TabList>
									<Tab value="all">전체</Tab>
									<Tab value="processing">처리중</Tab>
									<Tab value="pending">대기</Tab>
									<Tab value="completed">완료</Tab>
								</TabList>
								<TabPanel value="all">
									<Table
										columns={[
											{ key: "id", header: "주문번호", width: "120px" },
											{
												key: "customer",
												header: "고객",
												render: (row) => (
													<Stack direction="horizontal" gap={8} align="center">
														<Avatar name={row.customer} size="sm" />
														<span style={{ fontSize: 14, fontWeight: 500 }}>
															{row.customer}
														</span>
													</Stack>
												),
											},
											{ key: "items", header: "주문 항목" },
											{ key: "amount", header: "금액", align: "right", width: "120px" },
											{
												key: "status",
												header: "상태",
												width: "120px",
												render: (row) => {
													const s = STATUS_LABELS[row.status];
													return s ? (
														<Chip type="static" size="sm" tone={s.tone} label={s.label} />
													) : null;
												},
											},
										]}
										data={ORDERS}
										keyExtractor={(item) => item.id}
									/>
								</TabPanel>
								<TabPanel value="processing">
									<div style={{ padding: "24px 0" }}>
										<Table
											columns={[
												{ key: "id", header: "주문번호", width: "120px" },
												{ key: "customer", header: "고객" },
												{ key: "amount", header: "금액", align: "right" },
											]}
											data={ORDERS.filter((o) => o.status === "processing")}
											keyExtractor={(item) => item.id}
										/>
									</div>
								</TabPanel>
								<TabPanel value="pending">
									<div style={{ padding: "24px 0" }}>
										<Table
											columns={[
												{ key: "id", header: "주문번호", width: "120px" },
												{ key: "customer", header: "고객" },
												{ key: "amount", header: "금액", align: "right" },
											]}
											data={ORDERS.filter((o) => o.status === "pending")}
											keyExtractor={(item) => item.id}
										/>
									</div>
								</TabPanel>
								<TabPanel value="completed">
									<div style={{ padding: "24px 0" }}>
										<Table
											columns={[
												{ key: "id", header: "주문번호", width: "120px" },
												{ key: "customer", header: "고객" },
												{ key: "amount", header: "금액", align: "right" },
											]}
											data={ORDERS.filter((o) => o.status === "completed")}
											keyExtractor={(item) => item.id}
										/>
									</div>
								</TabPanel>
							</Tabs>
						</div>
					</Card>
				</Stack>
			</Container>
		</div>
	),
};
