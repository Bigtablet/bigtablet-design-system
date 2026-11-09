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

	it("크기는 기본 md 이고 size 옵션 · data-size 로 바꾼다 (#960)", () => {
		const def = mount();
		DatePicker(def);
		expect(def.classList.contains("bt-date-picker--md")).toBe(true);
		const byAttr = mount('data-size="lg"');
		DatePicker(byAttr);
		expect(byAttr.classList.contains("bt-date-picker--lg")).toBe(true);
		const byOption = mount('data-size="lg"');
		DatePicker(byOption, { size: "sm" });
		expect(byOption.classList.contains("bt-date-picker--sm")).toBe(true);
		// 모르는 값은 기본 md, 직접 쓴 클래스는 그대로 둔다
		const unknown = mount('data-size="xl"');
		DatePicker(unknown);
		expect(unknown.className).not.toContain("--xl");
		expect(unknown.classList.contains("bt-date-picker--md")).toBe(true);
		const byClass = mount();
		byClass.classList.add("bt-date-picker--lg");
		DatePicker(byClass);
		expect(byClass.classList.contains("bt-date-picker--md")).toBe(false);
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

// 날짜보다 시각을 먼저 고른다 - 예전에는 날짜가 없으면 시 · 분 칸이 막혀 있었고, 막힌 칸을 누르면
// 팝오버가 닫혔다 (#964)
describe("DatePicker 시각 먼저 고르기 (#964)", () => {
	const mountRoot = (attrs = "") => {
		const wrap = document.createElement("div");
		wrap.innerHTML = `<div class="bt-date-picker" ${attrs}></div>`;
		document.body.appendChild(wrap);
		return wrap.firstElementChild as HTMLElement;
	};
	const day = (root: HTMLElement, d: number) =>
		root.querySelector(`button[data-day="${d}"]`) as HTMLButtonElement;
	const setTime = (select: HTMLSelectElement, value: string) => {
		select.value = value;
		select.dispatchEvent(new Event("change"));
	};
	const selects = (root: HTMLElement) =>
		Array.from(root.querySelectorAll<HTMLSelectElement>(".bt-date-picker__time select"));

	it("날짜 없이 고른 시각을 들고 있다가 날짜를 고르면 합친다", () => {
		const root = mountRoot("data-time");
		const api = DatePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		const [hour, minute] = selects(root) as [HTMLSelectElement, HTMLSelectElement];
		expect(hour.disabled || minute.disabled).toBe(false);
		setTime(hour, "9");
		setTime(minute, "30");
		expect(api?.getValue()).toBeNull();
		expect(hour.value).toBe("9"); // 다시 그려도 고른 시각이 남는다
		day(root, 12).click();
		expect(api?.getValue()).toBe("2026-11-12T09:30");
	});

	it("setValue 로 값을 정하면 먼저 골라 둔 시각을 버린다", () => {
		const root = mountRoot("data-time");
		const api = DatePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		setTime(selects(root)[0] as HTMLSelectElement, "9");
		api?.setValue(null);
		day(root, 12).click();
		expect(api?.getValue()).toBe("2026-11-12T00:00");
	});

	it("오늘 버튼도 먼저 고른 시각을 쓴다", () => {
		const root = mountRoot("data-time");
		const api = DatePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		setTime(selects(root)[0] as HTMLSelectElement, "18");
		(root.querySelector(".bt-date-picker__action") as HTMLButtonElement).click();
		expect(api?.getValue()).toBe("2026-11-09T18:00");
	});

	it("범위형은 시작 · 종료 시각을 각각 먼저 고를 수 있다", () => {
		const root = mountRoot("data-time");
		const api = DateRangePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		const [startHour, , endHour] = selects(root) as HTMLSelectElement[];
		setTime(startHour as HTMLSelectElement, "9");
		setTime(endHour as HTMLSelectElement, "17");
		day(root, 3).click();
		day(root, 5).click();
		expect(api?.getValue()).toEqual({ start: "2026-11-03T09:00", end: "2026-11-05T17:00" });
	});

	// 날짜 없이 시각만 고르고 완료를 누르면 오늘로 채운다 - 닫기만 하면 고른 시각이 사라졌다 (#971)
	const done = (root: HTMLElement) =>
		(root.querySelector(".bt-date-picker__action--primary") as HTMLButtonElement).click();

	it("완료를 누르면 먼저 고른 시각을 오늘에 붙인다", () => {
		const root = mountRoot("data-time");
		const onValueChange = vi.fn();
		const api = DatePicker(root, { today: "2026-11-09", minuteStep: 1, onValueChange });
		api?.open();
		setTime(selects(root)[0] as HTMLSelectElement, "9");
		done(root);
		expect(api?.getValue()).toBe("2026-11-09T09:00");
		expect(onValueChange).toHaveBeenCalledWith("2026-11-09T09:00");
		expect(root.querySelector(".bt-date-picker__panel")?.hasAttribute("hidden")).toBe(true);
	});

	it("범위형은 완료를 누르면 시작 · 종료 둘 다 오늘", () => {
		const root = mountRoot("data-time");
		const api = DateRangePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		const [startHour, , endHour] = selects(root) as HTMLSelectElement[];
		setTime(startHour as HTMLSelectElement, "9");
		setTime(endHour as HTMLSelectElement, "17");
		done(root);
		expect(api?.getValue()).toEqual({ start: "2026-11-09T09:00", end: "2026-11-09T17:00" });
	});

	it("범위형에서 시작 시각만 골랐으면 종료는 오늘 끝", () => {
		const root = mountRoot("data-time");
		const api = DateRangePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		setTime(selects(root)[0] as HTMLSelectElement, "9");
		done(root);
		expect(api?.getValue()).toEqual({ start: "2026-11-09T09:00", end: "2026-11-09T23:59" });
	});

	it("범위형에서 종료 시각만 골랐으면 시작은 오늘 처음", () => {
		const root = mountRoot("data-time");
		const api = DateRangePicker(root, { today: "2026-11-09", minuteStep: 1 });
		api?.open();
		setTime(selects(root)[2] as HTMLSelectElement, "17");
		done(root);
		expect(api?.getValue()).toEqual({ start: "2026-11-09T00:00", end: "2026-11-09T17:00" });
	});

	it("오늘이 범위 밖이면 채우지 않는다", () => {
		const root = mountRoot("data-time");
		const api = DatePicker(root, { today: "2026-11-09", min: "2026-12-01", minuteStep: 1 });
		api?.open();
		setTime(selects(root)[0] as HTMLSelectElement, "9");
		done(root);
		expect(api?.getValue()).toBeNull();
	});

	it("시각을 고르지 않고 완료를 누르면 값을 만들지 않는다", () => {
		const root = mountRoot("data-time");
		const api = DatePicker(root, { today: "2026-11-09" });
		api?.open();
		done(root);
		expect(api?.getValue()).toBeNull();
	});

	it("팝오버 영역 안을 누르면 target 이 바깥이어도 닫지 않는다", () => {
		const root = mountRoot("data-time");
		const api = DatePicker(root, { today: "2026-11-09" });
		api?.open();
		const panel = root.querySelector(".bt-date-picker__panel") as HTMLElement;
		panel.getBoundingClientRect = () => ({ left: 0, top: 50, right: 300, bottom: 400 }) as DOMRect;
		const press = (x: number, y: number) =>
			document.body.dispatchEvent(
				new MouseEvent("pointerdown", { bubbles: true, clientX: x, clientY: y }),
			);
		const expanded = () =>
			root.querySelector(".bt-date-picker__trigger")?.getAttribute("aria-expanded");
		press(100, 380); // 막힌 컨트롤을 눌러 target 이 body 가 된 경우
		expect(expanded()).toBe("true");
		press(500, 500);
		expect(expanded()).toBe("false");
	});
});

// 고른 날짜를 지운다 - 조회 조건처럼 "값 없음 = 조건 없음" 인 칸 (#965)
describe("DatePicker clearable (#965)", () => {
	const mountRoot = (attrs = "") => {
		const wrap = document.createElement("div");
		wrap.innerHTML = `<div class="bt-date-picker" ${attrs}></div>`;
		document.body.appendChild(wrap);
		return wrap.firstElementChild as HTMLElement;
	};
	const clearBtn = (root: HTMLElement) =>
		root.querySelector(".bt-date-picker__clear") as HTMLButtonElement | null;
	const triggerOf = (root: HTMLElement) =>
		root.querySelector(".bt-date-picker__trigger") as HTMLButtonElement;

	it("값이 있을 때만 지우기 버튼을 보이고, 누르면 비우고 placeholder 로 돌아간다", () => {
		const onValueChange = vi.fn();
		const root = mountRoot('data-clearable data-name="from" data-value="2026-11-09"');
		DatePicker(root, { onValueChange });
		const btn = clearBtn(root) as HTMLButtonElement;
		expect(btn.hidden).toBe(false);
		expect(btn.getAttribute("aria-label")).toBe("날짜 지우기");
		btn.click();
		expect(onValueChange).toHaveBeenCalledWith(null);
		expect((root.querySelector('input[name="from"]') as HTMLInputElement).value).toBe("");
		expect(triggerOf(root).textContent).toContain("날짜 선택");
		expect(btn.hidden).toBe(true);
		expect(triggerOf(root).getAttribute("aria-expanded")).toBe("false");
		expect(document.activeElement).toBe(triggerOf(root));
	});

	it("끄면 버튼이 없고 Delete 도 지우지 않는다", () => {
		const root = mountRoot('data-value="2026-11-09"');
		const api = DatePicker(root);
		expect(clearBtn(root)).toBeNull();
		triggerOf(root).dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));
		expect(api?.getValue()).toBe("2026-11-09");
	});

	it("수정 키와 함께 누른 Backspace 는 지우지 않는다", () => {
		const root = mountRoot('data-clearable data-value="2026-11-09"');
		const api = DatePicker(root);
		triggerOf(root).dispatchEvent(
			new KeyboardEvent("keydown", { key: "Backspace", metaKey: true, bubbles: true }),
		);
		expect(api?.getValue()).toBe("2026-11-09");
	});

	it("칸에서 Delete · Backspace 로 지운다", () => {
		for (const key of ["Delete", "Backspace"]) {
			const root = mountRoot('data-clearable data-value="2026-11-09"');
			const api = DatePicker(root);
			triggerOf(root).dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
			expect(api?.getValue()).toBeNull();
		}
	});

	it("범위형은 시작 · 종료를 함께 비운다", () => {
		const onValueChange = vi.fn();
		const root = mountRoot('data-clearable data-start="2026-11-03" data-end="2026-11-05"');
		DateRangePicker(root, { onValueChange });
		(clearBtn(root) as HTMLButtonElement).click();
		expect(onValueChange).toHaveBeenCalledWith({ start: null, end: null });
	});

	it("minFrom 으로 이어진 칸은 기준 칸이 비면 제한이 풀린다", () => {
		const from = mountRoot('id="from-clear" data-clearable data-value="2026-11-10"');
		const to = mountRoot('data-min-from="#from-clear"');
		DatePicker(from);
		const toApi = DatePicker(to, { today: "2026-11-01" });
		toApi?.open();
		expect(to.querySelector('button[data-day="5"]')?.getAttribute("aria-disabled")).toBe("true");
		toApi?.close();
		(clearBtn(from) as HTMLButtonElement).click();
		toApi?.open();
		expect(to.querySelector('button[data-day="5"]')?.getAttribute("aria-disabled")).not.toBe(
			"true",
		);
	});
});

