import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table, type TableColumn, type TableSort } from ".";

interface User {
	id: number;
	name: string;
	email: string;
	role: string;
	status: "active" | "invited" | "disabled";
}

const sampleUsers: User[] = [
	{ id: 1, name: "박상민", email: "sangmin@bigtablet.com", role: "Admin", status: "active" },
	{ id: 2, name: "김지원", email: "jiwon@bigtablet.com", role: "Editor", status: "active" },
	{ id: 3, name: "이서연", email: "seoyeon@bigtablet.com", role: "Viewer", status: "invited" },
	{ id: 4, name: "정민호", email: "minho@bigtablet.com", role: "Editor", status: "disabled" },
	{ id: 5, name: "한지유", email: "jiyu@bigtablet.com", role: "Viewer", status: "active" },
];

const columns: TableColumn<User>[] = [
	{ key: "name", header: "이름", width: "20%" },
	{ key: "email", header: "이메일", width: "35%" },
	{ key: "role", header: "역할", width: "15%" },
	{
		key: "status",
		header: "상태",
		width: "15%",
		render: (u) => {
			const colorMap = {
				active: "var(--bt-color-status-success-on-surface)",
				invited: "var(--bt-color-status-warning-on-surface)",
				disabled: "var(--bt-color-text-caption)",
			};
			return (
				<span style={{ color: colorMap[u.status], fontWeight: 500 }}>
					{u.status === "active" ? "활성" : u.status === "invited" ? "초대됨" : "비활성"}
				</span>
			);
		},
	},
	{
		key: "actions",
		header: "관리",
		width: "15%",
		align: "right",
		render: () => <span style={{ color: "var(--bt-color-status-info)", cursor: "pointer" }}>편집</span>,
	},
];

