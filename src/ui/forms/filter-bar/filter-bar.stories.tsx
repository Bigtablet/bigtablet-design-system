import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { DataView } from "../../display/data-view";
import type { TableColumn } from "../../display/table";
import { Dropdown } from "../dropdown";
import { SegmentedControl } from "../segmented-control";
import { TextField } from "../textfield";
import { FilterBar } from ".";

const meta: Meta<typeof FilterBar> = {
	title: "Components/Forms/FilterBar",
	component: FilterBar,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**FilterBar** - 목록 화면 상단의 필터 묶음. \`<form role="search">\` 라 입력에서 Enter 로 검색되고, 필드는 칸이 \`fieldMinWidth\`(기본 200px)보다 좁아지면 줄을 바꿉니다. 좁은 화면(< 600px)에서는 버튼이 필드 아래 전폭으로 내려갑니다.

**상태를 갖지 않습니다.** 입력 중인 값(draft)과 적용된 값(query), URL 동기화는 소비자가 가지고, FilterBar 는 배치 · Enter 제출 · 검색/초기화 버튼만 맡습니다. \`canSubmit\` · \`canReset\` 으로 버튼을 막고, \`loading\` 이면 검색 버튼에 스피너가 돌며 중복 제출이 막힙니다.
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof FilterBar>;

const STATUS = [
	{ value: "active", label: "활성" },
	{ value: "invited", label: "초대됨" },
	{ value: "blocked", label: "차단" },
];

interface MemberFilter {
	name: string;
	email: string;
	status: string | null;
}
const EMPTY_MEMBER: MemberFilter = { name: "", email: "", status: null };
const isEmpty = (f: MemberFilter) => !f.name && !f.email && !f.status;

/** 관리자 화면 1 - 회원 목록: 텍스트 2개 + 드롭다운 */
const MemberFilterDemo = () => {
	const [draft, setDraft] = React.useState(EMPTY_MEMBER);
	const [applied, setApplied] = React.useState(EMPTY_MEMBER);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
			<FilterBar
				aria-label="회원 필터"
				onSubmit={() => setApplied(draft)}
				onReset={() => {
					setDraft(EMPTY_MEMBER);
					setApplied(EMPTY_MEMBER);
				}}
				canReset={!isEmpty(draft) || !isEmpty(applied)}
			>
				<TextField
					label="이름"
					value={draft.name}
					onValueChange={(name) => setDraft({ ...draft, name })}
				/>
				<TextField
					label="이메일"
					value={draft.email}
					onValueChange={(email) => setDraft({ ...draft, email })}
				/>
				<Dropdown
					label="상태"
					placeholder="전체"
					options={STATUS}
					value={draft.status}
					onChange={(status) => setDraft({ ...draft, status })}
				/>
			</FilterBar>
			<code style={{ fontSize: 12 }}>적용된 필터: {JSON.stringify(applied)}</code>
		</div>
	);
};

export const MemberList: Story = {
	name: "회원 목록 필터",
	render: () => <MemberFilterDemo />,
};

/** 관리자 화면 2 - 주문 목록: 검색어 + 결제 수단(SegmentedControl) + 정렬, 검색 중 상태 */
export const OrderList: Story = {
	name: "주문 목록 필터 (검색 중)",
	render: () => {
		const [keyword, setKeyword] = React.useState("");
		const [method, setMethod] = React.useState("all");
		const [loading, setLoading] = React.useState(false);
		return (
			<FilterBar
				aria-label="주문 필터"
				fieldMinWidth={240}
				loading={loading}
				canSubmit={keyword.trim().length >= 2}
				onSubmit={() => {
					setLoading(true);
					setTimeout(() => setLoading(false), 1200);
				}}
				submitLabel="조회"
			>
				<TextField
					label="주문번호 · 고객명"
					placeholder="2글자 이상"
					value={keyword}
					onValueChange={setKeyword}
				/>
				<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
					<span id="order-method" style={{ fontSize: 13, fontWeight: 500 }}>
						결제 수단
					</span>
					<SegmentedControl
						aria-labelledby="order-method"
						value={method}
						onValueChange={setMethod}
						items={[
							{ value: "all", label: "전체" },
							{ value: "card", label: "카드" },
							{ value: "transfer", label: "이체" },
						]}
					/>
				</div>
			</FilterBar>
		);
	},
};

export const Mobile: Story = {
	name: "모바일 (375px)",
	globals: { viewport: { value: "compact" } },
	render: () => <MemberFilterDemo />,
};

interface User extends Record<string, unknown> {
	id: string;
	name: string;
	status: string;
}
const USERS: User[] = [
	{ id: "1", name: "박상민", status: "active" },
	{ id: "2", name: "김민준", status: "invited" },
	{ id: "3", name: "이서연", status: "active" },
];
const COLUMNS: TableColumn<User>[] = [
	{ key: "name", header: "이름", render: (u) => u.name },
	{ key: "status", header: "상태", render: (u) => STATUS.find((s) => s.value === u.status)?.label },
];

export const InDataView: Story = {
	name: "DataView toolbar 에 넣기",
	render: () => {
		const [draft, setDraft] = React.useState<string | null>(null);
		const [status, setStatus] = React.useState<string | null>(null);
		const rows = status ? USERS.filter((u) => u.status === status) : USERS;
		return (
			<DataView
				query={{ data: rows }}
				columns={COLUMNS}
				rowKey={(u) => u.id}
				ariaLabel="회원 목록"
				toolbar={{
					filters: (
						<FilterBar
							aria-label="회원 필터"
							onSubmit={() => setStatus(draft)}
							onReset={() => {
								setDraft(null);
								setStatus(null);
							}}
							canReset={draft !== null || status !== null}
						>
							<Dropdown
								label="상태"
								placeholder="전체"
								options={STATUS}
								value={draft}
								onChange={setDraft}
							/>
						</FilterBar>
					),
				}}
			/>
		);
	},
};
