import type { Meta, StoryObj } from "@storybook/react";
import {
	CheckCircle2,
	Circle,
	Clock,
	Package,
	TrendingDown,
	TrendingUp,
	Truck,
} from "lucide-react";
import { useState } from "react";
import { Avatar } from "src/ui/display/avatar";
import { Card } from "src/ui/display/card";
import { Chip } from "src/ui/display/chip";
import { DataView } from "src/ui/display/data-view";
import { Divider } from "src/ui/display/divider";
import type { TableColumn } from "src/ui/display/table";
import { Timeline, type TimelineItem } from "src/ui/display/timeline";
import { Grid } from "src/ui/layout/grid";
import { PageHeader } from "src/ui/layout/page-header";
import { Stack } from "src/ui/layout/stack";

const meta: Meta = {
	title: "Cookbook/Data Display",
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"**데이터를 보여주는 화면 모음**입니다. 사용자 목록, 상태 칩, 통계 카드, 주문 타임라인 네 가지를 다룹니다.\n\n각 스토리의 코드는 그대로 복사해 시작점으로 쓸 수 있습니다. 아래 Show code 를 열어 보세요.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── User List ──────────────────────────────────────────────────────────────

const USERS = [
	{
		name: "나최강",
		role: "Designer",
		email: "choigang@bigtablet.com",
		status: "online" as const,
	},
	{
		name: "김민준",
		role: "Engineer",
		email: "minjun@bigtablet.com",
		status: "online" as const,
	},
	{
		name: "이서연",
		role: "PM",
		email: "seoyeon@bigtablet.com",
		status: "away" as const,
	},
	{
		name: "박지훈",
		role: "Engineer",
		email: "jihoon@bigtablet.com",
		status: "offline" as const,
	},
	{
		name: "최유진",
		role: "Marketing",
		email: "yujin@bigtablet.com",
		status: "online" as const,
	},
];

const STATUS_LABEL = {
	online: "활동 중",
	away: "자리 비움",
	offline: "오프라인",
};

export const UserList: Story = {
	name: "사용자 목록",
	parameters: {
		docs: {
			description: {
				story:
					"목록 화면 하나를 `DataView` 한 컴포넌트로 만듭니다. 검색, 표, 선택 액션, 페이지네이션과 네 가지 상태(로딩 / 오류 / 빈 목록 / 데이터)를 모두 갖고 있습니다.\n\n화면이 정하는 것은 `columns` 와 데이터뿐입니다 - 상태별로 무엇을 그릴지 분기하지 않아도 됩니다.",
			},
		},
	},
	render: () => {
		const [search, setSearch] = useState("");
		const [page, setPage] = useState(1);

		const rows = USERS.filter(
			(u) => !search || u.name.includes(search) || u.email.includes(search),
		);

		const columns: TableColumn<(typeof USERS)[number]>[] = [
			{
				key: "name",
				header: "이름",
				sortable: true,
				render: (u) => (
					<Stack direction="horizontal" gap={12} align="center">
						<Avatar name={u.name} size="sm" />
						{u.name}
					</Stack>
				),
			},
			{ key: "email", header: "이메일", render: (u) => u.email },
			{
				key: "status",
				header: "상태",
				width: "110px",
				render: (u) => (
					<Chip
						type="static"
						size="sm"
						tone={u.status === "online" ? "success" : "accent"}
						label={STATUS_LABEL[u.status]}
					/>
				),
			},
		];

		return (
			<div style={{ width: 640 }}>
				<DataView
					query={{ data: rows }}
					columns={columns}
					rowKey={(u) => u.email}
					ariaLabel="팀 멤버"
					toolbar={{
						search: true,
						searchValue: search,
						onSearchChange: (v) => {
							setSearch(v);
							setPage(1);
						},
						searchPlaceholder: "이름 · 이메일 검색",
					}}
					selectionActions={[
						{ label: "내보내기", onRun: () => {} },
						{ label: "삭제", danger: true, onRun: () => {} },
					]}
					pagination={{ page, totalPages: 2, onPageChange: setPage }}
				/>
			</div>
		);
	},
};

export const StatusBadgesRow: Story = {
	name: "상태 칩 모음",
	parameters: {
		docs: {
			description: {
				story:
					'주문·결제·재고처럼 **상태를 한 눈에 구분해야 할 때** 씁니다. 색은 직접 고르지 말고 의미로 고르세요 - `tone` 이 성공/경고/오류의 색을 이미 갖고 있습니다.\n\n조작할 수 없는 표시용 칩이라 `type="static"` 입니다. 누르거나 지울 수 있어야 하면 `type` 을 바꿉니다.',
			},
		},
	},
	render: () => (
		<Card bordered padding="lg" shadow="sm" style={{ width: 560 }}>
			<Stack gap={24}>
				<Stack gap={8}>
					<span
						style={{
							fontSize: 12,
							fontWeight: 600,
							color: "var(--bt-color-text-caption)",
							textTransform: "uppercase",
							letterSpacing: "0.04em",
						}}
					>
						주문 상태
					</span>
					<Stack direction="horizontal" gap={8} wrap="wrap">
						<Chip type="static" tone="default" label="대기" />
						<Chip type="static" tone="info" label="접수" />
						<Chip type="static" tone="accent" label="처리중" />
						<Chip type="static" tone="success" label="완료" />
						<Chip type="static" tone="warning" label="보류" />
						<Chip type="static" tone="error" label="취소" />
					</Stack>
				</Stack>

				<Stack gap={8}>
					<span
						style={{
							fontSize: 12,
							fontWeight: 600,
							color: "var(--bt-color-text-caption)",
							textTransform: "uppercase",
							letterSpacing: "0.04em",
						}}
					>
						결제 상태
					</span>
					<Stack direction="horizontal" gap={8} wrap="wrap">
						<Chip type="static" tone="success" label="결제 완료" />
						<Chip type="static" tone="warning" label="부분 환불" />
						<Chip type="static" tone="error" label="환불" />
						<Chip type="static" tone="default" label="현장 결제" />
					</Stack>
				</Stack>

				<Stack gap={8}>
					<span
						style={{
							fontSize: 12,
							fontWeight: 600,
							color: "var(--bt-color-text-caption)",
							textTransform: "uppercase",
							letterSpacing: "0.04em",
						}}
					>
						재고 상태
					</span>
					<Stack direction="horizontal" gap={8} wrap="wrap">
						<Chip type="static" tone="success" label="충분" />
						<Chip type="static" tone="warning" label="주의" />
						<Chip type="static" tone="error" label="품절 임박" />
						<Chip type="static" tone="default" label="단종" />
					</Stack>
				</Stack>
			</Stack>
		</Card>
	),
};

// ─── Stat Cards ─────────────────────────────────────────────────────────────

const STATS = [
	{
		label: "오늘 매출",
		value: "₩1,284,000",
		delta: "+12.4%",
		positive: true,
		caption: "지난주 같은 요일 대비",
		icon: <TrendingUp size={20} />,
	},
	{
		label: "신규 주문",
		value: "47건",
		delta: "+8.0%",
		positive: true,
		caption: "전일 대비",
		icon: <Package size={20} />,
	},
	{
		label: "평균 대기 시간",
		value: "3분 12초",
		delta: "-18초",
		positive: true,
		caption: "전일 대비",
		icon: <Clock size={20} />,
	},
	{
		label: "반품률",
		value: "1.4%",
		delta: "+0.3%p",
		positive: false,
		caption: "지난달 대비",
		icon: <TrendingDown size={20} />,
	},
];

export const StatCards: Story = {
	name: "통계 카드",
	parameters: {
		docs: {
			description: {
				story:
					"대시보드 첫 화면의 **숫자 요약 줄**입니다. `Grid` 가 열 수를, `Card` 가 테두리와 여백을 갖고, 증감 화살표만 화면이 정합니다.\n\n모바일에서는 `Grid` 가 자동으로 1열로 접힙니다(`singleColOnMobile` 기본값).",
			},
		},
	},
	render: () => (
		<Grid cols={2} gap={16} style={{ width: 640 }}>
			{STATS.map((stat) => (
				<Card key={stat.label} bordered padding="lg" shadow="sm">
					<Stack gap={12}>
						<Stack direction="horizontal" justify="between" align="center">
							<span
								style={{ fontSize: 13, color: "var(--bt-color-text-caption)", fontWeight: 500 }}
							>
								{stat.label}
							</span>
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									justifyContent: "center",
									width: 36,
									height: 36,
									borderRadius: 10,
									background: "var(--bt-color-bg-solid-dim)",
									color: "var(--bt-color-text-body)",
								}}
							>
								{stat.icon}
							</span>
						</Stack>
						<span
							style={{
								fontSize: 28,
								fontWeight: 700,
								color: "var(--bt-color-text-heading)",
								letterSpacing: "-0.02em",
							}}
						>
							{stat.value}
						</span>
						<Stack direction="horizontal" gap={8} align="center">
							<span
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 4,
									fontSize: 12,
									fontWeight: 700,
									padding: "2px 8px",
									borderRadius: 999,
									background: stat.positive
										? "var(--bt-color-status-success-container)"
										: "var(--bt-color-status-error-container)",
									color: stat.positive
										? "var(--bt-color-status-success-on-container)"
										: "var(--bt-color-status-error-on-container)",
								}}
							>
								{stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
								{stat.delta}
							</span>
							<span style={{ fontSize: 12, color: "var(--bt-color-text-caption)" }}>
								{stat.caption}
							</span>
						</Stack>
					</Stack>
				</Card>
			))}
		</Grid>
	),
};

