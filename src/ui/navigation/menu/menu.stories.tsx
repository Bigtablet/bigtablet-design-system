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
**Menu** - 액션 메뉴 (컨텍스트 / 케밥 / 행 단위). 값 선택에는 \`Dropdown\` 을 쓴다.

\`align\`: \`start\` (기본) / \`end\` (우측 화면 밖으로 넘치는 것을 방지).
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
	parameters: {
		docs: {
			description: {
				story:
					"케밥 버튼에 붙는 액션 목록입니다. `onSelect` 가 실행된 뒤 메뉴는 **자동으로 닫힙니다** - 화면이 닫기를 관리하지 않습니다.\n\n고르는 것이 값이면 `Menu` 가 아니라 `Dropdown` 입니다. 폼에 들어가는 선택은 값이고, 여기서 고르는 것은 동작입니다.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					'`align="end"` 는 메뉴의 **오른쪽 변**을 트리거에 맞춥니다. 표 행 끝의 케밥 버튼처럼 트리거가 화면 오른쪽에 있을 때 필요합니다.\n\n뷰포트를 벗어나면 정렬과 별개로 안쪽으로 밀려 들어옵니다 - 팝업은 `body` 로 포탈되고 좌표를 실측해 잡습니다(3.18.0).',
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"조건이 안 맞는 항목은 **숨기지 말고 잠그는 편**이 낫습니다 - 목록에서 사라지면 사용자가 기능 자체를 못 찾습니다.\n\n왜 잠겼는지는 메뉴가 말해 주지 못하므로, 이유가 필요하면 라벨에 담거나 `Tooltip` 을 붙입니다. `destructive` 는 삭제처럼 되돌릴 수 없는 항목에만 씁니다.",
			},
		},
	},
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
