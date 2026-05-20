import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from ".";

const meta: Meta<typeof Tooltip> = {
	title: "Components/Tooltip",
	component: Tooltip,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Tooltip**은 hover/focus 시 보조 설명. react-spring fade+slide entrance. navy 배경.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
	name: "기본",
	render: () => (
		<div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
			<Tooltip content="저장하기 (Cmd+S)">
				<button
					type="button"
					style={{
						padding: "8px 16px",
						background: "#121212",
						color: "#fff",
						border: "none",
						borderRadius: 8,
						cursor: "pointer",
					}}
				>
					Hover me
				</button>
			</Tooltip>
		</div>
	),
};

export const Placements: Story = {
	name: "위치 비교",
	render: () => (
		<div style={{ padding: 100, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 60 }}>
			{(["top", "bottom", "left", "right"] as const).map((p) => (
				<div key={p} style={{ display: "flex", justifyContent: "center" }}>
					<Tooltip content={`placement=${p}`} placement={p}>
						<button
							type="button"
							style={{
								padding: "8px 16px",
								background: "#f4f4f4",
								border: "1px solid #e5e5e5",
								borderRadius: 8,
								cursor: "pointer",
							}}
						>
							{p}
						</button>
					</Tooltip>
				</div>
			))}
		</div>
	),
};

export const LongText: Story = {
	name: "긴 텍스트",
	render: () => (
		<div style={{ padding: 80, textAlign: "center" }}>
			<Tooltip content="버튼을 누르면 데이터가 영구 삭제됩니다. 되돌릴 수 없습니다.">
				<button
					type="button"
					style={{
						padding: "8px 16px",
						background: "#EF4444",
						color: "#fff",
						border: "none",
						borderRadius: 8,
					}}
				>
					삭제
				</button>
			</Tooltip>
		</div>
	),
};