// ─── Order Timeline ─────────────────────────────────────────────────────────

const TIMELINE: TimelineItem[] = [
	{
		id: 1,
		title: "주문 접수",
		time: "오후 1:32",
		description: "고객이 #1024 주문을 결제했습니다.",
		status: "done",
		icon: <CheckCircle2 size={16} />,
	},
	{
		id: 2,
		title: "픽업 준비",
		time: "오후 1:35",
		description: "주방에서 메뉴 준비를 시작했어요.",
		status: "done",
		icon: <CheckCircle2 size={16} />,
	},
	{
		id: 3,
		title: "배송 출발",
		time: "오후 1:48",
		description: "라이더가 매장에서 픽업 후 이동 중입니다.",
		status: "active",
		icon: <Truck size={16} />,
	},
	{
		id: 4,
		title: "배송 완료",
		time: "예상 오후 2:05",
		description: "고객 주소지에 도착 예정.",
		icon: <Circle size={16} />,
	},
];

export const OrderTimeline: Story = {
	name: "주문 타임라인",
	parameters: {
		docs: {
			description: {
				story:
					"주문 처리처럼 **시간 순서가 의미를 갖는 데이터**에 씁니다. 항목을 잇는 선, 단계별 상태색, 순서 있는 목록(`<ol>`) 마크업을 `Timeline` 이 갖습니다.\n\n화면은 항목 배열만 넘깁니다.",
			},
		},
	},
	render: () => (
		<Card bordered padding="lg" shadow="sm" style={{ maxWidth: 480 }}>
			<Stack gap={16}>
				<Stack direction="horizontal" justify="between" align="center">
					<PageHeader
						title="주문 #1024"
						description="2026.05.20 · 김민준 고객"
						style={{ marginBottom: 0 }}
					/>
					<Chip type="static" tone="accent" label="배송 중" />
				</Stack>

				<Divider />

				<Timeline items={TIMELINE} />
			</Stack>
		</Card>
	),
};
