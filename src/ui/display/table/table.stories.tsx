import type { Meta, StoryObj } from "@storybook/react";
import { Table, type TableColumn } from ".";

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
			const colorMap = { active: "#10B981", invited: "#F59E0B", disabled: "#999999" };
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
**Table** — Displays structured data in rows/columns with generic row type safety. / **Table** — 정형 데이터 행/열 표시. 제네릭 row 타입 안전.

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
