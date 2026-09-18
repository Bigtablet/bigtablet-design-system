import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { TableColumn } from "../table";
import { DataView } from "./index";

interface User extends Record<string, unknown> {
	id: string;
	name: string;
}

const COLUMNS: TableColumn<User>[] = [{ key: "name", header: "이름", render: (u) => u.name }];

const USERS: User[] = [
	{ id: "1", name: "박상민" },
	{ id: "2", name: "김민준" },
];

const rowKey = (u: User) => u.id;

describe("DataView", () => {
	// ── 네 상태 분기 ────────────────────────────────────────────────────────
	// 이 넷을 한 곳에서 가르는 것이 DataView 의 존재 이유다. 화면마다 손으로 분기하면
	// 에러 상태를 빠뜨린 목록이 생긴다.

	describe("state branching", () => {
		it("shows the table when data arrives", () => {
			render(<DataView query={{ data: USERS }} columns={COLUMNS} rowKey={rowKey} />);

			expect(screen.getByRole("table")).toBeInTheDocument();
			expect(screen.getByText("박상민")).toBeInTheDocument();
		});

		it("shows the error state instead of the table when the query failed", () => {
			render(
				<DataView
					query={{ data: undefined, error: new Error("boom") }}
					columns={COLUMNS}
					rowKey={rowKey}
				/>,
			);

			expect(screen.queryByRole("table")).not.toBeInTheDocument();
			expect(screen.getByText("불러오지 못했습니다")).toBeInTheDocument();
		});

		it("offers a retry only when the query can refetch", () => {
			const refetch = vi.fn();
			const { rerender } = render(
				<DataView
					query={{ data: undefined, error: new Error("boom"), refetch }}
					columns={COLUMNS}
					rowKey={rowKey}
				/>,
			);

			fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
			expect(refetch).toHaveBeenCalledTimes(1);

			rerender(
				<DataView
					query={{ data: undefined, error: new Error("boom") }}
					columns={COLUMNS}
					rowKey={rowKey}
				/>,
			);
			expect(screen.queryByRole("button", { name: "다시 시도" })).not.toBeInTheDocument();
		});

		it("shows the empty state when the query returned nothing", () => {
			render(<DataView query={{ data: [] }} columns={COLUMNS} rowKey={rowKey} />);

			expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
			expect(screen.queryByRole("table")).not.toBeInTheDocument();
		});

		it("keeps the table while loading so the skeleton shows instead of the empty state", () => {
			// 빈 배열 + 로딩을 empty 로 처리하면 "없음 -> 스켈레톤 -> 데이터" 로 두 번 깜빡인다.
			render(<DataView query={{ data: [], isLoading: true }} columns={COLUMNS} rowKey={rowKey} />);

			expect(screen.queryByText("데이터가 없습니다")).not.toBeInTheDocument();
			expect(screen.getByRole("table")).toBeInTheDocument();
		});
	});

	// ── 선택 액션 ───────────────────────────────────────────────────────────

	describe("selection", () => {
		it("adds the checkbox column only when there are selection actions", () => {
			const { rerender } = render(
				<DataView query={{ data: USERS }} columns={COLUMNS} rowKey={rowKey} />,
			);
			expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

			rerender(
				<DataView
					query={{ data: USERS }}
					columns={COLUMNS}
					rowKey={rowKey}
					selectionActions={[{ label: "삭제", onRun: vi.fn() }]}
				/>,
			);
			expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
		});

		it("reveals the action bar with the selected keys and announces the count", () => {
			const onRun = vi.fn();
			render(
				<DataView
					query={{ data: USERS }}
					columns={COLUMNS}
					rowKey={rowKey}
					selectionActions={[{ label: "삭제", danger: true, onRun }]}
				/>,
			);

			expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();

			// 첫 데이터 행의 체크박스 (0번은 전체 선택)
			fireEvent.click(screen.getAllByRole("checkbox")[1]);

			// role="status" - 선택이 바뀌면 스크린리더가 개수를 읽는다.
			expect(screen.getByRole("status")).toHaveTextContent("1개 선택됨");

			fireEvent.click(screen.getByRole("button", { name: "삭제" }));
			expect(onRun).toHaveBeenCalledWith(["1"]);
		});

		it("clears the selection and hides the bar", () => {
			render(
				<DataView
					query={{ data: USERS }}
					columns={COLUMNS}
					rowKey={rowKey}
					selectionActions={[{ label: "삭제", onRun: vi.fn() }]}
				/>,
			);

			fireEvent.click(screen.getAllByRole("checkbox")[1]);
			fireEvent.click(screen.getByRole("button", { name: "선택 해제" }));

			expect(screen.queryByRole("status")).not.toBeInTheDocument();
		});
	});

	// ── 툴바 · 페이지네이션 ─────────────────────────────────────────────────

	it("wires the search box to onSearchChange", () => {
		const onSearchChange = vi.fn();
		render(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				toolbar={{ search: true, searchValue: "", onSearchChange }}
			/>,
		);

		fireEvent.change(screen.getByRole("searchbox"), { target: { value: "박" } });
		expect(onSearchChange).toHaveBeenCalledWith("박");
	});

	it("hides pagination when there is only one page", () => {
		// 한 페이지짜리 목록에 이전/다음이 떠 있으면 더 있는 것처럼 읽힌다.
		const { rerender } = render(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				pagination={{ page: 1, totalPages: 1, onPageChange: vi.fn() }}
			/>,
		);
		expect(screen.queryByRole("navigation")).not.toBeInTheDocument();

		rerender(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				pagination={{ page: 1, totalPages: 3, onPageChange: vi.fn() }}
			/>,
		);
		expect(screen.getByRole("navigation")).toBeInTheDocument();
	});
	it("drops selections that the new data no longer contains", () => {
		// 검색어를 바꾸면 박상민은 목록에서 사라지는데 선택은 남았다. 화면에는 체크된 칸이
		// 하나도 없는데 액션 줄이 "1개 선택됨" 이고, 삭제를 누르면 보이지 않는 그 행이 지워진다.
		const onRun = vi.fn();
		const View = ({ data }: { data: User[] }) => (
			<DataView
				query={{ data }}
				columns={COLUMNS}
				rowKey={rowKey}
				selectionActions={[{ label: "삭제", danger: true, onRun }]}
			/>
		);

		const { rerender } = render(<View data={USERS} />);
		fireEvent.click(screen.getAllByRole("checkbox")[1]);
		expect(screen.getByRole("status")).toHaveTextContent("1개 선택됨");

		rerender(<View data={USERS.filter((u) => u.id !== "1")} />);

		expect(screen.queryByRole("status")).not.toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
	});
	it("numbers row checkboxes across pages when pageSize is given", () => {
		// 쪽을 넘겨도 라벨이 "1번째 행 선택" 으로 되돌아가면 어느 쪽인지 알 수 없다.
		render(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				selectionActions={[{ label: "삭제", onRun: vi.fn() }]}
				pagination={{ page: 3, totalPages: 5, pageSize: 10, onPageChange: vi.fn() }}
			/>,
		);

		expect(screen.getByRole("checkbox", { name: "21번째 행 선택" })).toBeInTheDocument();
	});

	it("keeps page-local numbering when pageSize is absent", () => {
		// pageSize 없이는 전체 순번을 계산할 수 없다 - 예전 동작을 유지한다.
		render(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				selectionActions={[{ label: "삭제", onRun: vi.fn() }]}
				pagination={{ page: 3, totalPages: 5, onPageChange: vi.fn() }}
			/>,
		);

		expect(screen.getByRole("checkbox", { name: "1번째 행 선택" })).toBeInTheDocument();
	});

	it("passes custom selection labels through to the table", () => {
		// 기본 라벨은 순번만 읽는다 - 행을 이름으로 구분하려면 소비자가 바깥 rows 를 닫아 넘긴다.
		render(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				selectionActions={[{ label: "삭제", onRun: vi.fn() }]}
				selectAllAriaLabel="사용자 전체 선택"
				selectRowAriaLabel={(_, row) => `${row.name} 선택`}
			/>,
		);

		expect(screen.getByRole("checkbox", { name: "사용자 전체 선택" })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: "박상민 선택" })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: "김민준 선택" })).toBeInTheDocument();
	});

	it("offsets the custom row label by the page when pageSize is given", () => {
		// 커스텀 라벨도 전체 순번을 받아야 3쪽의 첫 행이 1번으로 읽히지 않는다.
		render(
			<DataView
				query={{ data: USERS }}
				columns={COLUMNS}
				rowKey={rowKey}
				selectionActions={[{ label: "삭제", onRun: vi.fn() }]}
				pagination={{ page: 3, totalPages: 5, pageSize: 10, onPageChange: vi.fn() }}
				selectRowAriaLabel={(index, row) => `${index + 1}행 ${row.name} 선택`}
			/>,
		);

		// 첫 인자는 전체 순번, 둘째는 그 쪽의 행 - 오프셋을 소비자가 다시 계산할 필요가 없다.
		expect(screen.getByRole("checkbox", { name: "21행 박상민 선택" })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: "22행 김민준 선택" })).toBeInTheDocument();
	});
});
