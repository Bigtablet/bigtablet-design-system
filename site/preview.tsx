import { createRoot } from "react-dom/client";
import { exampleOf, stayOnPage } from "./docs";
import "./site.scss";

// 좁은 폭 미리보기 - 예제 하나만 렌더하고 높이를 부모에 알린다
const q = new URLSearchParams(location.search);
const theme = q.get("theme");
if (theme && theme !== "system") document.documentElement.setAttribute("data-theme", theme);
document.documentElement.classList.add(q.has("bare") ? "preview_bare" : "preview");

const Comp = exampleOf(q.get("ex") ?? "");
document.addEventListener("click", stayOnPage, true);
createRoot(document.getElementById("root")!).render(Comp ? <Comp /> : <p>예제가 없습니다</p>);

// 오버레이 예제(`open`) - 첫 버튼을 눌러 열린 모습을 보인다. iframe 안이라 스크롤 잠금이 문서 페이지에
// 닿지 않는다 (#1060). 다만 모달이 여는 순간 첫 칸으로 옮기는 포커스는 iframe 째로 문서 포커스를 가져가
// 페이지를 막 연 키보드 사용자가 iframe 안 포커스 가두기에 갇힌다 - 사람이 iframe 을 누르거나 키를 치기
// 전까지는 focus() 를 막는다
if (q.has("open")) {
	const realFocus = HTMLElement.prototype.focus;
	HTMLElement.prototype.focus = () => {};
	const release = () => {
		HTMLElement.prototype.focus = realFocus;
		removeEventListener("pointerdown", release, true);
		removeEventListener("keydown", release, true);
	};
	addEventListener("pointerdown", release, true);
	addEventListener("keydown", release, true);

	// createRoot 렌더는 비동기라 버튼이 생길 때까지 기다린다 - 화면 밖 iframe 은 rAF 가 멈출 수 있어 타이머로
	const press = (tries = 0) => {
		const trigger = document.querySelector<HTMLElement>("#root button");
		if (!trigger) {
			if (tries < 50) setTimeout(() => press(tries + 1), 20);
			return;
		}
		// 툴팁은 포커스로 뜬다 - 실제 포커스는 옮기지 않고 focusin 만 보낸다
		trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
		trigger.click();
	};
	press();
}

new ResizeObserver(() =>
	parent.postMessage({ height: document.documentElement.scrollHeight }, "*"),
).observe(document.body);
