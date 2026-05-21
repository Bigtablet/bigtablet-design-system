import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import type * as React from "react";
import { Menu } from ".";

const meta: Meta<typeof Menu> = {
	title: "Components/Navigation/Menu",
	component: Menu,
	tags: ["autodocs"],
	argTypes: {
		align: {
			control: "select",
			options: ["start", "end"],
			description: "trigger 기준 정렬. 우측 끝엔 end로 화면 밖 방지.",
		},
		items: {
			control: false,
			description: "메뉴 아이템 배열 (key, label, icon, onSelect, destructive, disabled).",
		},
		trigger: {
			control: false,
			description: "메뉴를 여는 트리거 ReactElement.",
		},
	},
	args: {
		align: "start",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Menu** — 액션 메뉴 (컨텍스트/케밥/행 단위). 값 선택은 \`Dropdown\`.

\`align\`: \`start\` (기본) / \`end\` (우측 화면 밖 방지).
\`MenuItem\` 필드: \`key\`, \`label\`, \`icon\`, \`onSelect\` (자동 close), \`destructive\`, \`disabled\`.
				`.trim(),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Menu>;

const TriggerBtn = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
	<button
		type="button"
		aria-label="More options"
		{...props}
		style={{
			padding: 8,
			border: "1px solid var(--bt-color-border-default)",
			background: "var(--bt-color-bg-solid)",
			color: "var(--bt-color-text-heading)",
			borderRadius: 6,
			cursor: "pointer",
			display: "inline-flex",
			alignItems: "center",
		}}
	>
		<MoreVertical size={16} aria-hidden="true" />
	</button>
);

export const Default: Story = {
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
