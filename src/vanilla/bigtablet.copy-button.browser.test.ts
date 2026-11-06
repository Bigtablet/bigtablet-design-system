import { afterEach, describe, expect, it, vi } from "vitest";
// 소스 진입점 - 소스는 ES 모듈이라 named import 로 받는다 (bigtablet.modal.browser.test.ts 참고).
import "./bigtablet.scss";
import { CopyButton, setLocale } from "./bigtablet.js";

// 브라우저 테스트 페이지는 <html lang="en"> 이다 - 기본 문구를 한국어로 고정해 본다 (#949)
setLocale("ko");

describe("Vanilla CopyButton execCommand fallback (Chromium, #918)", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.innerHTML = "";
	});

	it("restores the user's selection and focus after copying", async () => {
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
		const exec = vi.spyOn(document, "execCommand").mockReturnValue(true);
		const p = document.createElement("p");
		p.textContent = "선택해 둔 문장";
		const button = document.createElement("button");
		button.className = "bt-button bt-button--sm bt-button--outline";
		button.dataset.btCopy = "10.8.0.2/32";
		button.textContent = "복사";
		document.body.append(p, button);
		CopyButton(button);
		button.focus();
		const range = document.createRange();
		range.selectNodeContents(p);
		document.getSelection()?.removeAllRanges();
		document.getSelection()?.addRange(range);

		button.click();
		await expect.poll(() => button.textContent).toBe("복사됨");

		expect(exec).toHaveBeenCalledWith("copy");
		expect(document.activeElement).toBe(button);
		expect(document.getSelection()?.toString()).toBe("선택해 둔 문장");
		expect(document.querySelector("textarea")).toBeNull();
		// 결과 안내는 화면에 보이지 않는 status
		const status = button.nextElementSibling as HTMLElement;
		expect(status.getAttribute("role")).toBe("status");
		expect(status.getBoundingClientRect().width).toBeLessThanOrEqual(1);
	});
});
