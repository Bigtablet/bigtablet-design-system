import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import { Menu } from ".";

const meta: Meta<typeof Menu> = {
	title: "Components/Menu",
	component: Menu,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Menu**는 컨텍스트 액션 메뉴. trigger 클릭 시 표시, 외부 클릭/Esc로 닫힘. Form Dropdown과 다름 (선택 ≠ 액션).",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Menu>;

const TriggerBtn = () => (
	<button
		type="button"
		style={{
			padding: 8,
			border: "1px solid #e5e5e5",
			background: "#fff",
			borderRadius: 6,
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
		}}
	>
		<MoreVertical size={16} />
	</button>
);

export const Default: Story = {
	name: "기본",
	render: () => (
		<div style={{ padding: 24 }}>
			<Menu
				trigger={<TriggerBtn />}
				items={[
					{ key: "edit", label: "편집", icon: <Edit size={14} />, onSelect: () => alert("edit") },
					{ key: "copy", label: "복사", icon: <Copy size={14} />, onSelect: () => alert("copy") },
					{
						key: "del",
						label: "삭제",
						icon: <Trash size={14} />,
						destructive: true,
						onSelect: () => alert("delete"),
					},
				]}
			/>
		</div>
	),
};

export const AlignEnd: Story = {
	name: "오른쪽 정렬",
	render: () => (
		<div style={{ padding: 24, display: "flex", justifyContent: "flex-end" }}>
			<Menu
				align="end"
				trigger={<TriggerBtn />}
				items={[
					{ key: "edit", label: "편집" },
					{ key: "share", label: "공유" },
					{ key: "del", label: "삭제", destructive: true },
				]}
			/>
		</div>
	),
};

export const Disabled: Story = {
	name: "비활성 아이템 포함",
	render: () => (
		<div style={{ padding: 24 }}>
			<Menu
				trigger={<TriggerBtn />}
				items={[
					{ key: "edit", label: "편집" },
					{ key: "archive", label: "보관", disabled: true },
					{ key: "del", label: "삭제", destructive: true },
				]}
			/>
		</div>
	),
};
