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
import { Avatar } from "../../ui/display/avatar";
import { Card } from "../../ui/display/card";
import { Chip } from "../../ui/display/chip";
import { DataView } from "../../ui/display/data-view";
import { Divider } from "../../ui/display/divider";
import type { TableColumn } from "../../ui/display/table";
import { Timeline, type TimelineItem } from "../../ui/display/timeline";
import { Grid } from "../../ui/layout/grid";
import { PageHeader } from "../../ui/layout/page-header";
import { Stack } from "../../ui/layout/stack";

const meta: Meta = {
	title: "Cookbook/Data Display",
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"**데이터 디스플레이 cookbook** - 사용자 목록·상태 칩·통계 카드·타임라인 등 데이터를 보여주는 패턴 모음입니다.\n\nAvatar + Badge + Chip + Menu 조합으로 흔히 쓰는 디스플레이 구조를 빠르게 복붙해 시작할 수 있도록 정리했습니다.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── User List ──────────────────────────────────────────────────────────────

const USERS = [
	{
		name: "박상민",
		role: "Designer",
		email: "sangmin@bigtablet.com",
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
					"`DataView` 한 줄로 검색·표·선택 액션·페이지네이션과 네 상태 분기(loading / error / empty / data)를 얻는다. 이전에는 `Card` + `Stack` + `div` 로 목록을 손으로 조립하며 padding·fontSize·fontWeight 를 직접 적었다.",
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
						tone={u.status === "online" ? "accent" : "default"}
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
					"`Timeline` 이 연결선·상태색·순서(`<ol>`)를 소유한다. 예전에는 이 화면이 `color-mix` 를 포함한 인라인 스타일 40여 줄로 인디케이터를 직접 그렸다.",
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
