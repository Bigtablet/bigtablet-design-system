import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import { Dropdown } from "../../forms/dropdown";
import { Chip } from "../chip";
import type { TableColumn } from "../table";
import { DataView } from ".";

interface User extends Record<string, unknown> {
	id: string;
	name: string;
	email: string;
	status: "active" | "invited";
}

const USERS: User[] = [
	{ id: "1", name: "박상민", email: "sangmin@bigtablet.com", status: "active" },
	{ id: "2", name: "김민준", email: "minjun@bigtablet.com", status: "active" },
	{ id: "3", name: "이서연", email: "seoyeon@bigtablet.com", status: "invited" },
	{ id: "4", name: "박지훈", email: "jihoon@bigtablet.com", status: "active" },
	{ id: "5", name: "최유진", email: "yujin@bigtablet.com", status: "invited" },
];

const COLUMNS: TableColumn<User>[] = [
	{ key: "name", header: "이름", sortable: true, render: (u) => u.name },
	{ key: "email", header: "이메일", render: (u) => u.email },
	{
		key: "status",
		header: "상태",
		width: "120px",
		render: (u) => (
			<Chip
				type="static"
				size="sm"
				tone={u.status === "active" ? "accent" : "default"}
				label={u.status === "active" ? "활성" : "초대됨"}
			/>
		),
	},
];

const meta: Meta<typeof DataView> = {
	title: "Components/Display/DataView",
	component: DataView,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**DataView** - 목록 화면 한 벌. 검색·필터, 표, 선택 액션, 페이지네이션, 그리고 **네 상태 분기**
(loading / error / empty / data)를 한 곳에 둔다.

새로 그리는 것은 거의 없다 - \`Table\`·\`Pagination\`·\`EmptyState\`·\`ErrorState\`·\`TextField\`·
\`Button\` 을 그대로 쓴다. \`Table\` 이 정렬·선택·스켈레톤을 이미 처리하므로, 이 컴포넌트가 파는
것은 **그 위아래를 매번 다시 만들지 않는 것**이다 - 특히 에러 상태를 빠뜨린 목록이 생기지 않게.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof DataView<User>>;

const rowKey = (u: User) => u.id;

export const Basic: Story = {
	name: "기본",
	render: () => (
		<div style={{ width: 720 }}>
			<DataView query={{ data: USERS }} columns={COLUMNS} rowKey={rowKey} ariaLabel="사용자 목록" />
		</div>
	),
};

export const FullScreen: Story = {
	name: "검색 + 필터 + 선택 + 페이지네이션",
	parameters: {
		docs: {
			description: {
				story:
					'관리자 목록 화면의 전형. 행을 체크하면 선택 액션 줄이 표 위에 나타나고, 개수는 `role="status"` 로 스크린리더에도 전달된다.',
			},
		},
	},
	render: () => {
		const [search, setSearch] = useState("");
		const [status, setStatus] = useState<string | null>(null);
		const [page, setPage] = useState(1);

		const filtered = useMemo(
			() =>
				USERS.filter(
					(u) =>
						(!search || u.name.includes(search) || u.email.includes(search)) &&
						(!status || u.status === status),
				),
			[search, status],
		);

		return (
			<div style={{ width: 720 }}>
				<DataView
					query={{ data: filtered }}
					columns={COLUMNS}
					rowKey={rowKey}
					ariaLabel="사용자 목록"
					toolbar={{
						search: true,
						searchValue: search,
						onSearchChange: (v) => {
							setSearch(v);
							setPage(1);
						},
						searchPlaceholder: "이름 · 이메일 검색",
						filters: (
							<Dropdown
								size="sm"
								placeholder="상태"
								options={[
									{ value: "active", label: "활성" },
									{ value: "invited", label: "초대됨" },
								]}
								value={status}
								onValueChange={setStatus}
							/>
						),
					}}
					selectionActions={[
						{ label: "내보내기", onRun: (keys) => alert(`내보내기: ${keys.join(", ")}`) },
						{ label: "삭제", danger: true, onRun: (keys) => alert(`삭제: ${keys.join(", ")}`) },
					]}
					pagination={{ page, totalPages: 3, onPageChange: setPage }}
				/>
			</div>
		);
	},
};

export const Loading: Story = {
	name: "로딩 (스켈레톤)",
	render: () => (
		<div style={{ width: 720 }}>
			<DataView
				query={{ data: [], isLoading: true }}
				columns={COLUMNS}
				rowKey={rowKey}
				ariaLabel="사용자 목록"
			/>
		</div>
	),
};

export const Empty: Story = {
	name: "빈 상태",
	render: () => (
		<div style={{ width: 720 }}>
			<DataView query={{ data: [] }} columns={COLUMNS} rowKey={rowKey} ariaLabel="사용자 목록" />
		</div>
	),
};

export const ErrorWithRetry: Story = {
	name: "실패 + 재시도",
	parameters: {
		docs: {
			description: {
				story:
					"`refetch` 를 넘기면 재시도 버튼이 붙는다. 없으면 버튼 없이 실패 상태만 보인다 - 누를 수 없는 버튼을 띄우지 않는다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 720 }}>
			<DataView
				query={{
					data: undefined,
					error: new Error("network"),
					refetch: () => alert("다시 불러오기"),
				}}
				columns={COLUMNS}
				rowKey={rowKey}
				ariaLabel="사용자 목록"
			/>
		</div>
	),
};
