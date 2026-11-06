import { describe, expect, it, vi } from "vitest";
import { DatePicker, init } from "./bigtablet.js";
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
		(root.querySelector(".bt-date-picker__done") as HTMLButtonElement).click();
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
