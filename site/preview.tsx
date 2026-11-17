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

new ResizeObserver(() =>
	parent.postMessage({ height: document.documentElement.scrollHeight }, "*"),
).observe(document.body);
