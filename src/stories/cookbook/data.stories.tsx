import type { Meta, StoryObj } from "@storybook/react";
import {
	CheckCircle2,
	Circle,
	Clock,
	MoreHorizontal,
	Package,
	TrendingDown,
	TrendingUp,
	Truck,
} from "lucide-react";
import { Avatar } from "../../ui/display/avatar";
import { Badge } from "../../ui/display/badge";
import { Card } from "../../ui/display/card";
import { Chip } from "../../ui/display/chip";
import { Divider } from "../../ui/display/divider";
import { Grid } from "../../ui/layout/grid";
import { IconButton } from "../../ui/general/icon-button";
import { Menu } from "../../ui/navigation/menu";
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

const STATUS_VARIANT = {
	online: "success" as const,
	away: "warning" as const,
	offline: "neutral" as const,
};

const STATUS_LABEL = {
	online: "활동 중",
	away: "자리 비움",
	offline: "오프라인",
};

export const UserList: Story = {
	name: "사용자 목록",
	render: () => (
		<Card bordered padding="none" shadow="sm" style={{ width: 520 }}>
			<Stack gap={0}>
				<div style={{ padding: "16px 20px" }}>
					<Stack direction="horizontal" justify="between" align="center">
						<h3
							style={{
								margin: 0,
								fontSize: 16,
								fontWeight: 700,
								color: "var(--bt-color-text-heading)",
							}}
						>
							팀 멤버
						</h3>
						<Chip type="static" size="sm" tone="default" label={`${USERS.length}명`} />
					</Stack>
				</div>
				<Divider />
				<Stack gap={0}>
					{USERS.map((user, idx) => (
						<div key={user.email}>
							<Stack
								direction="horizontal"
								align="center"
								justify="between"
								gap={12}
								style={{ padding: "12px 20px" }}
							>
								<Stack direction="horizontal" gap={12} align="center">
									<span style={{ position: "relative", display: "inline-block" }}>
										<Avatar name={user.name} size="md" />
										<span
											style={{
												position: "absolute",
												right: -2,
												bottom: -2,
												width: 12,
												height: 12,
												borderRadius: "50%",
												background:
													user.status === "online"
														? "var(--bt-color-status-success)"
														: user.status === "away"
															? "var(--bt-color-status-warning)"
															: "var(--bt-color-text-caption)",
												border: "2px solid var(--bt-color-bg-solid)",
											}}
										/>
									</span>
									<Stack gap={2}>
										<Stack direction="horizontal" gap={8} align="center">
											<span style={{ fontSize: 14, fontWeight: 600, color: "var(--bt-color-text-heading)" }}>
												{user.name}
											</span>
											<Badge variant={STATUS_VARIANT[user.status]} shape="label">
												{STATUS_LABEL[user.status]}
											</Badge>
										</Stack>
										<span style={{ fontSize: 12, color: "var(--bt-color-text-caption)" }}>
											{user.role} · {user.email}
										</span>
									</Stack>
								</Stack>
								<Menu
									align="end"
									trigger={
										<IconButton
											icon={<MoreHorizontal size={18} />}
											variant="standard"
											size="sm"
											aria-label={`${user.name} 메뉴 열기`}
										/>
									}
									items={[
										{ key: "view", label: "프로필 보기" },
										{ key: "message", label: "메시지 보내기" },
										{ key: "role", label: "역할 변경" },
										{
											key: "remove",
											label: "팀에서 제외",
											destructive: true,
										},
									]}
								/>
							</Stack>
							{idx < USERS.length - 1 && <Divider />}
						</div>
					))}
				</Stack>
			</Stack>
		</Card>
	),
};

// ─── Status Badges Row ──────────────────────────────────────────────────────

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
							<span style={{ fontSize: 13, color: "var(--bt-color-text-caption)", fontWeight: 500 }}>
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
							<span style={{ fontSize: 12, color: "var(--bt-color-text-caption)" }}>{stat.caption}</span>
						</Stack>
					</Stack>
				</Card>
			))}
		</Grid>
	),
};

// ─── Order Timeline ─────────────────────────────────────────────────────────

