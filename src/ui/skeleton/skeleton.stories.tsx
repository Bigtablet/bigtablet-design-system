import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from ".";

const meta: Meta<typeof Skeleton> = {
	title: "Components/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["text", "title", "avatar", "rect"],
			description: "스켈레톤 모양",
		},
		width: { control: "text", description: "CSS width 값" },
		height: { control: "text", description: "CSS height 값" },
		radius: {
			control: "select",
			options: [undefined, "sm", "md", "lg", "full"],
			description: "border-radius 토큰",
		},
	},
	args: { variant: "text" },
	parameters: {
		docs: {
			description: {
				component: `
**Skeleton**은 데이터 로딩 중 자리를 차지하는 플레이스홀더입니다.

### 언제 사용하나요?
- 비동기 데이터 로딩 중 콘텐츠 영역 자리 유지
- 페이지 첫 진입 시 깜빡임 방지 (CLS 개선)
- 리스트/카드/테이블의 행 단위 로딩 표시

### Variant
| Variant | 용도 |
|---------|------|
| **text** | 본문 한 줄 (height 12px) |
| **title** | 제목 (height 20px) |
| **avatar** | 원형 아바타 (40×40px, full radius 자동) |
| **rect** | 카드/이미지 자리 (5rem 기본) |

### 접근성
- \`aria-hidden="true"\` 자동 적용 → 스크린 리더에서 무시됨. 부모 컨테이너에 \`aria-busy\` 또는 로딩 상태 안내를 별도로 적용하세요.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { args: { variant: "text", width: 240 } };
export const Title: Story = { args: { variant: "title", width: 320 } };
export const Avatar: Story = { args: { variant: "avatar", width: 48 } };
export const Rect: Story = { args: { variant: "rect", width: 320, height: 120 } };

export const Variants: Story = {
	name: "전체 variant 비교",
	render: () => (
		<div style={{ display: "grid", gap: 16, width: 320 }}>
			<div>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>text</div>
				<Skeleton variant="text" />
			</div>
			<div>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>title</div>
				<Skeleton variant="title" />
			</div>
			<div>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>avatar</div>
				<Skeleton variant="avatar" />
			</div>
			<div>
				<div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>rect</div>
				<Skeleton variant="rect" />
			</div>
		</div>
	),
};

export const CardLoading: Story = {
	name: "카드 로딩 예시",
	render: () => (
		<div
			style={{
				width: 320,
				padding: 16,
				border: "1px solid #e5e5e5",
				borderRadius: 12,
				display: "grid",
				gap: 12,
			}}
		>
			<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
				<Skeleton variant="avatar" width={40} />
				<div style={{ flex: 1, display: "grid", gap: 6 }}>
					<Skeleton variant="title" width="60%" />
					<Skeleton variant="text" width="40%" />
				</div>
			</div>
			<Skeleton variant="rect" height={120} />
			<Skeleton variant="text" />
			<Skeleton variant="text" width="80%" />
		</div>
	),
};

export const ListLoading: Story = {
	name: "리스트 로딩 예시",
	render: () => (
		<div style={{ display: "grid", gap: 12, width: 360 }}>
			{Array.from({ length: 4 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: demo skeleton
				<div key={i} style={{ display: "flex", gap: 12, alignItems: "center" }}>
					<Skeleton variant="avatar" width={32} />
					<div style={{ flex: 1, display: "grid", gap: 4 }}>
						<Skeleton variant="text" width="70%" />
						<Skeleton variant="text" width="40%" />
					</div>
				</div>
			))}
		</div>
	),
};
