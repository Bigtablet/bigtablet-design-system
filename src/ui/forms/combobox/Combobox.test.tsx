import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxOption } from "./index";

const OPTIONS: ComboboxOption[] = [
	{ value: "1", label: "박상민" },
	{ value: "2", label: "김민준" },
];

/** 지연을 직접 제어하는 검색 - 응답 경합을 재현하려면 완료 시점을 잡아야 한다. */
const deferred = <T,>() => {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((r) => {
		resolve = r;
	});
	return { promise, resolve };
};

describe("Combobox", () => {
	beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
	afterEach(() => vi.useRealTimers());

	const open = () => fireEvent.focus(screen.getByRole("combobox"));
	const type = (value: string) =>
		fireEvent.change(screen.getByRole("combobox"), { target: { value } });

	it("distinguishes not-yet-searched from no-results", async () => {
		// 둘을 같은 문구로 묶으면 검색 전 빈 목록이 실패처럼 읽힌다.
		const onSearch = vi.fn().mockResolvedValue([]);
		render(<Combobox onSearch={onSearch} debounceMs={10} />);

		open();
		expect(screen.getByText("검색어를 입력하세요")).toBeInTheDocument();

		type("없는사람");
		await waitFor(() => expect(screen.getByText("일치하는 항목이 없습니다")).toBeInTheDocument());
	});

	it("waits out the debounce before searching", async () => {
		const onSearch = vi.fn().mockResolvedValue(OPTIONS);
		render(<Combobox onSearch={onSearch} debounceMs={200} />);

		open();
		type("박");
		type("박상");
		type("박상민");

		// 경계 직전까지는 호출되지 않는다. 동기 시점만 보면 0ms 타이머도 통과해버린다.
		await vi.advanceTimersByTimeAsync(150);
		expect(onSearch).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(60);
		expect(onSearch).toHaveBeenCalledTimes(1);
		expect(onSearch).toHaveBeenCalledWith("박상민");
	});

	it("drops a stale response that lands after a newer one", async () => {
		// 타이핑이 빠르면 응답 순서가 뒤집힌다. 늦게 온 옛 결과가 최신 목록을 덮으면
		// 방금 친 글자와 무관한 후보가 남는다.
		const first = deferred<ComboboxOption[]>();
		const second = deferred<ComboboxOption[]>();
		const onSearch = vi
			.fn()
			.mockImplementationOnce(() => first.promise)
			.mockImplementationOnce(() => second.promise);

		render(<Combobox onSearch={onSearch} debounceMs={10} />);
		open();

		type("김");
		await vi.advanceTimersByTimeAsync(10);
		type("박");
		await vi.advanceTimersByTimeAsync(10);

		// 최신(두 번째)이 먼저 도착
		second.resolve([{ value: "2", label: "박상민" }]);
		await waitFor(() => expect(screen.getByText("박상민")).toBeInTheDocument());

		// 뒤늦게 도착한 첫 번째 응답은 무시돼야 한다.
		// act 로 감싸 렌더까지 흘려보낸다 - 안 그러면 상태 갱신이 아직 반영되지 않아
		// "없다" 단정이 엉뚱한 이유로 통과한다(실제로 그렇게 통과하는 것을 확인했다).
		await act(async () => {
			first.resolve([{ value: "1", label: "김민준(옛 결과)" }]);
		});

		expect(screen.queryAllByRole("option").map((o) => o.textContent)).toEqual(["박상민"]);
	});

	it("shows a loading indicator while the search is in flight", async () => {
		const pending = deferred<ComboboxOption[]>();
		render(<Combobox onSearch={() => pending.promise} debounceMs={10} loadingLabel="검색 중" />);

		open();
		type("박");
		await vi.advanceTimersByTimeAsync(10);

		expect(screen.getByLabelText("검색 중")).toBeInTheDocument();

		pending.resolve(OPTIONS);
		await waitFor(() => expect(screen.queryByLabelText("검색 중")).not.toBeInTheDocument());
	});

	it("treats a failed search as no results rather than leaving stale options", async () => {
		const onSearch = vi
			.fn()
			.mockResolvedValueOnce(OPTIONS)
			.mockRejectedValueOnce(new Error("network"));

		render(<Combobox onSearch={onSearch} debounceMs={10} />);
		open();

		type("박");
		await vi.advanceTimersByTimeAsync(10);
		await waitFor(() => expect(screen.getByText("박상민")).toBeInTheDocument());

		type("박상");
		await vi.advanceTimersByTimeAsync(10);
		await waitFor(() => expect(screen.getByText("일치하는 항목이 없습니다")).toBeInTheDocument());
	});

	it("commits the option the user picks", async () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				onSearch={vi.fn().mockResolvedValue(OPTIONS)}
				debounceMs={10}
				onValueChange={onValueChange}
			/>,
		);

		open();
		type("박");
		await vi.advanceTimersByTimeAsync(10);
		await waitFor(() => expect(screen.getByText("박상민")).toBeInTheDocument());

		fireEvent.click(screen.getByText("박상민"));
		expect(onValueChange).toHaveBeenCalledWith(OPTIONS[0]);

		// 닫지 않으면 검색어가 비워지면서 effect 가 idle 로 되돌려, 방금 고른 라벨 대신
		// "검색어를 입력하세요" 가 열린 채로 남는다. onValueChange 만 보면 안 잡힌다.
		expect(screen.getByRole("combobox")).toHaveAttribute("aria-expanded", "false");
		expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
	});

	it("keeps focus on the input when the panel closes", async () => {
		// chevron 토글은 tabIndex=-1 인 장식이다. 거기로 포커스를 되돌리면 사용자는
		// 보이지 않는 곳에 서게 되고 이어지는 Tab 이 엉뚱한 데서 출발한다.
		render(<Combobox onSearch={vi.fn().mockResolvedValue(OPTIONS)} debounceMs={10} />);

		const input = screen.getByRole("combobox");
		input.focus();
		fireEvent.focus(input);
		type("박");
		await vi.advanceTimersByTimeAsync(10);
		await waitFor(() => expect(screen.getByText("박상민")).toBeInTheDocument());

		fireEvent.keyDown(input, { key: "Escape" });

		expect(document.activeElement).toBe(input);
	});

	it("drops an in-flight response when the query is cleared", async () => {
		// 지워서 빈 문자열로 가는 경로도 경합 대상이다. seq 를 올리지 않으면 나중에 도착한
		// 응답이 가드를 통과해 방금 리셋한 idle 상태를 낡은 결과로 덮는다.
		const pending = deferred<ComboboxOption[]>();
		render(<Combobox onSearch={() => pending.promise} debounceMs={10} />);

		open();
		type("박");
		await vi.advanceTimersByTimeAsync(10);

		type("");
		await vi.advanceTimersByTimeAsync(10);
		expect(screen.getByText("검색어를 입력하세요")).toBeInTheDocument();

		await act(async () => {
			pending.resolve(OPTIONS);
		});

		expect(screen.getByText("검색어를 입력하세요")).toBeInTheDocument();
		expect(screen.queryAllByRole("option")).toHaveLength(0);
	});

	it("only points aria-controls at a listbox that exists", async () => {
		// 안내 문구만 있는 동안에는 listbox 를 렌더하지 않는다. aria-controls 를 남겨두면
		// 보조기술이 없는 요소를 가리킨다.
		render(<Combobox onSearch={vi.fn().mockResolvedValue(OPTIONS)} debounceMs={10} />);

		open();
		const input = screen.getByRole("combobox");
		expect(screen.getByText("검색어를 입력하세요")).toBeInTheDocument();
		expect(input).not.toHaveAttribute("aria-controls");

		type("박");
		await vi.advanceTimersByTimeAsync(10);
		await waitFor(() => expect(screen.getByRole("listbox")).toBeInTheDocument());
		expect(document.getElementById(input.getAttribute("aria-controls") as string)).toBe(
			screen.getByRole("listbox"),
		);
	});

	it("points aria-activedescendant at the keyboard-active option", async () => {
		// 포커스는 입력에 남으므로, 스크린리더가 현재 항목을 알 방법은 이것뿐이다.
		render(<Combobox onSearch={vi.fn().mockResolvedValue(OPTIONS)} debounceMs={10} />);

		open();
		type("박");
		await vi.advanceTimersByTimeAsync(10);
		await waitFor(() => expect(screen.getByText("박상민")).toBeInTheDocument());

		const input = screen.getByRole("combobox");

		// 목록이 도착하면 훅이 활성 인덱스를 첫 항목으로 되돌린다. 그 effect 가 흐르기 전에
		// ArrowDown 을 보내면 -1 에서 출발해 첫 항목이 활성이 된다 - 실제로 이 테스트가
		// 그렇게 한 번 깜빡였다. 출발점을 먼저 확정하고 나서 이동을 검사한다.
		await waitFor(() =>
			expect(
				document.getElementById(input.getAttribute("aria-activedescendant") ?? ""),
			).toHaveTextContent("박상민"),
		);

		fireEvent.keyDown(input, { key: "ArrowDown" });

		const active = input.getAttribute("aria-activedescendant");
		expect(active).toBeTruthy();
		expect(document.getElementById(active as string)).toHaveTextContent("김민준");
	});

	it("shows the selected label once the panel is closed", async () => {
		render(
			<Combobox onSearch={vi.fn().mockResolvedValue(OPTIONS)} debounceMs={10} value={OPTIONS[0]} />,
		);

		expect(screen.getByRole("combobox")).toHaveValue("박상민");
	});
});
