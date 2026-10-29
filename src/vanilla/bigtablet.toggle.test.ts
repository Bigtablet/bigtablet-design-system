import { describe, expect, it, vi } from "vitest";
// Vanilla 번들은 UMD 다. 소비자는 `<script>` 로 읽어 전역 `Bigtablet` 을 쓰지만, 여기서는
// Vite 가 노출하는 named export 로 같은 팩토리를 직접 부른다 - 부착 경로만 다르고 검사 대상
// 로직은 동일하다. 빌드 산출물이 아니라 소스를 import 해서, 소스 변경이 곧 테스트에 걸린다.
import { Toggle } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

describe("Toggle", () => {
	const toggleMarkup = () => {
		const el = document.createElement("button");
		el.className = "bt-toggle";
		el.innerHTML = '<span class="bt-toggle__thumb"></span>';
		document.body.appendChild(el);
		return el;
	};

	it("클릭하면 onCheckedChange 를 부른다", () => {
		const onCheckedChange = vi.fn();
		const el = toggleMarkup();
		Toggle(el, { onCheckedChange });

		el.click();

		expect(onCheckedChange).toHaveBeenCalledWith(true);
		expect(el.getAttribute("aria-checked")).toBe("true");
	});

	it("native disabled 면 토글되지 않는다", () => {
		const onCheckedChange = vi.fn();
		const el = toggleMarkup();
		el.disabled = true;
		Toggle(el, { onCheckedChange });

		el.click();

		expect(onCheckedChange).not.toHaveBeenCalled();
	});

	it("config.disabled 를 native disabled 로 통일한다", () => {
		const el = toggleMarkup();
		Toggle(el, { disabled: true });

		expect(el.disabled).toBe(true);
	});
});

describe("Toggle - 초기화 · API", () => {
	const mount = (html = '<button class="bt-toggle"></button>') => {
		document.body.innerHTML = `<form>${html}</form>`;
		return document.querySelector(".bt-toggle") as HTMLButtonElement;
	};

	it("adds switch semantics and type=button without overriding consumer values", () => {
		const el = mount();
		Toggle(el);
		expect(el.getAttribute("role")).toBe("switch");
		expect(el.getAttribute("type")).toBe("button");
		expect(el.getAttribute("aria-checked")).toBe("false");
		expect(el.classList.contains("bt-toggle--on")).toBe(false);

		const custom = mount('<button class="bt-toggle" role="checkbox" type="submit"></button>');
		Toggle(custom);
		expect(custom.getAttribute("role")).toBe("checkbox");
		expect(custom.getAttribute("type")).toBe("submit");
	});

	it("starts on from defaultChecked or the on class", () => {
		const a = mount();
		expect(Toggle(a, { defaultChecked: true })?.isChecked()).toBe(true);
		expect(a.classList.contains("bt-toggle--on")).toBe(true);
		expect(a.getAttribute("aria-checked")).toBe("true");

		const b = mount('<button class="bt-toggle bt-toggle--on"></button>');
		expect(Toggle(b)?.isChecked()).toBe(true);
	});

	it("creates a sibling hidden input for a named button and keeps it in sync", () => {
		const el = mount();
		const api = Toggle(el, { name: "agree" });
		const input = el.nextElementSibling as HTMLInputElement;
		expect(input.tagName).toBe("INPUT");
		expect(input.type).toBe("hidden");
		expect(input.name).toBe("agree");
		expect(input.value).toBe("false");
		expect(el.querySelector("input")).toBeNull();
		api?.setChecked(true);
		expect(input.value).toBe("true");
		expect(el.getAttribute("aria-checked")).toBe("true");
	});

	it("appends the hidden input inside a non-button toggle and reads data-name", () => {
		const el = mount('<div class="bt-toggle" data-name="dark"></div>');
		Toggle(el);
		expect(el.querySelector<HTMLInputElement>('input[type="hidden"]')?.name).toBe("dark");
	});

	it("reuses a server-rendered sibling input and reads lenient on values", () => {
		for (const raw of ["true", "1", "on", "y", "YES "]) {
			const el = mount(
				`<button class="bt-toggle" data-name="n"></button><input type="hidden" name="other" value="true"><input type="hidden" name="n" value="${raw}">`,
			);
			expect(Toggle(el)?.isChecked()).toBe(true);
			expect(document.querySelectorAll('input[name="n"]')).toHaveLength(1);
			expect(document.querySelector<HTMLInputElement>('input[name="n"]')?.value).toBe("true");
			expect(document.querySelector<HTMLInputElement>('input[name="other"]')?.value).toBe("true");
		}
		const off = mount(
			'<button class="bt-toggle" data-name="n"></button><input type="hidden" name="n" value="no">',
		);
		expect(Toggle(off)?.isChecked()).toBe(false);
	});

	it("toggles, disables and unbinds through the API", () => {
		const onCheckedChange = vi.fn();
		const el = mount();
		const api = Toggle(el, { onCheckedChange });
		api?.toggle();
		expect(api?.isChecked()).toBe(true);
		api?.setDisabled(true);
		expect(el.disabled).toBe(true);
		api?.toggle();
		expect(api?.isChecked()).toBe(true);
		api?.setDisabled(false);
		api?.destroy();
		el.click();
		expect(api?.isChecked()).toBe(true);
		expect(onCheckedChange).toHaveBeenCalledTimes(1);
		expect(Toggle("#missing")).toBeNull();
	});
});

describe("Toggle - 점검 회귀 (#898)", () => {
	it("문서의 서버 렌더 초기값 마크업(data-name + 형제 hidden input)이 동작한다", () => {
		document.body.innerHTML =
			'<form><button class="bt-toggle" data-name="notifications" aria-label="알림"></button><input type="hidden" name="notifications" value="true"></form>';
		const el = document.querySelector(".bt-toggle") as HTMLButtonElement;
		const t = Toggle(el);
		expect(t?.isChecked()).toBe(true);
		el.click();
		expect([...new FormData(document.querySelector("form") as HTMLFormElement)]).toEqual([
			["notifications", "false"],
		]);
	});

	it("같은 요소에 두 번 만들면 교체되어 한 번 누를 때 한 번만 뒤집힌다", () => {
		document.body.innerHTML = '<button class="bt-toggle" aria-label="알림"></button>';
		const el = document.querySelector(".bt-toggle") as HTMLButtonElement;
		Toggle(el);
		const onCheckedChange = vi.fn();
		const t = Toggle(el, { onCheckedChange });
		el.click();
		expect(t?.isChecked()).toBe(true);
		expect(el.getAttribute("aria-checked")).toBe("true");
		expect(onCheckedChange).toHaveBeenCalledTimes(1);
	});

	it("name 이 없으면 옆의 무관한 hidden input 을 건드리지 않는다", () => {
		document.body.innerHTML =
			'<button class="bt-toggle" aria-label="알림"></button><input type="hidden" name="_csrf" value="token">';
		Toggle(document.querySelector(".bt-toggle") as HTMLButtonElement);
		expect((document.querySelector('[name="_csrf"]') as HTMLInputElement).value).toBe("token");
	});
});
