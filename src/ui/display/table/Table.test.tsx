import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, type TableColumn } from "./index";

interface Row {
	id: number;
	name: string;
	score: number;
}

const rows: Row[] = [
	{ id: 1, name: "Alpha", score: 90 },
	{ id: 2, name: "Beta", score: 80 },
];

const columns: TableColumn<Row>[] = [
	{ key: "name", header: "Name" },
	{ key: "score", header: "Score" },
];

describe("Table", () => {
	it("renders headers and rows", () => {
		render(<Table columns={columns} data={rows} keyExtractor={(r) => r.id} />);
		expect(screen.getByText("Name")).toBeInTheDocument();
		expect(screen.getByText("Score")).toBeInTheDocument();
		expect(screen.getByText("Alpha")).toBeInTheDocument();
		expect(screen.getByText("Beta")).toBeInTheDocument();
	});

	it("shows empty message when no data and not loading", () => {
		render(<Table columns={columns} data={[]} keyExtractor={(r: Row) => r.id} />);
		expect(screen.getByText("데이터가 없습니다")).toBeInTheDocument();
	});

	it("shows custom empty message", () => {
		render(
			<Table
				columns={columns}
				data={[]}
				keyExtractor={(r: Row) => r.id}
				emptyMessage="결과 없음"
			/>,
		);
		expect(screen.getByText("결과 없음")).toBeInTheDocument();
	});

	it("renders skeleton rows when isLoading=true", () => {
		const { container } = render(
			<Table
				columns={columns}
				data={[]}
				keyExtractor={(r: Row) => r.id}
				isLoading
				skeletonRows={3}
			/>,
		);
		expect(container.querySelectorAll(".table_row_skeleton")).toHaveLength(3);
		// empty message should NOT show during loading
		expect(screen.queryByText("데이터가 없습니다")).not.toBeInTheDocument();
	});

	it("renders custom cell content via render fn", () => {
		const cols: TableColumn<Row>[] = [
			{ key: "name", header: "Name" },
			{ key: "score", header: "Score", render: (r) => `${r.score}점` },
		];
		render(<Table columns={cols} data={rows} keyExtractor={(r) => r.id} />);
		expect(screen.getByText("90점")).toBeInTheDocument();
		expect(screen.getByText("80점")).toBeInTheDocument();
	});

	it("renders dash for null/undefined/empty values", () => {
		const data = [{ id: 1, name: "", score: 0 }] as Row[];
		const { container } = render(<Table columns={columns} data={data} keyExtractor={(r) => r.id} />);
		// First td (name) is empty string → "-"
		const tds = container.querySelectorAll("td");
		expect(tds[0].textContent).toBe("-");
		// Score 0 is rendered as "0"
		expect(tds[1].textContent).toBe("0");
	});

	it("calls onRowClick with item and index", () => {
		const onRowClick = vi.fn();
		render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				onRowClick={onRowClick}
			/>,
		);
		fireEvent.click(screen.getByText("Alpha"));
		expect(onRowClick).toHaveBeenCalledWith(rows[0], 0);
	});

	it("applies size class", () => {
		const { container } = render(
			<Table columns={columns} data={rows} keyExtractor={(r) => r.id} size="lg" />,
		);
		expect(container.firstChild).toHaveClass("table_size_lg");
	});

	it("applies stickyHeader class", () => {
		const { container } = render(
			<Table columns={columns} data={rows} keyExtractor={(r) => r.id} stickyHeader />,
		);
		expect(container.firstChild).toHaveClass("table_sticky_header");
	});

	it("applies aria-label on table", () => {
		render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				ariaLabel="결과 목록"
			/>,
		);
		expect(screen.getByRole("table")).toHaveAttribute("aria-label", "결과 목록");
	});
});

