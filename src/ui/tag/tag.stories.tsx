import type { Meta, StoryObj } from "@storybook/react";
import { Hash } from "lucide-react";
import { Tag } from ".";

const meta: Meta<typeof Tag> = {
	title: "Components/Tag",
	component: Tag,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Tag**는 카테고리/속성 라벨 (정적). Chip과 다름 — 인터랙티브하지 않음, 더 작음. 검색 결과/필터/콘텐츠 분류에.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Variants: Story = {
	name: "Variant 비교",
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Tag variant="neutral">Frontend</Tag>
			<Tag variant="accent">Featured</Tag>
			<Tag variant="info">Beta</Tag>
			<Tag variant="success">Active</Tag>
			<Tag variant="warning">Pending</Tag>
			<Tag variant="error">Deprecated</Tag>
		</div>
	),
};

export const WithIcon: Story = {
	name: "아이콘 포함",
	render: () => (
		<div style={{ display: "flex", gap: 6 }}>
			<Tag icon={<Hash size={12} />}>react</Tag>
			<Tag icon={<Hash size={12} />} variant="accent">
				typescript
			</Tag>
		</div>
	),
};

export const Removable: Story = {
	name: "삭제 가능",
	render: () => (
		<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
			<Tag onRemove={() => alert("removed Frontend")}>Frontend</Tag>
			<Tag onRemove={() => alert("removed Backend")} variant="accent">
				Backend
			</Tag>
			<Tag onRemove={() => alert("removed Design")} variant="success">
				Design
			</Tag>
		</div>
	),
};

export const FilterChips: Story = {
	name: "필터 적용 표시 예",
	render: () => (
		<div
			style={{
				padding: 12,
				background: "#fafafa",
				borderRadius: 8,
				display: "flex",
				gap: 6,
				flexWrap: "wrap",
				alignItems: "center",
			}}
		>
			<span style={{ fontSize: 13, color: "#666" }}>적용된 필터:</span>
			<Tag variant="accent" onRemove={() => {}}>
				Open
			</Tag>
			<Tag variant="accent" onRemove={() => {}}>
				High Priority
			</Tag>
			<Tag variant="accent" onRemove={() => {}}>
				Assigned to me
			</Tag>
		</div>
	),
};
