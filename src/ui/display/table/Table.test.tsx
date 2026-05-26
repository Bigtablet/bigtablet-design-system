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
