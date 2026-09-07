import type { Meta, StoryObj } from "@storybook/react";
import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Card } from "../../ui/display/card";
import { EmptyState } from "../../ui/feedback/empty-state";
import { Skeleton } from "../../ui/feedback/skeleton";
import { ToastProvider } from "../../ui/feedback/toast";
import { useToast } from "../../ui/feedback/toast/use-toast";
import { Button } from "../../ui/general/button";
import { Grid } from "../../ui/layout/grid";
import { Stack } from "../../ui/layout/stack";
import { Modal } from "../../ui/overlay/modal";

const meta: Meta = {
	title: "Cookbook/Feedback Patterns",
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"**사용자의 동작에 화면이 응답하는 방법** 모음입니다. 기다리게 할 때(로딩), 보여줄 것이 없을 때(빈 상태), 멈춰 세울 때(확인 모달), 알려만 줄 때(토스트) 네 가지입니다.\n\n각 스토리 설명에 '언제 쓰는지'를 적어 두었습니다. 고르는 기준이 되는 문장이니 먼저 읽어 보세요.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// ─── Loading Skeleton ───────────────────────────────────────────────────────

export const LoadingSkeleton: Story = {
	name: "로딩 스켈레톤",
	parameters: {
		docs: {
			description: {
				story:
					"목록·카드가 **로딩되는 동안 빈 화면을 보여주지 않기 위해** 씁니다. 스피너 하나보다 실제 레이아웃과 같은 모양의 자리를 잡아 주는 편이 체감 대기 시간이 짧습니다.\n\n`variant` 로 avatar / title / text 자리를 고르고, 실제 콘텐츠와 **같은 크기**로 맞추는 것이 요령입니다. 버튼을 눌러 두 상태를 비교해 보세요.",
			},
		},
	},
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
							color: "var(--bt-color-text-heading)",
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
											<span
												style={{
													fontSize: 13,
													color: "var(--bt-color-text-caption)",
													fontWeight: 500,
												}}
											>
												{post.name}
											</span>
											<span
												style={{
													fontSize: 15,
													fontWeight: 700,
													color: "var(--bt-color-text-heading)",
												}}
											>
												{post.title}
											</span>
											<p
												style={{
													margin: 0,
													fontSize: 13,
													color: "var(--bt-color-text-body)",
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
	parameters: {
		docs: {
			description: {
				story:
					"검색 결과가 없거나 아직 아무것도 만들지 않았을 때 씁니다. **왜 비었는지**와 **다음에 무엇을 할 수 있는지**를 같이 주는 것이 핵심입니다.\n\n`EmptyState` 가 아이콘·제목·설명의 간격과 정렬을 갖고, 화면은 문구와 CTA만 정합니다.",
			},
		},
	},
	render: () => (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				minHeight: 480,
				padding: 48,
				background: "var(--bt-color-bg-solid)",
			}}
		>
			<EmptyState
				size="lg"
				illustration={<Search size={56} strokeWidth={1.5} />}
				title="검색 결과가 없습니다"
				description={
					<>
						<span>{'"비건 디저트"에 대한 결과를 찾지 못했어요.'}</span>
						<br />
						<span>검색어를 바꾸거나 필터를 재설정해 다시 시도해 보세요.</span>
					</>
				}
				action={<Button variant="filled">필터 재설정</Button>}
			/>
		</div>
	),
};

// ─── Confirmation Modal ─────────────────────────────────────────────────────

export const ConfirmationModal: Story = {
	name: "확인 모달 (위험 액션)",
	parameters: {
		docs: {
			description: {
				story:
					'삭제처럼 **되돌릴 수 없는 동작** 앞에 한 번 멈추게 합니다. 제목에 대상 이름을 넣고, 확인 버튼은 `variant="danger"` 로 두어 실수를 줄입니다.\n\n되돌릴 수 있는 동작에는 쓰지 마세요 - 매번 확인을 물으면 사용자가 읽지 않고 누르게 됩니다.',
			},
		},
	},
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
					style={{
						color: "var(--bt-color-status-error)",
						borderColor: "color-mix(in srgb, var(--bt-color-status-error) 45%, transparent)",
					}}
				>
					계정 삭제
				</Button>

				{completed && (
					<span style={{ fontSize: 13, color: "var(--bt-color-status-success)", fontWeight: 600 }}>
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
						<p
							style={{
								margin: 0,
								fontSize: 14,
								color: "var(--bt-color-text-body)",
								lineHeight: 1.6,
							}}
						>
							계정을 삭제하면 모든 매장 데이터·정산 기록·연동 정보가 영구적으로 제거되며, 이 작업은
							되돌릴 수 없습니다.
						</p>
						<div
							style={{
								padding: 12,
								borderRadius: 8,
								background: "color-mix(in srgb, var(--bt-color-status-error) 12%, transparent)",
								border:
									"1px solid color-mix(in srgb, var(--bt-color-status-error) 35%, transparent)",
								fontSize: 13,
								color: "var(--bt-color-status-error)",
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
								style={{ background: "var(--bt-color-status-error)", color: "#fff" }}
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
					<h3
						style={{
							margin: 0,
							fontSize: 16,
							fontWeight: 700,
							color: "var(--bt-color-text-heading)",
						}}
					>
						토스트 메시지
					</h3>
					<p style={{ margin: 0, fontSize: 13, color: "var(--bt-color-text-body)" }}>
						짧고 일시적인 시스템 피드백에 사용하세요.
					</p>
				</Stack>

				<Grid cols={3} gap={8}>
					<Button
						variant="outline"
						size="sm"
						onClick={() => toast.message("빅태블릿 디자인 시스템에 오신것을 환영합니다!")}
					>
						기본
					</Button>
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
	parameters: {
		docs: {
			description: {
				story:
					"저장 완료처럼 **화면을 막지 않아도 되는 알림**에 씁니다. 앱 최상위에 `ToastProvider` 를 한 번 두고, 어디서든 `useToast()` 로 띄웁니다.\n\n`success` / `error` / `warning` / `info` 중 의미에 맞는 것을 고르면 색과 아이콘이 따라옵니다. 사용자의 확인이 필요한 내용이면 Toast 가 아니라 Modal 입니다.",
			},
		},
	},
	render: () => (
		<ToastProvider>
			<ToastDemo />
		</ToastProvider>
	),
};