const TIMELINE = [
	{
		id: 1,
		title: "주문 접수",
		time: "오후 1:32",
		desc: "고객이 #1024 주문을 결제했습니다.",
		status: "done" as const,
		statusLabel: "완료",
		statusTone: "success" as const,
		icon: <CheckCircle2 size={16} />,
	},
	{
		id: 2,
		title: "픽업 준비",
		time: "오후 1:35",
		desc: "주방에서 메뉴 준비를 시작했어요.",
		status: "done" as const,
		statusLabel: "완료",
		statusTone: "success" as const,
		icon: <CheckCircle2 size={16} />,
	},
	{
		id: 3,
		title: "배송 출발",
		time: "오후 1:48",
		desc: "라이더가 매장에서 픽업 후 이동 중입니다.",
		status: "active" as const,
		statusLabel: "진행 중",
		statusTone: "accent" as const,
		icon: <Truck size={16} />,
	},
	{
		id: 4,
		title: "배송 완료",
		time: "예상 오후 2:05",
		desc: "고객 주소지에 도착 예정.",
		status: "pending" as const,
		statusLabel: "대기",
		statusTone: "default" as const,
		icon: <Circle size={16} />,
	},
];

export const OrderTimeline: Story = {
	name: "주문 타임라인",
	render: () => (
		<Card bordered padding="lg" shadow="sm" style={{ width: 480 }}>
			<Stack gap={16}>
				<Stack direction="horizontal" justify="between" align="center">
					<Stack gap={2}>
						<h3
							style={{
								margin: 0,
								fontSize: 16,
								fontWeight: 700,
								color: "var(--bt-color-text-heading)",
							}}
						>
							주문 #1024
						</h3>
						<span style={{ fontSize: 12, color: "var(--bt-color-text-caption)" }}>
							2026.05.20 · 김민준 고객
						</span>
					</Stack>
					<Chip type="static" tone="accent" label="배송 중" />
				</Stack>

				<Divider />

				<Stack gap={20}>
					{TIMELINE.map((item, idx) => {
						const isLast = idx === TIMELINE.length - 1;
						const isPending = item.status === "pending";
						return (
							<Stack key={item.id} direction="horizontal" gap={16} align="start">
								{/* 좌측 인디케이터 */}
								<Stack gap={0} align="center" style={{ width: 28, flexShrink: 0 }}>
									<span
										style={{
											width: 28,
											height: 28,
											borderRadius: "50%",
											background:
												item.status === "active"
													? "var(--bt-color-accent-default)"
													: item.status === "done"
														? "color-mix(in srgb, var(--bt-color-status-success) 18%, transparent)"
														: "var(--bt-color-bg-solid-dim)",
											color:
												item.status === "active"
													? "var(--bt-color-accent-on-surface)"
													: item.status === "done"
														? "var(--bt-color-status-success)"
														: "var(--bt-color-text-caption)",
											display: "inline-flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										{item.icon}
									</span>
									{!isLast && (
										<span
											style={{
												width: 2,
												flex: 1,
												minHeight: 32,
												background: isPending
													? "var(--bt-color-border-default)"
													: "var(--bt-color-border-hover)",
												marginTop: 4,
												marginBottom: 4,
											}}
										/>
									)}
								</Stack>

								<Stack gap={6} style={{ flex: 1, paddingBottom: isLast ? 0 : 8 }}>
									<Stack direction="horizontal" justify="between" align="center">
										<span
											style={{
												fontSize: 14,
												fontWeight: 600,
												color: isPending
													? "var(--bt-color-text-caption)"
													: "var(--bt-color-text-heading)",
											}}
										>
											{item.title}
										</span>
										<Chip type="static" size="sm" tone={item.statusTone} label={item.statusLabel} />
									</Stack>
									<span style={{ fontSize: 12, color: "var(--bt-color-text-caption)" }}>{item.time}</span>
									<p
										style={{
											margin: 0,
											fontSize: 13,
											color: isPending
												? "var(--bt-color-text-caption)"
												: "var(--bt-color-text-body)",
											lineHeight: 1.55,
										}}
									>
										{item.desc}
									</p>
								</Stack>
							</Stack>
						);
					})}
				</Stack>
			</Stack>
		</Card>
	),
};
