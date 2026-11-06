import { describe, expect, it, vi } from "vitest";
import { DatePicker, DateRangePicker, init } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

describe("DatePicker (달력형, #937)", () => {
	const mount = (attrs = "", inner = "") => {
		const el = document.createElement("div");
		el.innerHTML = `<div class="bt-date-picker" ${attrs}><span class="bt-date-picker__label">시작</span>${inner}</div>`;
		document.body.appendChild(el);
		return el.firstElementChild as HTMLElement;
	};
	const trigger = (root: HTMLElement) =>
		root.querySelector(".bt-date-picker__trigger") as HTMLButtonElement;
	const day = (root: HTMLElement, d: number) =>
		root.querySelector(`button[data-day="${d}"]`) as HTMLButtonElement;
	const hidden = (root: HTMLElement) =>
		root.querySelector('input[type="hidden"]') as HTMLInputElement;

	it("data-* 로 자동 초기화되고 숨은 input 에 값을 싣는다", () => {
		const root = mount(
			'data-bt-date-picker data-name="from" data-value="2026-10-16" data-today="2026-10-01"',
		);
		init();
		expect(hidden(root).name).toBe("from");
		expect(hidden(root).value).toBe("2026-10-16");
		expect(trigger(root).textContent).toContain("2026");
		// 라벨 + 값이 이름이 된다
		expect(trigger(root).getAttribute("aria-labelledby")?.split(" ")).toHaveLength(2);
	});

	it("날짜를 누르면 값이 바뀌고 팝오버가 닫히며 포커스가 칸으로 돌아온다", () => {
		const onValueChange = vi.fn();
		const root = mount();
		DatePicker(root, { name: "d", today: "2026-10-01", onValueChange });
		trigger(root).click();
		expect(trigger(root).getAttribute("aria-expanded")).toBe("true");
		expect(document.activeElement).toBe(day(root, 1)); // 오늘에 앉는다
		day(root, 20).click();
		expect(onValueChange).toHaveBeenCalledWith("2026-10-20");
		expect(hidden(root).value).toBe("2026-10-20");
		expect(trigger(root).getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(trigger(root));
	});

	it("방향키 · PageDown 으로 칸을 옮기고 달을 넘긴다", () => {
		const root = mount();
		DatePicker(root, { today: "2026-10-31" });
		trigger(root).click();
		const key = (k: string) =>
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", { key: k, bubbles: true }),
			);
		key("ArrowRight");
		expect(root.querySelector(".bt-date-picker__title")?.textContent).toContain("11월");
		expect(document.activeElement).toBe(day(root, 1));
		key("PageDown");
		expect(root.querySelector(".bt-date-picker__title")?.textContent).toContain("12월");
		key("Escape");
		expect(trigger(root).getAttribute("aria-expanded")).toBe("false");
	});

	it("min · max 밖의 날은 고를 수 없다", () => {
		const onValueChange = vi.fn();
		const root = mount('data-min="2026-10-10" data-max="2026-10-20"');
		DatePicker(root, { today: "2026-10-15", onValueChange });
		trigger(root).click();
		expect(day(root, 9).getAttribute("aria-disabled")).toBe("true");
		expect(day(root, 21).getAttribute("aria-disabled")).toBe("true");
		day(root, 9).click();
		expect(onValueChange).not.toHaveBeenCalled();
		const [prev, next] = Array.from(
			root.querySelectorAll<HTMLButtonElement>(".bt-date-picker__nav"),
		) as [HTMLButtonElement, HTMLButtonElement];
		expect(prev.disabled && next.disabled).toBe(true);
	});

	it("시각을 켜면 YYYY-MM-DDTHH:mm 로 싣고 minuteStep 을 따른다", () => {
		const root = mount('data-time data-minute-step="15"');
		const api = DatePicker(root, { name: "from", today: "2026-10-01" });
		trigger(root).click();
		day(root, 2).click();
		expect(hidden(root).value).toBe("2026-10-02T00:00");
		const [hour, minute] = Array.from(root.querySelectorAll("select")) as [
			HTMLSelectElement,
			HTMLSelectElement,
		];
		expect(Array.from(minute.options).map((o) => o.value)).toEqual(["0", "15", "30", "45"]);
		hour.value = "14";
		hour.dispatchEvent(new Event("change"));
		minute.value = "30";
		minute.dispatchEvent(new Event("change"));
		expect(api?.getValue()).toBe("2026-10-02T14:30");
		// 시각을 고르는 동안 팝오버는 열려 있다 - 완료로 닫는다
		(root.querySelector(".bt-date-picker__action--primary") as HTMLButtonElement).click();
		expect(trigger(root).getAttribute("aria-expanded")).toBe("false");
	});

	it("minFrom 으로 종료가 시작보다 앞서지 않는다 - 시작을 옮기면 종료가 따라온다", () => {
		const from = mount('id="from" data-time');
		const to = mount('data-time data-min-from="#from"');
		const fromApi = DatePicker(from, { defaultValue: "2026-10-01T09:00" });
		const toApi = DatePicker(to, { defaultValue: "2026-10-02T18:00" });
		trigger(to).click();
		expect(day(to, 1).getAttribute("aria-disabled")).toBeNull();
		expect(day(to, 30)).toBeTruthy();
		toApi?.close();

		fromApi?.setValue("2026-10-05T10:00");
		expect(toApi?.getValue()).toBe("2026-10-05T10:00");

		// 같은 날이면 시작 시각 앞의 시는 막힌다
		trigger(to).click();
		const hour = to.querySelector("select") as HTMLSelectElement;
		expect(hour.options[9]?.disabled).toBe(true);
		expect(hour.options[10]?.disabled).toBe(false);
	});

	it("종료 칸이 먼저 초기화돼도 시작 칸의 처음 값으로 맞춘다", () => {
		const to = mount('data-min-from="#from-first"');
		const toApi = DatePicker(to, { defaultValue: "2026-10-01" });
		const from = mount('id="from-first"');
		DatePicker(from, { defaultValue: "2026-10-05" });
		expect(toApi?.getValue()).toBe("2026-10-05");
	});

	it("시각 모드에서 날짜만 준 max 날에 고른 시각을 지킨다", () => {
		const root = mount('data-time data-max="2026-10-20"');
		const api = DatePicker(root, { defaultValue: "2026-10-20T14:00" });
		expect(api?.getValue()).toBe("2026-10-20T14:00");
		api?.setValue("2026-10-21T09:00");
		expect(api?.getValue()).toBe("2026-10-20T23:55"); // 그날 끝(분 간격 5)으로 맞춘다
	});

	it("셀렉터로 무효한 data-min-from 은 연결하지 않고 init 을 멈추지 않는다", () => {
		const root = mount('data-bt-date-picker data-min-from="#123" data-value="2026-10-01"');
		expect(() => init()).not.toThrow();
		expect(hidden(root)?.value ?? trigger(root).textContent).toContain("2026");
	});

	it("setDisabled 와 destroy 가 칸 · 리스너를 정리한다", () => {
		const root = mount();
		const api = DatePicker(root, { name: "d" });
		api?.setDisabled(true);
		expect(trigger(root).disabled).toBe(true);
		expect(hidden(root).disabled).toBe(true);
		api?.destroy();
		expect(root.querySelector(".bt-date-picker__trigger")).toBeNull();
		expect(hidden(root)).toBeTruthy(); // 폼 값 자리는 남긴다
	});

	it("형식이 틀린 값은 무시한다", () => {
		const root = mount();
		const api = DatePicker(root, { defaultValue: "2026-02-30" });
		expect(api?.getValue()).toBeNull();
		api?.setValue("not-a-date");
		expect(api?.getValue()).toBeNull();
		// 값이 있을 때 잘못된 값을 넣어도 지우지 않는다
		api?.setValue("2026-10-16");
		api?.setValue("2026-02-30");
		expect(api?.getValue()).toBe("2026-10-16");
		api?.setValue(null);
		expect(api?.getValue()).toBeNull();
	});
});

