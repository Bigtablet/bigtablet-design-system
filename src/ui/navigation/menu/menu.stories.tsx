import type { Meta, StoryObj } from "@storybook/react";
import { Copy, Edit, MoreVertical, Trash } from "lucide-react";
import { Menu } from ".";

const meta: Meta<typeof Menu> = {
	title: "Components/Menu",
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
**Menu** — trigger 클릭으로 펼쳐지는 액션 메뉴. 컨텍스트 메뉴 / 케밥 / 행 단위 액션에 사용.

#### 언제 쓰는가
- 카드/행 단위 액션 (Edit, Duplicate, Delete)
- \`MoreVertical\`(케밥) 트리거의 보조 액션 묶음
- destructive 액션 포함 (\`destructive: true\`로 빨간 강조)

#### Menu vs Dropdown
- **Menu**: 액션 실행 (\`onSelect\` → 사이드 이펙트). \`<button role="menuitem">\`. 값을 들고 있지 않음.
- **Dropdown**: 값 선택 (controlled \`value\`/\`onChange\`). 폼 필드.

#### align — trigger 기준 정렬
- \`"start"\` (기본) — 좌측 정렬. 본문 안 트리거.
- \`"end"\` — 우측 정렬. 테이블 마지막 칼럼, 헤더 우측 액션 (화면 밖 방지).

세로는 항상 trigger **아래**로 펼침 (위로 뒤집기 미지원).

#### 접근성 (WAI-ARIA Menu pattern)
- 메뉴: \`role="menu"\`, \`useId()\` 기반 id
- 트리거: \`aria-haspopup="menu"\`, \`aria-expanded\`, \`aria-controls\` 자동 주입
- 아이템: native \`<button type="button" role="menuitem">\` — Enter/Space로 활성화
- 키보드: Tab으로 trigger 포커스 → 메뉴 열기 → Tab으로 아이템 순회 (Arrow Up/Down 미지원). Esc로 닫힘.
- 비활성 아이템은 native \`disabled\`로 포커스/클릭 모두 차단.

#### 애니메이션
\`useSpringPresence\` 훅 — opacity \`0→1\` + \`translateY(-4px)→0\`. 퇴출은 \`clamp: true\`로 단호하게.

#### Dismiss
열린 동안에만 listener 등록 — 외부 클릭(\`mousedown\`) / Esc / 아이템 선택 시 close. 비활성 아이템 클릭은 무시.

#### MenuItem
| 필드 | Type | Description |
|------|------|-------------|
| \`key\` | \`string\` | 고유 key |
| \`label\` | \`ReactNode\` | 표시 텍스트 (ellipsis 처리) |
| \`icon\` | \`ReactNode\` | leading icon (선택) |
| \`onSelect\` | \`() => void\` | 호출 후 자동 close |
| \`destructive\` | \`boolean\` | 빨간 텍스트 강조 |
| \`disabled\` | \`boolean\` | 비활성 — opacity 38% |

자세한 가이드는 [\`docs/COMPONENTS.md#menu\`](https://github.com/bigtablet/bigtablet-design-system/blob/main/docs/COMPONENTS.md#menu) 참고.
				`.trim(),
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Menu>;

const TriggerBtn = () => (
	<button
		type="button"
		aria-label="More options"
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
		<MoreVertical size={16} aria-hidden="true" />
	</button>
);

const sampleItems = [
	{ key: "edit", label: "편집", icon: <Edit size={14} />, onSelect: () => alert("edit") },
	{ key: "copy", label: "복사", icon: <Copy size={14} />, onSelect: () => alert("copy") },
	{
		key: "del",
		label: "삭제",
		icon: <Trash size={14} />,
		destructive: true,
		onSelect: () => alert("delete"),
	},
];

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 align을 바꿔보세요. items/trigger는 sample 데이터 사용.",
			},
		},
	},
	args: {
		items: sampleItems,
		trigger: <TriggerBtn />,
	},
	render: (args) => (
		<div
			style={{
				padding: 24,
				display: "flex",
				justifyContent: args.align === "end" ? "flex-end" : "flex-start",
			}}
		>
			<Menu {...args} />
		</div>
	),
};

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
