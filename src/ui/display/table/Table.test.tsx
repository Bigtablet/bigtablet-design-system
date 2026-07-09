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
		expect(onSortChange).toHaveBeenLastCalledWith(null);
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
});