// 감사에서 나온 결함 (#974)
describe("DatePicker 폼 · 포커스 (#974)", () => {
	const mountRoot = (html: string) => {
		document.body.innerHTML = html;
		return document.querySelector(".bt-date-picker") as HTMLElement;
	};

	it("범위형 destroy · 재초기화가 종료 값을 폼에서 빼지 않는다", () => {
		const root = mountRoot(
			'<form><div class="bt-date-picker" data-start-name="from" data-end-name="to"></div></form>',
		);
		const api = DateRangePicker(root, {
			startName: "from",
			endName: "to",
			defaultValue: { start: "2026-10-01", end: "2026-10-05" },
		});
		api?.destroy();
		const form = document.querySelector("form") as HTMLFormElement;
		expect([...new FormData(form)]).toEqual([
			["from", "2026-10-01"],
			["to", "2026-10-05"],
		]);
		const again = DateRangePicker(root, { startName: "from", endName: "to" });
		expect(again?.getValue()).toEqual({ start: "2026-10-01", end: "2026-10-05" });
	});

	it("범위형에서 시작을 다시 고르면 시작 시각을 지킨다", () => {
		const root = mountRoot('<div class="bt-date-picker"></div>');
		const api = DateRangePicker(root, { time: true, today: "2026-10-16", minuteStep: 1 });
		api?.setValue({ start: "2026-10-10T09:00", end: "2026-10-12T18:00" });
		api?.open();
		(root.querySelector('button[data-day="14"]') as HTMLElement).click();
		expect(api?.getValue()).toEqual({ start: "2026-10-14T09:00", end: null });
	});

	it("form.reset() 이 처음 값으로 되돌린다", async () => {
		const root = mountRoot('<form><div class="bt-date-picker" data-name="d"></div></form>');
		const api = DatePicker(root, { name: "d", defaultValue: "2026-10-01" });
		api?.setValue("2026-10-10");
		(document.querySelector("form") as HTMLFormElement).reset();
		await Promise.resolve();
		expect(api?.getValue()).toBe("2026-10-01");
		expect((root.querySelector('input[name="d"]') as HTMLInputElement).value).toBe("2026-10-01");
	});

	it("값이 바뀌면 숨은 input 이 change 를 낸다", () => {
		const root = mountRoot('<form><div class="bt-date-picker" data-name="d"></div></form>');
		const onChange = vi.fn();
		document.querySelector("form")?.addEventListener("change", onChange);
		const api = DatePicker(root, { name: "d", today: "2026-10-16" });
		api?.open();
		(root.querySelector('button[data-day="20"]') as HTMLElement).click();
		expect(onChange).toHaveBeenCalledTimes(1);
		expect((onChange.mock.calls[0] as [Event])[0].target).toBe(
			root.querySelector('input[name="d"]'),
		);
	});

	it("범위형은 바뀐 input 에서만 change 를 낸다", () => {
		const root = mountRoot(
			'<form><div class="bt-date-picker" data-start-name="from" data-end-name="to"></div></form>',
		);
		const targets: string[] = [];
		document.querySelector("form")?.addEventListener("change", (e) => {
			targets.push((e.target as HTMLInputElement).name);
		});
		const api = DateRangePicker(root, { startName: "from", endName: "to", today: "2026-10-16" });
		api?.open();
		(root.querySelector('button[data-day="3"]') as HTMLElement).click();
		expect(targets).toEqual(["from"]);
		(root.querySelector('button[data-day="5"]') as HTMLElement).click();
		expect(targets).toEqual(["from", "to"]);
	});

	it("min 달에 닿아 ‹ 가 막히면 포커스를 날짜 칸으로 옮긴다", () => {
		const root = mountRoot('<div class="bt-date-picker"></div>');
		const api = DatePicker(root, { today: "2026-10-16", min: "2026-09-01" });
		api?.open();
		const prev = root.querySelector('.bt-date-picker__nav[data-nav="-1"]') as HTMLButtonElement;
		prev.focus();
		prev.click();
		expect(prev.disabled).toBe(true);
		expect(document.activeElement?.closest("tbody")).not.toBeNull();
	});
});
