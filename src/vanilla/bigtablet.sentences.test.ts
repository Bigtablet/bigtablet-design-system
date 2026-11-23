import { describe, expect, it } from "vitest";
// 소스를 직접 import 한다 - bigtablet.alert.test.ts 상단 주석 참고.
import { Alert, init, Sentences, Toast } from "./bigtablet.js";
import { resetVanillaDom } from "./bigtablet.test-utils";

resetVanillaDom();

const items = (el: Element) =>
	[...el.querySelectorAll(".sentences_item")].map((item) => item.textContent);

// React renderSentences 와 같은 규칙 · 마크업 (#1139)
describe("Sentences", () => {
	it("splits sentences and phrases with the same markup as React", () => {
		const el = document.createElement("p");
		Sentences.set(el, "저장했어요. 이 아래의 컴포넌트에서 보입니다.");
		expect(items(el)).toEqual(["저장했어요.", "이 아래의 컴포넌트에서 보입니다."]);
		expect(el.querySelector(".sentences_phrase")?.textContent).toBe("이 아래의 컴포넌트에서");
		expect(el.textContent).toBe("저장했어요. 이 아래의 컴포넌트에서 보입니다.");
	});

	it("leaves a single sentence as plain text and never parses HTML", () => {
		const el = document.createElement("p");
		Sentences.set(el, "<b>한</b> 문장입니다");
		expect(el.children).toHaveLength(0);
		expect(el.textContent).toBe("<b>한</b> 문장입니다");
	});

	it("splits only text next to inner elements, leaving the element as is", () => {
		document.body.innerHTML =
			"<p data-bt-sentences>설정을 바꿨어요. 이제 <strong>저장</strong> 을 누르세요. 끝입니다.</p>";
		init();
		init();
		const p = document.querySelector("p") as HTMLElement;
		expect(p.querySelector("strong")?.textContent).toBe("저장");
		// 요소 앞 · 뒤로 이어지는 문장은 묶지 않는다 - 요소와 조사가 떨어지지 않게
		expect(items(p)).toEqual(["설정을 바꿨어요.", "끝입니다."]);
		expect(p.textContent).toBe("설정을 바꿨어요. 이제 저장 을 누르세요. 끝입니다.");
	});

	it("applies to Toast and Alert messages", () => {
		Toast("연결하지 못했어요. 다시 시도해 주세요.", "error");
		const toast = document.querySelector(".bt-toast__message") as HTMLElement;
		expect(items(toast)).toEqual(["연결하지 못했어요.", "다시 시도해 주세요."]);

		Alert({ title: "오류", message: "저장하지 못했어요. 다시 시도해 주세요. (오류 코드 E1)" });
		const alert = document.querySelector(".bt-alert__message") as HTMLElement;
		expect(items(alert)).toEqual(["저장하지 못했어요.", "다시 시도해 주세요. (오류 코드 E1)"]);
		expect(alert.querySelector(".sentences_phrase")?.textContent).toBe("(오류 코드 E1)");
	});
});