describe("Table sort", () => {
	const sortableColumns: TableColumn<Row>[] = [
		{ key: "name", header: "Name", sortable: true },
		{ key: "score", header: "Score", sortable: true },
	];

	it("renders aria-sort='none' on sortable headers when unsorted", () => {
		render(<Table columns={sortableColumns} data={rows} keyExtractor={(r) => r.id} />);
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
			"aria-sort",
			"none",
		);
		expect(screen.getByRole("columnheader", { name: "Score" })).toHaveAttribute(
			"aria-sort",
			"none",
		);
	});

	it("does not set aria-sort on non-sortable columns", () => {
		render(<Table columns={columns} data={rows} keyExtractor={(r) => r.id} />);
		expect(screen.getByRole("columnheader", { name: "Name" })).not.toHaveAttribute("aria-sort");
	});

	it("cycles a column through none -> asc -> desc -> none on click", () => {
		const onSortChange = vi.fn();
		const { rerender } = render(
			<Table
				columns={sortableColumns}
				data={rows}
				keyExtractor={(r) => r.id}
				sort={undefined}
				onSortChange={onSortChange}
			/>,
		);
		const nameHeaderButton = screen.getByRole("button", { name: "Name" });

		fireEvent.click(nameHeaderButton);
		expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "asc" });

		rerender(
			<Table
				columns={sortableColumns}
				data={rows}
				keyExtractor={(r) => r.id}
				sort={{ key: "name", direction: "asc" }}
				onSortChange={onSortChange}
			/>,
		);
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
			"aria-sort",
			"ascending",
		);

		fireEvent.click(screen.getByRole("button", { name: "Name" }));
		expect(onSortChange).toHaveBeenLastCalledWith({ key: "name", direction: "desc" });

		rerender(
			<Table
				columns={sortableColumns}
				data={rows}
				keyExtractor={(r) => r.id}
				sort={{ key: "name", direction: "desc" }}
				onSortChange={onSortChange}
			/>,
		);
		expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
			"aria-sort",
			"descending",
		);

		fireEvent.click(screen.getByRole("button", { name: "Name" }));
		expect(onSortChange).toHaveBeenLastCalledWith(undefined);
	});

	it("clicking a different column starts it at asc regardless of previous column state", () => {
		const onSortChange = vi.fn();
		render(
			<Table
				columns={sortableColumns}
				data={rows}
				keyExtractor={(r) => r.id}
				sort={{ key: "name", direction: "desc" }}
				onSortChange={onSortChange}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Score" }));
		expect(onSortChange).toHaveBeenCalledWith({ key: "score", direction: "asc" });
	});

	it("emits undefined (not null) when a desc-sorted column is clicked again to clear sort", () => {
		const onSortChange = vi.fn();
		render(
			<Table
				columns={sortableColumns}
				data={rows}
				keyExtractor={(r) => r.id}
				sort={{ key: "name", direction: "desc" }}
				onSortChange={onSortChange}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Name" }));
		expect(onSortChange).toHaveBeenLastCalledWith(undefined);
	});

	it("does not sort data itself - relies on consumer-provided data order", () => {
		render(
			<Table
				columns={sortableColumns}
				data={rows}
				keyExtractor={(r) => r.id}
				sort={{ key: "name", direction: "desc" }}
				onSortChange={vi.fn()}
			/>,
		);
		const cells = screen.getAllByRole("cell");
		// rows prop order (Alpha, Beta) is unchanged even though sort=desc is set
		expect(cells[0]).toHaveTextContent("Alpha");
	});
});

describe("Table selection", () => {
	it("renders a checkbox column when selectable", () => {
		render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
			/>,
		);
		// 1 select-all + 2 row checkboxes
		expect(screen.getAllByRole("checkbox")).toHaveLength(3);
	});

	it("select-all is unchecked when nothing selected, checked when all selected, indeterminate when some selected", () => {
		const { rerender } = render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={[]}
			/>,
		);
		const selectAll = screen.getByRole("checkbox", { name: "전체 선택" }) as HTMLInputElement;
		expect(selectAll.checked).toBe(false);
		expect(selectAll.indeterminate).toBe(false);

		rerender(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={["1"]}
			/>,
		);
		expect(selectAll.indeterminate).toBe(true);
		expect(selectAll.checked).toBe(false);

		rerender(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={["1", "2"]}
			/>,
		);
		expect(selectAll.indeterminate).toBe(false);
		expect(selectAll.checked).toBe(true);
	});

	it("toggling select-all selects all row keys, toggling again clears them", () => {
		const onSelectionChange = vi.fn();
		const { rerender } = render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={[]}
				onSelectionChange={onSelectionChange}
			/>,
		);
		fireEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
		expect(onSelectionChange).toHaveBeenLastCalledWith(["1", "2"]);

		rerender(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={["1", "2"]}
				onSelectionChange={onSelectionChange}
			/>,
		);
		fireEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
		expect(onSelectionChange).toHaveBeenLastCalledWith([]);
	});

	it("toggles an individual row via rowKey mapping and marks it aria-selected", () => {
		const onSelectionChange = vi.fn();
		render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={["1"]}
				onSelectionChange={onSelectionChange}
			/>,
		);

		const rowsInTable = screen.getAllByRole("row");
		// rowsInTable[0] is header row; body rows follow
		expect(rowsInTable[1]).toHaveAttribute("aria-selected", "true");
		expect(rowsInTable[2]).not.toHaveAttribute("aria-selected");

		const betaCheckbox = screen.getByRole("checkbox", { name: "2번째 행 선택" });
		fireEvent.click(betaCheckbox);
		expect(onSelectionChange).toHaveBeenCalledWith(["1", "2"]);

		const alphaCheckbox = screen.getByRole("checkbox", { name: "1번째 행 선택" });
		fireEvent.click(alphaCheckbox);
		expect(onSelectionChange).toHaveBeenCalledWith([]);
	});

	it("toggling select-all preserves keys selected on other pages (server pagination)", () => {
		const onSelectionChange = vi.fn();
		// "99" belongs to a row not present in the current page's `data`
		const { rerender } = render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={["99"]}
				onSelectionChange={onSelectionChange}
			/>,
		);
		fireEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
		const firstCallKeys = onSelectionChange.mock.calls[0][0] as string[];
		expect(new Set(firstCallKeys)).toEqual(new Set(["99", "1", "2"]));

		rerender(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={["99", "1", "2"]}
				onSelectionChange={onSelectionChange}
			/>,
		);
		fireEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
		expect(onSelectionChange).toHaveBeenLastCalledWith(["99"]);
	});

	it("supports custom selectAllAriaLabel / selectRowAriaLabel", () => {
		render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={[]}
				selectAllAriaLabel="Select all rows"
				selectRowAriaLabel={(index) => `Select row ${index + 1}`}
			/>,
		);
		expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: "Select row 1" })).toBeInTheDocument();
		expect(screen.getByRole("checkbox", { name: "Select row 2" })).toBeInTheDocument();
	});

	it("disables the select-all checkbox while isLoading", () => {
		render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={[]}
				isLoading
			/>,
		);
		expect(screen.getByRole("checkbox", { name: "전체 선택" })).toBeDisabled();
	});
});

