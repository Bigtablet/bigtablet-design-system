import { afterEach, describe, expect, it } from "vitest";
import { catalogs } from "../ui/system/locale-provider/messages";
import { DatePicker, Pagination, setLocale, setMessages } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";
import { vanillaCatalogs } from "./js/locale.js";

resetVanillaDom();

describe("Vanilla locale (#949)", () => {
	afterEach(() => {
		setLocale(null);
		setMessages(null);
		document.documentElement.lang = "";
	});

	// Vanilla 카탈로그는 React messages.ts 의 일부만 담는다 - 같은 키는 같은 문구여야 두 번들이 갈라지지 않는다
	it.each(["ko", "en"] as const)("matches the React %s catalog for every shared key", (locale) => {
		const react = catalogs[locale] as unknown as Record<string, string>;
		const vanilla = vanillaCatalogs[locale] as Record<string, string>;
		for (const [key, text] of Object.entries(vanilla)) {
			if (key.startsWith("vanilla.")) continue;
			expect(react[key], key).toBe(text);
		}
		expect(Object.keys(vanillaCatalogs.en).sort()).toEqual(Object.keys(vanillaCatalogs.ko).sort());
	});

	const mountPagination = () => {
		const el = document.createElement("nav");
		document.body.appendChild(el);
		Pagination(el, { page: 2, totalPages: 5 });
		return el;
	};

	it("follows <html lang> and setLocale", () => {
		expect(
			mountPagination().querySelector('[data-action="prev"]')?.getAttribute("aria-label"),
		).toBe("이전 페이지");
		document.documentElement.lang = "en-US";
		expect(
			mountPagination().querySelector('[data-action="prev"]')?.getAttribute("aria-label"),
		).toBe("Previous page");
		setLocale("ko");
		expect(mountPagination().getAttribute("aria-label")).toBe("페이지 이동");
	});

	it("lets setMessages override one string and options still win", () => {
		setMessages({ "pagination.prev": "앞으로" });
		expect(
			mountPagination().querySelector('[data-action="prev"]')?.getAttribute("aria-label"),
		).toBe("앞으로");
		const el = document.createElement("nav");
		document.body.appendChild(el);
		Pagination(el, { page: 2, totalPages: 5, prevLabel: "직접" });
		expect(el.querySelector('[data-action="prev"]')?.getAttribute("aria-label")).toBe("직접");
	});

	it("ignores unknown or prototype locale names", () => {
		setLocale("constructor");
		expect(mountPagination().getAttribute("aria-label")).toBe("페이지 이동");
	});

	it("formats DatePicker text in English", () => {
		setLocale("en");
		const root = document.createElement("div");
		document.body.appendChild(root);
		DatePicker(root, { defaultValue: "2026-10-16", today: "2026-10-16" });
		expect(root.querySelector(".bt-date-picker__trigger")?.textContent).toBe("Fri, Oct 16, 2026");
		(root.querySelector(".bt-date-picker__trigger") as HTMLButtonElement).click();
		expect(root.querySelector(".bt-date-picker__title")?.textContent).toBe("October 2026");
		expect(root.querySelector('[data-nav="-1"]')?.getAttribute("aria-label")).toBe(
			"Previous month",
		);
	});
});
