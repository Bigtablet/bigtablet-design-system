import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table } from "../../display/table";
import { Modal } from "../../overlay/modal";
import { en, ko, LocaleProvider, useLocaleName, useLocaleText } from "./index";
import type { LocaleKey } from "./messages";

const Probe = ({ msgKey, vars }: { msgKey: LocaleKey; vars?: Record<string, string | number> }) => {
	const t = useLocaleText();
	return <span data-testid="out">{t(msgKey, vars)}</span>;
};

const out = () => screen.getByTestId("out").textContent;

describe("LocaleProvider", () => {
	it("falls back to Korean without a provider", () => {
		// Provider 를 안 감싼 기존 소비자의 화면이 바뀌면 안 된다.
		render(<Probe msgKey="modal.close" />);
		expect(out()).toBe("닫기");
	});

	it("switches the whole catalog by name", () => {
		render(
			<LocaleProvider locale="en">
				<Probe msgKey="table.empty" />
			</LocaleProvider>,
		);
		expect(out()).toBe("No data");
	});

	it("overrides one line on top of the base catalog", () => {
		// 한 줄만 바꾸고 나머지는 기준을 그대로 쓰는 것이 이 prop 의 목적이다.
		render(
			<LocaleProvider messages={{ "table.empty": "주문이 없습니다" }}>
				<>
					<Probe msgKey="table.empty" />
					<span data-testid="untouched">
						<Probe msgKey="modal.close" />
					</span>
				</>
			</LocaleProvider>,
		);
		expect(screen.getAllByTestId("out")[0].textContent).toBe("주문이 없습니다");
		expect(screen.getAllByTestId("out")[1].textContent).toBe("닫기");
	});

	it("overrides on top of a non-default base", () => {
		render(
			<LocaleProvider locale="en" messages={{ "table.empty": "Nothing here" }}>
				<>
					<Probe msgKey="table.empty" />
					<Probe msgKey="modal.close" />
				</>
			</LocaleProvider>,
		);
		expect(screen.getAllByTestId("out")[0].textContent).toBe("Nothing here");
		expect(screen.getAllByTestId("out")[1].textContent).toBe("Close");
	});

	it("fills placeholders from vars", () => {
		render(<Probe msgKey="table.selectRow" vars={{ index: 3 }} />);
		expect(out()).toBe("3번째 행 선택");
	});

	it("leaves an unfilled placeholder visible", () => {
		// 조용히 빈 칸이 되면 화면에서 무엇이 빠졌는지 알 수 없다.
		render(<Probe msgKey="table.selectRow" vars={{ wrong: 3 }} />);
		expect(out()).toBe("{index}번째 행 선택");
	});

	it("reports the locale name for consumer-side formatting", () => {
		const Name = () => <span data-testid="out">{useLocaleName()}</span>;
		const { rerender } = render(<Name />);
		expect(out()).toBe("ko");

		rerender(
			<LocaleProvider locale="en">
				<Name />
			</LocaleProvider>,
		);
		expect(out()).toBe("en");
	});

	it("keeps both catalogs on the same keys", () => {
		// 한쪽에만 키가 있으면 그 화면만 다른 언어로 남는다.
		expect(Object.keys(en).sort()).toEqual(Object.keys(ko).sort());
	});

	it("has no empty message in either catalog", () => {
		for (const [key, value] of [...Object.entries(ko), ...Object.entries(en)]) {
			expect(value, key).not.toBe("");
		}
	});
});

describe("LocaleProvider와 컴포넌트", () => {
	it("changes what a component renders without touching its props", () => {
		// 이 Provider 의 존재 이유다 - Modal 을 40번 쓰는 앱이 closeLabel 을 40번 적지 않게.
		render(
			<LocaleProvider locale="en">
				<Modal open title="Title" onClose={() => {}}>
					body
				</Modal>
			</LocaleProvider>,
		);

		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
	});

	it("lets an explicit prop win over the catalog", () => {
		// 인스턴스 단위 문구는 계속 prop 으로 바꿀 수 있어야 한다.
		render(
			<LocaleProvider locale="en">
				<Modal open title="Title" closeLabel="Dismiss" onClose={() => {}}>
					body
				</Modal>
			</LocaleProvider>,
		);

		expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
	});

	it("keeps Korean for components outside a provider", () => {
		render(
			<Modal open title="제목" onClose={() => {}}>
				본문
			</Modal>,
		);

		expect(screen.getByRole("button", { name: "닫기" })).toBeInTheDocument();
	});

	it("reaches a component nested deep in the tree", () => {
		// Table 은 Provider 와 여러 층 떨어져 있어도 같은 카탈로그를 봐야 한다.
		render(
			<LocaleProvider locale="en">
				<div>
					<section>
						<Table columns={[{ key: "a", header: "A" }]} data={[]} keyExtractor={() => "k"} />
					</section>
				</div>
			</LocaleProvider>,
		);

		expect(screen.getByText("No data")).toBeInTheDocument();
	});
});
