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
});
