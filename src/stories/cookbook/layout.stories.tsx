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
import { borderWidth } from "src/styles/border-width";
import { iconSize } from "src/styles/icon";
import { radius } from "src/styles/radius";
import { spacing } from "src/styles/spacing";
import { typography } from "src/styles/typography";
import { Avatar } from "src/ui/display/avatar";
import { Badge } from "src/ui/display/badge";
import { Card } from "src/ui/display/card";
import { Chip } from "src/ui/display/chip";
import { Hero } from "src/ui/display/hero";
import { Stat } from "src/ui/display/stat";
import { Table } from "src/ui/display/table";
import { Button } from "src/ui/general/button";
import { Container } from "src/ui/layout/container";
import { Grid } from "src/ui/layout/grid";
import { PageHeader } from "src/ui/layout/page-header";
import { Section } from "src/ui/layout/section";
import { Stack } from "src/ui/layout/stack";
import { Breadcrumb } from "src/ui/navigation/breadcrumb";
import { Sidebar, SidebarItem, SidebarSection } from "src/ui/navigation/sidebar";
import { Tab, TabList, TabPanel, Tabs } from "src/ui/navigation/tabs";

const meta: Meta = {
	title: "Cookbook/Layout Patterns",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					'**페이지의 골격**을 만드는 방법입니다. 마케팅 페이지, 사이드바 화면, 대시보드, 목록 페이지 네 가지를 다룹니다.\n\n공통 재료는 `Container`(최대 폭) · `Grid`/`Stack`(내부 배치) 셋이고, 화면 유형에 따라 바깥이 달라집니다 - 마케팅 페이지만 `Section` 으로 위아래 여백을 잡고, 사이드바 화면은 `Sidebar` 로 시작하며, 대시보드·목록은 `Container` 부터 엽니다.\n\n글자·간격·모서리는 숫자 대신 토큰을 씁니다 - `style={{ ...typography.label.medium, color: "var(--bt-color-text-body)" }}` 처럼 `typography`·`spacing`·`radius` 를 펼치고 색은 `--bt-color-*` 변수로 받습니다.',
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── Marketing Hero + Feature Grid ──────────────────────────────────────────

export const MarketingHeroFeatureGrid: Story = {
	name: "마케팅: 히어로 + 기능 그리드",
	parameters: {
		docs: {
			description: {
				story:
					"랜딩·소개 페이지의 첫 화면입니다. `Hero` 가 큰 제목과 배경을, `Section` 이 위아래 여백을, `Container` 가 최대 폭을, `Grid` 가 기능 카드의 열 수를 갖습니다.\n\n이 네 개의 역할 분담이 레이아웃 패턴의 기본형입니다 - 나머지 스토리도 같은 조합을 변형한 것입니다.",
			},
		},
	},
	render: () => (
		<div style={{ minHeight: "100vh", background: "var(--bt-color-bg-solid)" }}>
			<Hero
				eyebrow="신규 출시"
				title="더 빠르게, 더 단순하게"
				subtitle="Bigtablet으로 매장 운영의 복잡함을 한 줄로 정리하세요."
				overlay="dark"
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
									...typography.display.smallMedium,
									color: "var(--bt-color-text-heading)",
									textAlign: "center",
								}}
							>
								필요한 모든 것이 하나의 화면에
							</h2>
							<p
								style={{
									margin: 0,
									...typography.body.large,
									color: "var(--bt-color-text-body)",
									textAlign: "center",
									maxWidth: 520,
								}}
							>
								주문, 결제, 재고, 직원까지 - 매장의 흐름을 끊김 없이 연결합니다.
							</p>
						</Stack>

						<Grid cols="auto" minColWidth="280px" gap={24}>
							{[
								{
									icon: <Zap size={iconSize.lg} />,
									title: "1초 만에 결제",
									desc: "QR·NFC·카드 모두 지원하는 통합 결제 모듈",
								},
								{
									icon: <ShieldCheck size={iconSize.lg} />,
									title: "안전한 데이터",
									desc: "ISO 27001 인증 · 한국 리전 전용 클라우드",
								},
								{
									icon: <Sparkles size={iconSize.lg} />,
									title: "AI 매출 인사이트",
									desc: "이상 패턴 자동 감지로 사고를 사전에 예방",
								},
								{
									icon: <Briefcase size={iconSize.lg} />,
									title: "직원·근태 관리",
									desc: "스케줄·급여·평가까지 한 번에",
								},
								{
									icon: <LineChart size={iconSize.lg} />,
									title: "실시간 대시보드",
									desc: "오늘의 매출과 트렌드를 한눈에",
								},
								{
									icon: <TrendingUp size={iconSize.lg} />,
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
												width: spacing["40"],
												height: spacing["40"],
												borderRadius: radius.lg,
												background: "var(--bt-color-accent-default)",
												color: "var(--bt-color-accent-on-surface)",
											}}
										>
											{feature.icon}
										</div>
										<h3
											style={{
												margin: 0,
												...typography.title.mediumMedium,
												color: "var(--bt-color-text-heading)",
											}}
										>
											{feature.title}
										</h3>
										<p
											style={{
												margin: 0,
												...typography.body.small,
												color: "var(--bt-color-text-body)",
											}}
										>
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
	parameters: {
		docs: {
			description: {
				story:
					"로그인 뒤의 관리 화면 골격입니다. `Sidebar` 가 접힘 상태를 스스로 갖고 있어 화면은 메뉴 목록과 선택된 항목만 정합니다.\n\n`SidebarSection` 으로 메뉴를 묶고, 알림 개수 같은 숫자는 `Badge` 로 붙입니다.",
			},
		},
	},
	render: () => (
		<div
			style={{ display: "flex", minHeight: "100vh", background: "var(--bt-color-bg-solid-dim)" }}
		>
			<Sidebar
				header={
					// 로고 경로는 iframe 기준 상대경로다 — 절대경로(`/images/…`)로 되돌리면 GH Pages
					// 하위 경로(`/bigtablet-design-system/`)를 건너뛰어 404 가 난다. 로컬은 루트 서빙이라 안 드러난다.
					<img
						src="images/logo/bigtablet.png"
						alt="Bigtablet"
						height={28}
						style={{ display: "block" }}
					/>
				}
				headerCollapsed={
					<img
						src="images/logo/favicon.png"
						alt="Bigtablet"
						width={28}
						height={28}
						style={{ display: "block", borderRadius: radius.sm }}
					/>
				}
				footer={
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: spacing["8"],
							padding: `${spacing["8"]} ${spacing["12"]}`,
						}}
					>
						<Avatar name="sangmin" size="sm" />
						<div style={{ display: "grid", gap: spacing["2"], minWidth: 0 }}>
							<strong
								style={{ ...typography.label.mediumMedium, color: "var(--bt-color-text-heading)" }}
							>
								sangmin
							</strong>
							<span style={{ ...typography.label.small, color: "var(--bt-color-text-body)" }}>
								sangmin@bigtablet.com
							</span>
						</div>
					</div>
				}
			>
				<SidebarSection label="메인">
					<SidebarItem icon={<Home size={iconSize.lg} />} active>
						홈
					</SidebarItem>
					<SidebarItem
						icon={<Receipt size={iconSize.lg} />}
						trailing={<Badge shape="count" variant="accent" count={3} />}
					>
						주문
					</SidebarItem>
					<SidebarItem icon={<BarChart3 size={iconSize.lg} />}>매출</SidebarItem>
				</SidebarSection>
				<SidebarSection label="관리">
					<SidebarItem icon={<Users size={iconSize.lg} />}>직원</SidebarItem>
					<SidebarItem icon={<Settings size={iconSize.lg} />}>설정</SidebarItem>
				</SidebarSection>
			</Sidebar>

			<div style={{ flex: 1, padding: spacing["32"], overflowY: "auto" }}>
				<Stack gap={24}>
					<PageHeader
						title="홈"
						description="오늘 매장의 흐름을 빠르게 확인하세요."
						style={{ marginBottom: 0 }}
					/>

					<Card bordered padding="lg" shadow="sm">
						<Stack gap={12}>
							<Stack direction="horizontal" justify="between" align="center">
								<h2
									style={{
										margin: 0,
										...typography.title.mediumMedium,
										color: "var(--bt-color-text-heading)",
									}}
								>
									최근 활동
								</h2>
								<Button variant="text" size="sm">
									모두 보기
								</Button>
							</Stack>
							<p
								style={{
									margin: 0,
									...typography.body.small,
									color: "var(--bt-color-text-body)",
								}}
							>
								사이드바 + main content 영역의 기본 골격입니다. Sidebar 컴포넌트와 우측 Stack 기반
								레이아웃을 조합해 어드민·관리자 페이지를 빠르게 시작할 수 있습니다.
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
		tone: "positive" as const,
		icon: <TrendingUp size={iconSize.sm} />,
	},
	{
		label: "신규 주문",
		value: "47",
		delta: "+8건",
		tone: "positive" as const,
		icon: <Receipt size={iconSize.sm} />,
	},
	{
		label: "방문 고객",
		value: "182",
		delta: "+5%",
		tone: "positive" as const,
		icon: <Users size={iconSize.sm} />,
	},
	{
		label: "객단가",
		value: "₩7,054",
		delta: "-2%",
		tone: "negative" as const,
		icon: <BarChart3 size={iconSize.sm} />,
	},
];