const meta: Meta<typeof Table> = {
	title: "Components/Display/Table",
	component: Table,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Table** - Displays structured data in rows/columns with generic row type safety. Supports controlled sort (\`sort\`/\`onSortChange\`) and row selection (\`selectable\`/\`rowKey\`/\`selectedKeys\`/\`onSelectionChange\`) - the DS only renders UI state, the consumer owns sorting the \`data\` array and the selection list. / **Table** - 정형 데이터 행/열 표시. 제네릭 row 타입 안전. 제어형 정렬(\`sort\`/\`onSortChange\`)과 행 선택(\`selectable\`/\`rowKey\`/\`selectedKeys\`/\`onSelectionChange\`)을 지원한다 - DS는 UI 상태만 그리고, 실제 \`data\` 정렬과 선택 목록 관리는 소비자가 담당한다.

Key props: \`columns\`, \`rows\`, \`size\` (sm/md/lg), \`isLoading\` (auto Skeleton rows), \`stickyHeader\`, \`onRowClick\`, \`emptyMessage\`. / 주요 prop: \`columns\`, \`rows\`, \`size\` (sm/md/lg), \`isLoading\` (Skeleton 행 자동), \`stickyHeader\`, \`onRowClick\`, \`emptyMessage\`.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Table<User>>;

export const Default: Story = {
	name: "기본",
	render: () => (
		<Table<User>
			columns={columns}
			data={sampleUsers}
			keyExtractor={(u) => u.id}
			ariaLabel="사용자 목록"
		/>
	),
};

export const Loading: Story = {
	name: "로딩",
	render: () => (
		<Table<User>
			columns={columns}
			data={[]}
			keyExtractor={(u) => u.id}
			isLoading
			skeletonRows={6}
			ariaLabel="사용자 목록 로딩 중"
		/>
	),
};

export const Empty: Story = {
	name: "빈 상태",
	render: () => (
		<Table<User>
			columns={columns}
			data={[]}
			keyExtractor={(u) => u.id}
			emptyMessage="등록된 사용자가 없습니다"
			ariaLabel="사용자 목록"
		/>
	),
};

export const Sizes: Story = {
	name: "크기 비교 (sm / md / lg)",
	render: () => (
		<div style={{ display: "grid", gap: 24 }}>
			{(["sm", "md", "lg"] as const).map((size) => (
				<div key={size}>
					<div style={{ fontSize: 12, color: "var(--bt-color-text-body)", marginBottom: 6 }}>size={size}</div>
					<Table<User>
						columns={columns.slice(0, 3)}
						data={sampleUsers.slice(0, 3)}
						keyExtractor={(u) => u.id}
						size={size}
					/>
				</div>
			))}
		</div>
	),
};

export const Clickable: Story = {
	name: "행 클릭",
	render: () => (
		<Table<User>
			columns={columns}
			data={sampleUsers}
			keyExtractor={(u) => u.id}
			onRowClick={(u) => alert(`${u.name} 클릭됨`)}
		/>
	),
};

export const StickyHeader: Story = {
	name: "Sticky Header",
	parameters: { chromatic: { disableSnapshot: true } },
	render: () => (
		// biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region requires tabIndex for keyboard access (WCAG SC 2.1.1)
		<div
			tabIndex={0}
			role="region"
			aria-label="사용자 목록"
			style={{
				height: 240,
				overflow: "auto",
				border: "1px solid var(--bt-color-border-default)",
				borderRadius: 8,
			}}
		>
			<Table<User>
				columns={columns}
				data={[...sampleUsers, ...sampleUsers, ...sampleUsers]}
				keyExtractor={(u, i) => `${u.id}-${i}`}
				stickyHeader
			/>
		</div>
	),
};

export const Sortable: Story = {
	name: "정렬 (제어형)",
	parameters: {
		docs: {
			description: {
				story:
					"Controlled sort - the DS only renders `aria-sort` + arrow icon on click; the consumer sorts `data` and passes it back. Header click cycles none → asc → desc → none. / 제어형 정렬 - DS는 클릭 시 `aria-sort`와 화살표 아이콘만 그린다. 실제 `data` 정렬은 소비자가 수행해 다시 전달한다. 헤더 클릭 시 none → asc → desc → none 순환.",
			},
		},
	},
	render: () => {
		const [sort, setSort] = useState<TableSort | null>(null);

		const sortableColumns: TableColumn<User>[] = columns.map((col) =>
			col.key === "name" || col.key === "email" || col.key === "role"
				? { ...col, sortable: true }
				: col,
		);

		const sortedUsers = [...sampleUsers].sort((a, b) => {
			if (!sort) return 0;
			const key = sort.key as keyof User;
			const compared = String(a[key]).localeCompare(String(b[key]), "ko");
			return sort.direction === "asc" ? compared : -compared;
		});

		return (
			<Table<User>
				columns={sortableColumns}
				data={sortedUsers}
				keyExtractor={(u) => u.id}
				sort={sort ?? undefined}
				onSortChange={setSort}
				ariaLabel="정렬 가능한 사용자 목록"
			/>
		);
	},
};

export const Selectable: Story = {
	name: "행 선택 (제어형)",
	parameters: {
		docs: {
			description: {
				story:
					"Controlled row selection via `selectable` + `rowKey` + `selectedKeys` + `onSelectionChange`. Header checkbox is tri-state (checked/indeterminate/unchecked). Selected rows get `aria-selected` and an accent highlight. / `selectable` + `rowKey` + `selectedKeys` + `onSelectionChange` 로 제어하는 행 선택. 헤더 체크박스는 3-상태(전체선택/일부선택/미선택)이며, 선택된 행은 `aria-selected` 와 accent 강조를 받는다.",
			},
		},
	},
	render: () => {
		const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

		return (
			<div style={{ display: "grid", gap: 12 }}>
				<div style={{ fontSize: 13, color: "var(--bt-color-text-body)" }}>
					선택됨 {selectedKeys.length}건 / {selectedKeys.length} selected
				</div>
				<Table<User>
					columns={columns}
					data={sampleUsers}
					keyExtractor={(u) => u.id}
					selectable
					rowKey={(u) => String(u.id)}
					selectedKeys={selectedKeys}
					onSelectionChange={setSelectedKeys}
					ariaLabel="선택 가능한 사용자 목록"
				/>
			</div>
		);
	},
};

export const SortableAndSelectable: Story = {
	name: "정렬 + 선택 조합",
	parameters: {
		docs: {
			description: {
				story:
					"Sort and selection compose independently - both are controlled, and neither DS feature touches `data` directly. / 정렬과 선택은 서로 독립적으로 조합된다 - 둘 다 제어형이며 DS는 `data` 를 직접 건드리지 않는다.",
			},
		},
	},
	render: () => {
		const [sort, setSort] = useState<TableSort | null>(null);
		const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

		const sortableColumns: TableColumn<User>[] = columns.map((col) =>
			col.key === "name" || col.key === "role" ? { ...col, sortable: true } : col,
		);

		const sortedUsers = [...sampleUsers].sort((a, b) => {
			if (!sort) return 0;
			const key = sort.key as keyof User;
			const compared = String(a[key]).localeCompare(String(b[key]), "ko");
			return sort.direction === "asc" ? compared : -compared;
		});

		return (
			<Table<User>
				columns={sortableColumns}
				data={sortedUsers}
				keyExtractor={(u) => u.id}
				sort={sort ?? undefined}
				onSortChange={setSort}
				selectable
				rowKey={(u) => String(u.id)}
				selectedKeys={selectedKeys}
				onSelectionChange={setSelectedKeys}
				ariaLabel="정렬 및 선택 가능한 사용자 목록"
			/>
		);
	},
};