describe("DatePicker 월 · 연 보기 (#953)", () => {
	const mountRoot = () => {
		const root = document.createElement("div");
		document.body.appendChild(root);
		return root;
	};
	const title = (root: HTMLElement) =>
		root.querySelector(".bt-date-picker__title") as HTMLButtonElement;
	const pick = (root: HTMLElement, v: number) =>
		root.querySelector(`button[data-pick="${v}"]`) as HTMLButtonElement;

	it("제목을 누르면 월 → 연 보기로 가고, 고르면 한 단계씩 내려온다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { today: "2026-11-06" });
		api?.open();
		title(root).click();
		expect(title(root).textContent).toContain("2026");
		expect(root.querySelectorAll("button[data-pick]")).toHaveLength(12);
		title(root).click();
		expect(title(root).textContent).toBe("2016 – 2027");
		pick(root, 2019).click();
		expect(title(root).textContent).toContain("2019");
		pick(root, 3).click();
		expect(title(root).textContent).toContain("2019년 3월");
		expect(root.querySelector(".bt-date-picker__grid")?.hasAttribute("hidden")).toBe(false);
		// 같은 날(6일)에 앉는다
		expect(document.activeElement?.getAttribute("data-day")).toBe("6");
	});

	it("월 보기의 방향키 · ‹ › 가 해를 넘긴다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { today: "2026-11-06" });
		api?.open();
		title(root).click();
		const key = (k: string) =>
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", { key: k, bubbles: true }),
			);
		expect(document.activeElement).toBe(pick(root, 11));
		key("ArrowDown"); // 11월 + 3 → 다음 해 2월
		expect(title(root).textContent).toContain("2027");
		expect(document.activeElement).toBe(pick(root, 2));
		(root.querySelector('[data-nav="-1"]') as HTMLButtonElement).click();
		expect(title(root).textContent).toContain("2026");
	});

	it("min · max 밖의 달 · 해는 고를 수 없다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { today: "2026-11-06", min: "2026-03-10", max: "2027-02-01" });
		api?.open();
		title(root).click();
		expect(pick(root, 2).getAttribute("aria-disabled")).toBe("true");
		expect(pick(root, 3).getAttribute("aria-disabled")).toBeNull();
		pick(root, 2).click();
		expect(title(root).textContent).not.toContain("월"); // 월 보기에 그대로
		title(root).click();
		expect(pick(root, 2025).getAttribute("aria-disabled")).toBe("true");
		expect(pick(root, 2027).getAttribute("aria-disabled")).toBeNull();
	});

	it("월 · 연 보기의 방향키는 min · max 밖으로 나가지 않는다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { today: "2026-11-06", max: "2027-02-01", min: "2026-03-10" });
		api?.open();
		title(root).click();
		const key = (k: string) =>
			document.activeElement?.dispatchEvent(
				new KeyboardEvent("keydown", { key: k, bubbles: true }),
			);
		key("PageDown"); // 2027-11 → max 2027-02 로 묶인다
		expect(title(root).textContent).toContain("2027");
		expect(document.activeElement).toBe(pick(root, 2));
		expect(document.activeElement?.getAttribute("aria-disabled")).toBeNull();
		title(root).click();
		key("ArrowRight"); // 2028 → 2027
		expect(document.activeElement).toBe(pick(root, 2027));
		key("PageUp"); // 2015 → 2026
		expect(document.activeElement).toBe(pick(root, 2026));
	});

	it("제목 버튼의 이름은 보이는 연 · 월이고 동작은 설명으로 붙는다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { today: "2026-11-06" });
		api?.open();
		expect(title(root).hasAttribute("aria-label")).toBe(false);
		expect(title(root).textContent).toBe("2026년 11월");
		const hint = document.getElementById(title(root).getAttribute("aria-describedby") ?? "");
		expect(hint?.textContent).toBe("연 · 월 선택");
		expect(title(root).querySelector("[aria-live]")).toBeNull();
	});

	it("오늘 버튼은 어느 보기 · 달에서든 오늘을 고른다", () => {
		const onValueChange = vi.fn();
		const root = mountRoot();
		const api = DatePicker(root, {
			today: "2026-11-06",
			defaultValue: "2019-03-02",
			onValueChange,
		});
		api?.open();
		title(root).click(); // 월 보기
		(root.querySelector(".bt-date-picker__action") as HTMLButtonElement).click();
		expect(api?.getValue()).toBe("2026-11-06");
		expect(onValueChange).toHaveBeenCalledWith("2026-11-06");
		// 날짜만 고르는 칸은 바로 닫힌다
		expect(root.querySelector(".bt-date-picker__trigger")?.getAttribute("aria-expanded")).toBe(
			"false",
		);
	});

	it("오늘이 범위 밖이면 고르지 않고 그 근처로 옮기기만 한다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { today: "2026-11-06", max: "2026-10-31" });
		api?.open();
		(root.querySelector(".bt-date-picker__action") as HTMLButtonElement).click();
		expect(api?.getValue()).toBeNull();
		expect(title(root).textContent).toContain("10월");
	});

	it("마우스로 날짜를 고르면 시 칸으로 포커스를 옮기지 않는다", () => {
		const root = mountRoot();
		const api = DatePicker(root, { time: true, today: "2026-11-06" });
		api?.open();
		const day = root.querySelector('button[data-day="10"]') as HTMLButtonElement;
		day.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
		expect(document.activeElement?.getAttribute("data-day")).toBe("10");
		// 키보드(detail 0)면 시 칸으로
		(root.querySelector('button[data-day="11"]') as HTMLButtonElement).click();
		expect(document.activeElement?.tagName).toBe("SELECT");
	});
});

