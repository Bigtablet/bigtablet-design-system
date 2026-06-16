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
**Skeleton** — Loading placeholder. / 로딩 플레이스홀더. \`aria-hidden\` applied automatically. / \`aria-hidden\` 자동.

Variants: \`text\` (12px) / \`title\` (20px) / \`avatar\` (40×40 circle / 원형) / \`rect\` (card/image / 카드·이미지).
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
