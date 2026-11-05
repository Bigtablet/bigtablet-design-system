import { $, $$, escapeHtml } from "./utils.js";

/* ========================================
     Pagination Component
     ======================================== */

/**
 * Initialize Pagination component
 * @param {HTMLElement|string} element - Pagination container or selector
 * @param {Object} options - Configuration options
 */
export function Pagination(element, options = {}) {
	const container = typeof element === "string" ? $(element) : element;
	if (!container) return null;

	const config = {
		page: 1,
		totalPages: 1,
		sibling: 2,
		// React Pagination 과 동일한 페이지 변경 콜백.
		onPageChange: null,
		// 링크 주소 틀 (예: "/logs?page={page}"). 주면 번호·이전·다음을 <a href> 로 그려
		// 서버 렌더 화면에서 쪽을 넘긴다. onPageChange 는 부르지 않는다.
		href: null,
		// React Pagination 의 prevLabel · nextLabel 과 같은 이름·기본값 (ko 카탈로그).
		prevLabel: "이전 페이지",
		nextLabel: "다음 페이지",
		// React Pagination 의 navLabel - 컨테이너(<nav>)에 이름이 없을 때만 단다.
		navLabel: "페이지 이동",
		// React showPageJump · pageJumpLabel 과 같은 이름·기본값 - 현재 쪽 칸을 입력칸으로 바꿔
		// 번호를 적고 Enter 로 바로 가게 한다. {page} 는 현재 쪽, {total} 은 마지막 쪽
		showPageJump: false,
		pageJumpLabel: "현재 {page}쪽 - 이동할 쪽 번호 (1–{total})",
		...options,
	};

	// 범위 보정 - data-page 가 total 을 넘거나 음수여도 활성 쪽·이전/다음 링크가 범위 안에 있게
	// 숫자가 아니면(NaN · undefined) 1 로 - Math.max(1, NaN) 은 NaN 이라 보정이 그대로 번진다
	const toCount = (n) => (Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1);
	const clampPage = (page) => Math.min(toCount(page), config.totalPages);
	config.totalPages = toCount(config.totalPages);
	config.page = clampPage(config.page);

	if (!container.hasAttribute("aria-label") && !container.hasAttribute("aria-labelledby")) {
		container.setAttribute("aria-label", config.navLabel);
	}

	// http(s) 가 아닌 틀(javascript:, data: 등)은 링크로 그리지 않고 버튼 모드로 둔다.
	// URL 로 파싱해 브라우저와 같은 규칙으로 스킴을 읽는다 (상대 경로는 현재 주소 기준 http(s)).
	if (config.href) {
		let protocol = "";
		try {
			protocol = new URL(config.href, document.baseURI).protocol;
		} catch {}
		if (protocol !== "http:" && protocol !== "https:") config.href = null;
	}

	// Thymeleaf 의 @{...(page='{page}')} 처럼 틀이 URL 인코딩돼 들어와도 치환한다.
	const pageHref = (page) => config.href.replace(/\{page\}|%7Bpage%7D/gi, String(page));

	// 링크 모드면 <a>, 아니면 <button>. 눌리지 않는 이전·다음은 링크 모드에서도 disabled 버튼으로 둔다.
	function control(target, disabled, attrs, content) {
		if (config.href && !disabled) {
			return `<a href="${escapeHtml(pageHref(target))}" ${attrs}>${content}</a>`;
		}
		return `<button type="button" ${disabled ? "disabled" : ""} ${attrs}>${content}</button>`;
	}

	function range(start, end) {
		const out = [];
		for (let i = start; i <= end; i++) out.push(i);
		return out;
	}

	function getPaginationItems(page, totalPages) {
		if (totalPages <= 7) return range(1, totalPages);

		const items = [];
		const last = totalPages;
		const sibling = config.sibling;

		if (page <= sibling + 2) {
			for (const p of range(1, sibling + 3)) items.push(p);
			items.push("ellipsis");
			items.push(last);
			return items;
		}

		if (page >= last - sibling - 1) {
			items.push(1);
			items.push("ellipsis");
			for (const p of range(last - sibling - 2, last)) items.push(p);
			return items;
		}

		items.push(1);
		items.push("ellipsis");
		for (const p of range(page - sibling, page + sibling)) items.push(p);
		items.push("ellipsis");
		items.push(last);

		return items;
	}

	function render() {
		const items = getPaginationItems(config.page, config.totalPages);
		// innerHTML 을 갈면 누른 버튼이 사라져 포커스가 body 로 떨어진다 - 같은 자리로 되돌린다
		const focused = container.contains(document.activeElement) ? document.activeElement : null;
		const focusAction = focused?.dataset.action;

		let html = control(
			config.page - 1,
			config.page <= 1,
			`class="bt-pagination__item" data-action="prev" aria-label="${escapeHtml(config.prevLabel)}"`,
			"‹",
		);
		html += `<div class="bt-pagination__pages">`;

		items.forEach((item) => {
			if (item === "ellipsis") {
				html += `<span class="bt-pagination__ellipsis" aria-hidden="true">…</span>`;
			} else if (item === config.page && config.showPageJump) {
				// 현재 쪽 = 입력칸. size 로 자릿수에 맞춘 폭 (한 자리는 CSS min-width 가 받친다)
				const label = String(config.pageJumpLabel)
					.replace("{page}", String(config.page))
					.replace("{total}", String(config.totalPages));
				html += `<input type="text" inputmode="numeric" class="bt-pagination__page-input" data-action="jump-input" aria-current="page" value="${config.page}" size="${String(config.page).length}" aria-label="${escapeHtml(label)}">`;
			} else {
				const isActive = item === config.page;
				html += control(
					item,
					false,
					`class="bt-pagination__page${isActive ? " bt-pagination__page--active" : ""}" data-page="${escapeHtml(item)}"${isActive ? ' aria-current="page"' : ""}`,
					escapeHtml(item),
				);
			}
		});

		html += "</div>";
		html += control(
			config.page + 1,
			config.page >= config.totalPages,
			`class="bt-pagination__item" data-action="next" aria-label="${escapeHtml(config.nextLabel)}"`,
			"›",
		);

		container.innerHTML = html;

		if (focused) {
			const current = container.querySelector('[aria-current="page"]');
			const target = focusAction
				? container.querySelector(`[data-action="${focusAction}"]`)
				: current;
			// 끝쪽에서 비활성이 된 이전·다음이면 현재 쪽으로
			(target && !target.disabled ? target : current)?.focus();
		}

		if (config.showPageJump) {
			const input = container.querySelector('[data-action="jump-input"]');
			input.addEventListener("focus", () => input.select());
			input.addEventListener("input", () => {
				input.size = Math.max(1, input.value.length);
				setJumpInvalid(input, false);
			});
			input.addEventListener("keydown", (e) => {
				if (e.key === "Escape") {
					resetJump(input);
					return;
				}
				// 조합 중 Enter 는 IME 확정용. preventDefault - 바깥 <form> 이 제출되지 않게
				if (e.key !== "Enter" || e.isComposing || e.keyCode === 229) return;
				e.preventDefault();
				jump(input);
			});
			// 포커스를 잃으면 적다 만 값은 버리고 현재 쪽으로
			input.addEventListener("blur", () => resetJump(input));
		}

		// 링크 모드는 브라우저가 이동한다
		if (config.href) return;

		// Bind events
		$$("[data-page]", container).forEach((btn) => {
			btn.addEventListener("click", () => {
				const page = parseInt(btn.dataset.page, 10);
				setPage(page);
			});
		});

		const prevBtn = container.querySelector('[data-action="prev"]');
		const nextBtn = container.querySelector('[data-action="next"]');

		if (prevBtn) {
			prevBtn.addEventListener("click", () => setPage(config.page - 1));
		}
		if (nextBtn) {
			nextBtn.addEventListener("click", () => setPage(config.page + 1));
		}
	}

	/** 적은 값을 쪽 번호로 - 천 단위 쉼표·공백 무시, 1 ~ 마지막 쪽으로 맞춘다. 정수가 아니면 null (React parsePageJump 와 같음) */
	function parsePageJump(raw) {
		const text = String(raw).replace(/[\s,]/g, "");
		if (!/^\d+$/.test(text)) return null;
		return Math.min(Math.max(1, Number(text)), Math.max(1, config.totalPages));
	}

	function setJumpInvalid(input, invalid) {
		input.classList.toggle("bt-pagination__page-input--invalid", invalid);
		if (invalid) input.setAttribute("aria-invalid", "true");
		else input.removeAttribute("aria-invalid");
	}

	function resetJump(input) {
		input.value = String(config.page);
		input.size = input.value.length;
		setJumpInvalid(input, false);
	}

	function jump(input) {
		const target = parsePageJump(input.value);
		if (target === null) {
			setJumpInvalid(input, true); // 숫자가 아니면 입력을 그대로 두어 고칠 수 있게
			return;
		}
		if (target === config.page) {
			resetJump(input);
			return;
		}
		if (config.href) {
			// 링크 모드 - 같은 틀의 주소로 이동. <a> 클릭으로 브라우저 기본 이동을 그대로 탄다
			const link = document.createElement("a");
			link.href = pageHref(target);
			link.hidden = true;
			container.appendChild(link);
			link.click();
			link.remove();
		} else {
			setPage(target);
		}
	}

	function setPage(page) {
		if (page < 1 || page > config.totalPages || page === config.page) return;

		config.page = page;
		render();

		// 링크 모드에서는 부르지 않는다 (문서 약속 - 쪽 이동은 브라우저가 한다)
		if (config.onPageChange && !config.href) {
			config.onPageChange(page);
		}
	}

	function setTotalPages(totalPages) {
		config.totalPages = toCount(totalPages);
		config.page = clampPage(config.page);
		render();
	}

	// Initialize
	render();

	return {
		getPage: () => config.page,
		setPage,
		setTotalPages,
		render,
	};
}