describe("DateRangePicker 범위형 (#951)", () => {
	const mountRoot = (attrs = "") => {
		const wrap = document.createElement("div");
		wrap.innerHTML = `<div class="bt-date-picker" ${attrs}></div>`;
		document.body.appendChild(wrap);
		return wrap.firstElementChild as HTMLElement;
	};
	const day = (root: HTMLElement, d: number) =>
		root.querySelector(`button[data-day="${d}"]`) as HTMLButtonElement;
	const hiddenNamed = (root: HTMLElement, name: string) =>
		root.querySelector(`input[name="${name}"]`) as HTMLInputElement;

	it("첫 클릭은 시작, 두 번째는 종료이고 사이를 띠로 칠한다", () => {
		const onValueChange = vi.fn();
		const root = mountRoot();
		const api = DateRangePicker(root, {
			startName: "from",
			endName: "to",
			today: "2026-11-06",
			onValueChange,
		});
		api?.open();
		day(root, 3).click();
		expect(api?.getValue()).toEqual({ start: "2026-11-03", end: null });
		expect(root.querySelector(".bt-date-picker__trigger")?.getAttribute("aria-expanded")).toBe(
			"true",
		);
		day(root, 7).click();
		expect(api?.getValue()).toEqual({ start: "2026-11-03", end: "2026-11-07" });
		expect(onValueChange).toHaveBeenLastCalledWith({ start: "2026-11-03", end: "2026-11-07" });
		expect(hiddenNamed(root, "from").value).toBe("2026-11-03");
		expect(hiddenNamed(root, "to").value).toBe("2026-11-07");
		// 날짜만 고르면 종료를 고르는 순간 닫힌다
		expect(root.querySelector(".bt-date-picker__trigger")?.getAttribute("aria-expanded")).toBe(
			"false",
		);
		api?.open();
		const cell = (d: number) => day(root, d).parentElement as HTMLElement;
		expect(cell(5).classList.contains("bt-date-picker__cell--in-range")).toBe(true);
		expect(cell(5).getAttribute("aria-selected")).toBe("true");
		expect(cell(3).classList.contains("bt-date-picker__cell--range-start")).toBe(true);
		expect(cell(7).classList.contains("bt-date-picker__cell--range-end")).toBe(true);
		expect(cell(8).classList.contains("bt-date-picker__cell--in-range")).toBe(false);
	});

	it("시작보다 앞을 누르거나 종료가 있으면 새 시작이 된다", () => {
		const root = mountRoot();
		const api = DateRangePicker(root, { today: "2026-11-06" });
		api?.open();
		day(root, 10).click();
		day(root, 4).click(); // 시작보다 앞 → 새 시작
		expect(api?.getValue()).toEqual({ start: "2026-11-04", end: null });
		day(root, 9).click();
		api?.open();
		day(root, 20).click(); // 종료가 있으면 새 시작
		expect(api?.getValue()).toEqual({ start: "2026-11-20", end: null });
	});

	it("시작을 종료 뒤로 옮기면 종료를 비운다 (React DateRangePicker 와 같음)", () => {
		const root = mountRoot(
			'data-start="2026-11-01" data-end="2026-11-05" data-range data-bt-date-picker',
		);
		init();
		const api = (root as HTMLElement & { _btDatePicker?: ReturnType<typeof DatePicker> })
			._btDatePicker;
		expect(api?.getValue()).toEqual({ start: "2026-11-01", end: "2026-11-05" });
		api?.setValue({ start: "2026-11-09", end: "2026-11-05" });
		expect(api?.getValue()).toEqual({ start: "2026-11-09", end: null });
	});

	it("시작 없는 종료는 받지 않는다", () => {
		const root = mountRoot();
		const api = DateRangePicker(root, { endName: "to" });
		api?.setValue({ start: null, end: "2026-11-05" });
		expect(api?.getValue()).toEqual({ start: null, end: null });
		expect(hiddenNamed(root, "to").value).toBe("");
	});

	it("시작만 고른 동안의 미리보기 띠는 달력을 벗어나면 지운다", () => {
		const root = mountRoot();
		const api = DateRangePicker(root, { today: "2026-11-06" });
		api?.open();
		day(root, 3).click();
		day(root, 8).dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
		const cell = (d: number) => day(root, d).parentElement as HTMLElement;
		expect(cell(5).classList.contains("bt-date-picker__cell--in-range")).toBe(true);
		root.querySelector("tbody")?.dispatchEvent(new MouseEvent("mouseleave"));
		expect(cell(5).classList.contains("bt-date-picker__cell--in-range")).toBe(false);
	});

	it("키보드로 종료를 고르면 종료 시각 줄로 간다", () => {
		const root = mountRoot();
		const api = DateRangePicker(root, { time: true, today: "2026-11-06" });
		api?.open();
		day(root, 3).click();
		day(root, 7).click(); // detail 0 - 키보드
		expect(document.activeElement).toBe(root.querySelectorAll("select")[2]);
	});

	it("시각을 켜면 시작 · 종료 시각 줄이 생기고 같은 날 종료는 시작 시각 앞을 막는다", () => {
		const root = mountRoot();
		const api = DateRangePicker(root, { time: true, minuteStep: 30, today: "2026-11-06" });
		api?.open();
		day(root, 6).click();
		day(root, 6).click();
		expect(api?.getValue()).toEqual({ start: "2026-11-06T00:00", end: "2026-11-06T23:30" });
		const selects = root.querySelectorAll("select");
		const startHour = selects[0] as HTMLSelectElement;
		const endHour = selects[2] as HTMLSelectElement;
		startHour.value = "14";
		startHour.dispatchEvent(new Event("change"));
		expect(endHour.options[13]?.disabled).toBe(true);
		expect(endHour.options[14]?.disabled).toBe(false);
		expect(root.querySelectorAll(".bt-date-picker__time-label")).toHaveLength(2);
	});
});