describe("Table isLoading guards", () => {
	const sortableColumns: TableColumn<Row>[] = [{ key: "name", header: "Name", sortable: true }];

	it("disables sortable header buttons while isLoading", () => {
		render(
			<Table columns={sortableColumns} data={rows} keyExtractor={(r) => r.id} isLoading />,
		);
		expect(screen.getByRole("button", { name: "Name" })).toBeDisabled();
	});

	it("does not crash when selectedKeys is null", () => {
		expect(() =>
			render(
				<Table
					columns={columns}
					data={rows}
					keyExtractor={(r) => r.id}
					selectable
					rowKey={(r) => String(r.id)}
					selectedKeys={null as unknown as string[]}
					onSelectionChange={() => {}}
				/>,
			),
		).not.toThrow();
	});

	it("keeps native row semantics (no button role) when selectable and clickable", () => {
		const { container } = render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				onRowClick={() => {}}
				selectable
				rowKey={(r) => String(r.id)}
				selectedKeys={[]}
				onSelectionChange={() => {}}
			/>,
		);
		const row = container.querySelector(".table_row");
		// role="button" 은 aria-selected 와 무효 조합이라 제거하되, 키보드 진입용 tabindex 는 유지
		expect(row).not.toHaveAttribute("role", "button");
		expect(row).toHaveAttribute("tabindex", "0");
	});

	it("makes clickable rows keyboard-operable without hiding cell content", () => {
		const onRowClick = vi.fn();
		const { container } = render(
			<Table columns={columns} data={rows} keyExtractor={(r) => r.id} onRowClick={onRowClick} />,
		);
		const row = container.querySelector(".table_row") as HTMLElement;
		// 셀을 가리는 role="button"/aria-label 을 tr 에 붙이지 않음
		expect(row).not.toHaveAttribute("role", "button");
		expect(row).not.toHaveAttribute("aria-label");
		// 셀 데이터는 그대로 낭독됨
		expect(row.textContent).toContain("Alpha");
		// focus 가능 + Enter 로 동작
		expect(row).toHaveAttribute("tabindex", "0");
		fireEvent.keyDown(row, { key: "Enter" });
		expect(onRowClick).toHaveBeenCalledTimes(1);
	});

	it("describes clickable rows via aria-describedby (rowClickHint), not aria-label", () => {
		const { container } = render(
			<Table
				columns={columns}
				data={rows}
				keyExtractor={(r) => r.id}
				onRowClick={() => {}}
				rowClickHint="행을 선택하면 상세로 이동"
			/>,
		);
		const row = container.querySelector(".table_row") as HTMLElement;
		const describedby = row.getAttribute("aria-describedby");
		expect(describedby).toBeTruthy();
		expect(document.getElementById(describedby as string)?.textContent).toBe(
			"행을 선택하면 상세로 이동",
		);
		expect(row).not.toHaveAttribute("aria-label");
		expect(row.textContent).toContain("Alpha");
	});
});
