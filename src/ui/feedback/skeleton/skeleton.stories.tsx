import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton } from ".";

const meta: Meta<typeof Skeleton> = {
	title: "Components/Feedback/Skeleton",
	component: Skeleton,
	tags: ["autodocs"],
	argTypes: {
		variant: { control: "select", options: ["text", "title", "avatar", "rect"] },
		width: { control: "text" },
		height: { control: "text" },
		radius: { control: "select", options: [undefined, "sm", "md", "lg", "full"] },
	},
	args: { variant: "text" },
	parameters: {
		docs: {
			description: {
				component: `
**Skeleton** - 로딩 중 자리를 잡아 두는 플레이스홀더. \`aria-hidden\` 이 자동으로 적용된다.

Variants: \`text\` (12px) / \`title\` (20px) / \`avatar\` (40×40 circle / 원형) / \`rect\` (card/image / 카드·이미지).

#### 로딩 표시 4종 중 무엇을 쓰나

| 상황 | 컴포넌트 |
| --- | --- |
| 목록·카드가 뜨기 전, 들어올 내용의 **모양을 알 때** | \`Skeleton\` |
| 버튼·카드 안에서 **작게 돌려야 할 때** | \`Spinner\` |
| 페이지 전환처럼 **화면 전체가 바뀔 때** | \`TopLoading\` |
| 회원가입 3단계처럼 **끝이 정해진 진행률** | \`LinearProgress\` |

기다림이 아니라 결과를 알릴 때는 \`Toast\`(막지 않음)나 \`Alert\`(막음)입니다.

				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Text: Story = { args: { variant: "text", width: 240 } };
export const Title: Story = { args: { variant: "title", width: 320 } };
export const AvatarSkeleton: Story = { name: "Avatar", args: { variant: "avatar", width: 48 } };
export const Rect: Story = { args: { variant: "rect", width: 320, height: 120 } };

export const CardLoading: Story = {
	name: "Card loading 예시",
	parameters: {
		docs: {
			description: {
				story:
					"실제로 쓰는 방식입니다. 큰 `Skeleton` 하나를 두지 말고 **들어올 콘텐츠와 같은 구조**로 조합하세요 - 아바타 자리, 제목 자리, 본문 두 줄.\n\n너비를 `60%`·`90%` 처럼 서로 다르게 주면 실제 텍스트처럼 읽힙니다.",
			},
		},
	},
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
