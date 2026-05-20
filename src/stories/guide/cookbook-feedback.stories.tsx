import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/general/button";
import { Card } from "../../ui/display/card";
import { EmptyState } from "../../ui/feedback/empty-state";
import { Grid } from "../../ui/layout/grid";
import { Modal } from "../../ui/overlay/modal";
import { Skeleton } from "../../ui/feedback/skeleton";
import { Stack } from "../../ui/layout/stack";
import { ToastProvider } from "../../ui/feedback/toast";
import { useToast } from "../../ui/feedback/toast/use-toast";

const meta: Meta = {
	title: "Guide/Cookbook/Feedback Patterns",
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"**피드백 패턴 cookbook** — 로딩·빈 상태·확인 모달·토스트 등 사용자 상호작용에 대한 시스템 반응을 표현하는 레시피 모음입니다.\n\n각 패턴은 사용 시점과 함께 그대로 복붙해 쓸 수 있는 형태로 정리되어 있습니다.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── Loading Skeleton ───────────────────────────────────────────────────────

export const LoadingSkeleton: Story = {
	name: "로딩 스켈레톤",
	render: () => {
		const [loading, setLoading] = useState(true);

		return (
			<Stack gap={16} style={{ width: 560 }}>
				<Stack direction="horizontal" justify="between" align="center">
					<h3
						style={{
							margin: 0,
							fontSize: 16,
							fontWeight: 700,
							color: "#121212",
						}}
					>
						게시물 목록
					</h3>
					<Button variant="outline" size="sm" onClick={() => setLoading((v) => !v)}>
						{loading ? "데이터 로드" : "다시 로딩"}
					</Button>
				</Stack>

				<Stack gap={12}>
					{loading
						? Array.from({ length: 3 }).map((_, idx) => (
								<Card key={idx} bordered padding="md" shadow="sm">
									<Stack direction="horizontal" gap={16} align="start">
										<Skeleton variant="avatar" width={48} />
										<Stack gap={8} style={{ flex: 1 }}>
											<Skeleton variant="title" width="60%" />
											<Skeleton variant="text" width="90%" />
											<Skeleton variant="text" width="70%" />
										</Stack>
									</Stack>
								</Card>
							))
						: [
								{
									name: "박상민",
									title: "디자인 시스템 v3 회고",
									body: "토큰 구조와 컴포넌트 API를 한 번에 정리하니 협업 속도가 눈에 띄게 빨라졌습니다.",
								},
								{
									name: "김민준",
									title: "Storybook 워크플로 개선",
									body: "스토리북 a11y addon을 켜고 나서 접근성 리포트가 PR에 자동으로 붙어요.",
								},
								{
									name: "이서연",
									title: "주문 흐름 사용성 테스트",
									body: "결제 단계에서 가장 많은 이탈이 발생해 CTA 문구와 위치를 다시 정리했습니다.",
								},
							].map((post) => (
								<Card key={post.title} bordered padding="md" shadow="sm">
									<Stack direction="horizontal" gap={16} align="start">
										<div
											style={{
												width: 48,
												height: 48,
												borderRadius: "50%",
												background: "linear-gradient(135deg, #47555E 0%, #303841 100%)",
												color: "#fff",
												display: "inline-flex",
												alignItems: "center",
												justifyContent: "center",
												fontSize: 14,
												fontWeight: 700,
											}}
										>
											{post.name.charAt(0)}
										</div>
										<Stack gap={4} style={{ flex: 1 }}>
											<span style={{ fontSize: 13, color: "#888", fontWeight: 500 }}>
												{post.name}
											</span>
											<span style={{ fontSize: 15, fontWeight: 700, color: "#121212" }}>
												{post.title}
											</span>
											<p
												style={{
													margin: 0,
													fontSize: 13,
													color: "#666",
													lineHeight: 1.55,
												}}
											>
												{post.body}
											</p>
										</Stack>
									</Stack>
								</Card>
							))}
				</Stack>
			</Stack>
		);
	},
};

// ─── Empty State ────────────────────────────────────────────────────────────

export const EmptyStatePattern: Story = {
	name: "빈 상태 + CTA",
	render: () => (
		<Grid cols={2} gap={24} style={{ width: 760 }}>
			<Card bordered padding="lg" shadow="sm">
				<EmptyState
					illustration={<Inbox size={56} strokeWidth={1.5} color="#94A3B8" />}
					title="받은 메일이 없습니다"
					description="새 메일이 오면 여기에서 바로 확인할 수 있어요."
					action={<Button variant="filled">새 메일 작성</Button>}
				/>
			</Card>
			<Card bordered padding="lg" shadow="sm">
				<EmptyState
					illustration={<Search size={56} strokeWidth={1.5} color="#94A3B8" />}
					title="검색 결과가 없습니다"
					description='"비건 디저트"에 대한 결과를 찾지 못했어요. 검색어를 바꿔 다시 시도해 보세요.'
					action={
						<Stack direction="horizontal" gap={8} justify="center">
							<Button variant="outline">검색어 지우기</Button>
							<Button variant="filled">필터 재설정</Button>
						</Stack>
					}
				/>
			</Card>
		</Grid>
	),
};

// ─── Confirmation Modal ─────────────────────────────────────────────────────

export const ConfirmationModal: Story = {
	name: "확인 모달 (위험 액션)",
	render: () => {
		const [open, setOpen] = useState(false);
		const [completed, setCompleted] = useState(false);

		return (
			<Stack gap={16} align="center">
				<Button
					variant="outline"
					size="md"
					leadingIcon={<Trash2 size={16} />}
					onClick={() => {
						setCompleted(false);
						setOpen(true);
					}}
					style={{ color: "#B91C1C", borderColor: "#FCA5A5" }}
				>
					계정 삭제
				</Button>

				{completed && (
					<span style={{ fontSize: 13, color: "#047857", fontWeight: 600 }}>
						삭제 요청이 접수되었습니다.
					</span>
				)}

				<Modal
					open={open}
					onClose={() => setOpen(false)}
					title="계정을 정말 삭제할까요?"
					width={440}
				>
					<Stack gap={20}>
						<p style={{ margin: 0, fontSize: 14, color: "#444", lineHeight: 1.6 }}>
							계정을 삭제하면 모든 매장 데이터·정산 기록·연동 정보가 영구적으로
							제거되며, 이 작업은 되돌릴 수 없습니다.
						</p>
						<div
							style={{
								padding: 12,
								borderRadius: 8,
								background: "#FEF2F2",
								border: "1px solid #FECACA",
								fontSize: 13,
								color: "#B91C1C",
							}}
						>
							삭제 후 7일 동안은 동일 이메일로 신규 가입이 제한됩니다.
						</div>
						<Stack direction="horizontal" justify="end" gap={8}>
							<Button variant="outline" onClick={() => setOpen(false)}>
								취소
							</Button>
							<Button
								variant="filled"
								onClick={() => {
									setCompleted(true);
									setOpen(false);
								}}
								style={{ background: "#B91C1C", color: "#fff" }}
							>
								삭제하기
							</Button>
						</Stack>
					</Stack>
				</Modal>
			</Stack>
		);
	},
};

// ─── Toast 사용 예 ───────────────────────────────────────────────────────────

const ToastDemo = () => {
	const toast = useToast();

	return (
		<Card bordered padding="lg" shadow="sm">
			<Stack gap={16} style={{ width: 360 }}>
				<Stack gap={4}>
					<h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#121212" }}>
						토스트 메시지
					</h3>
					<p style={{ margin: 0, fontSize: 13, color: "#666" }}>
						짧고 일시적인 시스템 피드백에 사용하세요.
					</p>
				</Stack>

				<Grid cols={2} gap={8}>
					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.success("저장이 완료되었습니다.")}
					>
						성공
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.error("저장 중 오류가 발생했습니다.")}
					>
						오류
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.warning("저장되지 않은 변경 사항이 있어요.")}
					>
						경고
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.info("새 버전이 배포되었습니다.")}
					>
						정보
					</Button>
				</Grid>
			</Stack>
		</Card>
	);
};

export const ToastUsage: Story = {
	name: "토스트 사용 예",
	render: () => (
		<ToastProvider>
			<ToastDemo />
		</ToastProvider>
	),
};
