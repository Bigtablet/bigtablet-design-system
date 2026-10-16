import { afterEach, describe, expect, it, vi } from "vitest";
import { copyText } from "./use-clipboard";

describe("copyText fallback (Chromium)", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		document.body.innerHTML = "";
	});

	it("restores the user's selection and focus after the execCommand fallback", async () => {
		Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
		const exec = vi.spyOn(document, "execCommand").mockReturnValue(true);
		const p = document.createElement("p");
		p.textContent = "선택해 둔 문장";
		const button = document.createElement("button");
		button.textContent = "복사";
		document.body.append(p, button);
		button.focus();
		const range = document.createRange();
		range.selectNodeContents(p);
		document.getSelection()?.removeAllRanges();
		document.getSelection()?.addRange(range);

		await copyText("복사할 값");

		expect(exec).toHaveBeenCalledWith("copy");
		expect(document.activeElement).toBe(button);
		// textarea.select() 가 문서 선택을 덮어쓴다 - 되돌리지 않으면 사용자가 잡아 둔 선택이 사라진다
		expect(document.getSelection()?.toString()).toBe("선택해 둔 문장");
		expect(document.querySelector("textarea")).toBeNull();
	});
});