export const TwoColumnDashboard: Story = {
	name: "Two Column 대시보드",
	parameters: {
		docs: {
			description: {
				story:
					'넓은 주 영역과 좁은 보조 영역으로 나눈 대시보드입니다. 폭이 다른 두 열은 `Grid cols={3}` 을 깔고 주 영역에만 `gridColumn: "span 2"` 를 줘서 2:1 로 만듭니다.\n\n열 폭이 같다면 `Grid cols={2}` 로 충분합니다 - span 을 쓸 필요가 없습니다.',
			},
		},
	},
	render: () => (
		<div
			style={{
				padding: spacing["32"],
				background: "var(--bt-color-bg-solid-dim)",
				minHeight: "100vh",
			}}
		>
			<Container size="xl">
				<Stack gap={24}>
					<PageHeader
						title="오늘의 매출"
						description="2026년 5월 20일 화요일 · 영업 중"
						actions={
							<>
								<Button variant="outline" size="sm">
									기간 선택
								</Button>
								<Button variant="filled" size="sm">
									리포트 내보내기
								</Button>
							</>
						}
						style={{ marginBottom: 0 }}
					/>

					{/* 상단 stat cards (4-column → 모바일에선 1열 자동) */}
					<Grid cols={4} gap={16}>
						{STAT_CARDS.map((stat) => (
							<Card key={stat.label} bordered padding="md" shadow="sm">
								<Stat
									label={stat.label}
									icon={stat.icon}
									value={stat.value}
									delta={stat.delta}
									deltaTone={stat.tone}
								/>
							</Card>
						))}
					</Grid>

					{/* 차트 + 사이드 정보 */}
					<Grid cols={3} gap={16}>
						<div style={{ gridColumn: "span 2" }}>
							<Card bordered padding="lg" shadow="sm">
								<Stack gap={16}>
									<Stack direction="horizontal" justify="between" align="center">
										<h2
											style={{
												margin: 0,
												...typography.title.mediumMedium,
												color: "var(--bt-color-text-heading)",
											}}
										>
											시간대별 매출
										</h2>
										<Chip type="static" size="sm" tone="success" label="실시간" />
									</Stack>
									{/* 차트 자리 표시자. `aria-label` 은 이름을 가질 수 있는 role 에서만 유효하다 -
									    그냥 div 에 붙이면 이름이 어디에도 노출되지 않는다. */}
									<div
										role="img"
										aria-label="매출 차트 영역"
										style={{
											height: 240,
											borderRadius: radius.lg,
											background: "var(--bt-color-bg-solid-dim)",
											border: `${borderWidth.standard} dashed var(--bt-color-border-default)`,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											color: "var(--bt-color-text-caption)",
											...typography.label.medium,
										}}
									>
										차트 자리 (Recharts / Tremor 등으로 대체)
									</div>
								</Stack>
							</Card>
						</div>
						<Card bordered padding="lg" shadow="sm">
							<Stack gap={16}>
								<h2
									style={{
										margin: 0,
										...typography.title.mediumMedium,
										color: "var(--bt-color-text-heading)",
									}}
								>
									Best 메뉴
								</h2>
								<Stack gap={12}>
									{[
										{ name: "아메리카노", count: 42 },
										{ name: "라떼", count: 28 },
										{ name: "샌드위치", count: 15 },
										{ name: "쿠키", count: 12 },
									].map((item, idx) => (
										<Stack key={item.name} direction="horizontal" justify="between" align="center">
											<Stack direction="horizontal" gap={12} align="center">
												<span
													style={{
														width: spacing["24"],
														height: spacing["24"],
														borderRadius: radius.full,
														background:
															idx === 0
																? "var(--bt-color-accent-default)"
																: "var(--bt-color-bg-solid-dim)",
														color:
															idx === 0
																? "var(--bt-color-accent-on-surface)"
																: "var(--bt-color-text-body)",
														...typography.label.smallMedium,
														display: "inline-flex",
														alignItems: "center",
														justifyContent: "center",
													}}
												>
													{idx + 1}
												</span>
												<span
													style={{
														...typography.body.smallMedium,
														color: "var(--bt-color-text-heading)",
													}}
												>
													{item.name}
												</span>
											</Stack>
											<span
												style={{
													...typography.label.mediumMedium,
													color: "var(--bt-color-text-body)",
												}}
											>
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

const STATUS_LABELS: Record<
	string,
	{ label: string; tone: "success" | "accent" | "warning" | "error" }
> = {
	completed: { label: "완료", tone: "success" },
	processing: { label: "처리중", tone: "accent" },
	pending: { label: "대기", tone: "warning" },
	cancelled: { label: "취소", tone: "error" },
};

export const ListPage: Story = {
	name: "리스트 페이지",
	parameters: {
		docs: {
			description: {
				story:
					"관리자 목록 화면입니다. `Breadcrumb` 으로 현재 위치를, `Tabs` 로 상태별 묶음을, `Table` 로 데이터를 보여 줍니다.\n\n검색·선택 액션·페이지네이션까지 필요하면 이 조합을 직접 짜는 대신 `DataView` 를 쓰세요 - Cookbook/Data Display 의 사용자 목록 예시에 있습니다.",
			},
		},
	},
	render: () => (
		<div
			style={{
				padding: spacing["32"],
				background: "var(--bt-color-bg-solid-dim)",
				minHeight: "100vh",
			}}
		>
			<Container size="xl">
				<Stack gap={20}>
					<PageHeader
						breadcrumb={
							<Breadcrumb
								items={[
									{ label: "홈", href: "#" },
									{ label: "주문 관리", href: "#" },
									{ label: "주문 목록" },
								]}
							/>
						}
						title="주문 목록"
						description="오늘 들어온 모든 주문을 한 곳에서 확인하세요."
						actions={
							<Button variant="filled" size="md">
								새 주문 등록
							</Button>
						}
						style={{ marginBottom: 0 }}
					/>

					<Card bordered padding="none" shadow="sm">
						<div style={{ padding: `${spacing["16"]} ${spacing["16"]} 0` }}>
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
														<span style={{ ...typography.body.smallMedium, whiteSpace: "nowrap" }}>
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
									<div style={{ padding: `${spacing["24"]} 0` }}>
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
									<div style={{ padding: `${spacing["24"]} 0` }}>
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
									<div style={{ padding: `${spacing["24"]} 0` }}>
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
