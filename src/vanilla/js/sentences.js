import { phraseRanges, splitSentences } from "../../text/core.ts";

/* ========================================
     Sentences - 문장 단위 줄바꿈 (#1139)
     ======================================== */

// 규칙은 React 와 같은 src/text/core.ts 를 번들에 그대로 싣는다 - 앱이 따로 옮겨 두면 한쪽만 고쳐 화면마다 갈린다.
// 마크업도 React `renderSentences` 와 같다 (.sentences_item · .sentences_phrase)

/** 어절 묶음 - React `renderPhrases` 와 같다. 묶이지 않는 글자 · 공백은 원문 그대로 */
function phrases(text) {
	const frag = document.createDocumentFragment();
	let cursor = 0;
	for (const { start, end } of phraseRanges(text)) {
		frag.append(text.slice(cursor, start));
		const span = document.createElement("span");
		span.className = "sentences_phrase";
		span.textContent = text.slice(start, end);
		frag.append(span);
		cursor = end;
	}
	frag.append(text.slice(cursor));
	return frag;
}

/**
 * 문장마다 `.sentences_item` 으로 묶은 조각 - React `renderSentences` 와 같은 규칙. 나눌 것이 없으면(한 문장) null.
 * `continuesFrom` · `continuesTo` 는 앞 · 뒤 요소(`<strong>` · `<a>`)에 이어 붙은 조각 - 그쪽 문장은 묶지 않는다
 */
function build(text, { continuesFrom = false, continuesTo = false } = {}) {
	const sentences = splitSentences(text);
	const open = continuesFrom || continuesTo;
	if (sentences.length === 0 || (sentences.length < 2 && !open)) return null;
	const unfinished = !/[.!?]["')\]”’」』]*$/.test(text.trimEnd());
	const frag = document.createDocumentFragment();
	sentences.forEach((sentence, index) => {
		frag.append(text.slice(index > 0 ? sentences[index - 1].end : 0, sentence.start));
		const partial =
			(continuesFrom && index === 0) ||
			(continuesTo && unfinished && index === sentences.length - 1);
		if (partial) {
			frag.append(phrases(sentence.text));
			return;
		}
		const item = document.createElement("span");
		item.className = "sentences_item";
		item.append(phrases(sentence.text));
		frag.append(item);
	});
	frag.append(text.slice(sentences.at(-1).end));
	return frag;
}

/** 요소 바로 아래 글자 노드만 나눈다 - 안쪽 요소(`<strong>` 등)는 건드리지 않는다 */
function apply(element) {
	for (const node of [...element.childNodes]) {
		if (node.nodeType !== Node.TEXT_NODE) continue;
		const frag = build(node.data, {
			continuesFrom: node.previousSibling?.nodeType === Node.ELEMENT_NODE,
			continuesTo: node.nextSibling?.nodeType === Node.ELEMENT_NODE,
		});
		if (frag) node.replaceWith(frag);
	}
	element._btSentences = true;
}

/**
 * React `Sentences` · Toast · Alert `message` 와 같은 문장 단위 줄바꿈.
 * `data-bt-sentences` 를 단 요소는 `init()` 이 나눈다 (서버 템플릿용).
 *
 * @example
 * Bigtablet.Sentences.set(el, "저장했어요. 다른 기기에도 곧 반영돼요.");
 */
export const Sentences = {
	/** 요소의 내용을 `text` 로 바꾸고 나눈다. 한 문장이면 글자 그대로 */
	set(element, text) {
		element.textContent = text;
		apply(element);
	},
	/** 요소에 이미 있는 글자를 나눈다 - 다시 불러도 한 번만 */
	apply(element) {
		if (!element._btSentences) apply(element);
	},
};
