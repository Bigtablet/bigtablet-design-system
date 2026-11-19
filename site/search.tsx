import { Modal, TextField } from "@bigtablet/design-system";
import { CornerDownLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";

/** 검색 한 줄 - 컴포넌트 · 토큰 · 가이드 페이지를 같은 모양으로 받는다 */
export interface SearchEntry {
	slug: string;
	title: string;
	name: string;
	group: string;
	/** 화면에는 안 보이고 찾기에만 쓰는 말 (요약 · 영어 이름 · 토큰 접두사) */
	keywords: string;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** 헤더 검색 버튼 + ⌘K / Ctrl+K 로 여는 검색 창. 제목 · 이름 · 묶음 · 키워드로 찾는다 */
export function SiteSearch({ entries }: { entries: SearchEntry[] }) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen(true);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const q = query.trim().toLowerCase();
	// 제목 · 이름이 맞는 것을 묶음 · 키워드로만 맞는 것보다 앞에 둔다 ("간격" → 간격 토큰이 Stack 보다 먼저)
	const hit = (fields: string[]) => fields.some((t) => t.toLowerCase().includes(q));
	const results = q
		? entries
				.filter((p) => hit([p.title, p.name, p.group, p.keywords]))
				.sort((a, b) => Number(!hit([a.title, a.name])) - Number(!hit([b.title, b.name])))
		: entries;

	const close = () => {
		setOpen(false);
		setQuery("");
		setActive(0);
	};
	const go = (p: SearchEntry | undefined) => {
		if (!p) return;
		location.hash = `#/${p.slug}`;
		close();
	};

	return (
		<>
			<button type="button" className="site_search_button" onClick={() => setOpen(true)}>
				<Search size={16} aria-hidden />
				<span>검색</span>
				<kbd>{isMac ? "⌘K" : "Ctrl K"}</kbd>
			</button>
			<Modal open={open} onClose={close} ariaLabel="문서 검색" width={560} showCloseIcon={false}>
				<div className="site_search">
					<TextField
						aria-label="문서 검색"
						placeholder="Button, 날짜, 간격, 설치 …"
						leadingIcon={<Search size={16} />}
						value={query}
						onValueChange={(v) => {
							setQuery(v);
							setActive(0);
						}}
						fullWidth
						role="combobox"
						aria-expanded
						aria-controls="site-search-results"
						aria-activedescendant={
							results[active] ? `site-search-${results[active].slug || "home"}` : undefined
						}
						onKeyDown={(e) => {
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setActive((i) => Math.min(i + 1, results.length - 1));
							} else if (e.key === "ArrowUp") {
								e.preventDefault();
								setActive((i) => Math.max(i - 1, 0));
							} else if (e.key === "Enter") {
								e.preventDefault();
								go(results[active]);
							}
						}}
					/>
					{results.length === 0 ? (
						<p className="site_search_empty">"{query}" 에 맞는 문서가 없습니다</p>
					) : (
						<div
							id="site-search-results"
							role="listbox"
							aria-label="검색 결과"
							className="site_search_list"
						>
							{results.map((p, i) => (
								// biome-ignore lint/a11y/useFocusableInteractive: 포커스는 입력에 남고 aria-activedescendant 로 가리킨다 (combobox 패턴)
								// biome-ignore lint/a11y/useKeyWithClickEvents: 키보드는 입력의 방향키 · Enter 가 맡는다
								<div
									key={p.slug || "home"}
									id={`site-search-${p.slug || "home"}`}
									role="option"
									aria-selected={i === active}
									className="site_search_item"
									onMouseEnter={() => setActive(i)}
									onClick={() => go(p)}
								>
									<span className="site_search_title">
										{p.title} <span>{p.name}</span>
									</span>
									<span className="site_search_group">{p.group}</span>
									{i === active && (
										<CornerDownLeft size={14} aria-hidden className="site_search_enter" />
									)}
								</div>
							))}
						</div>
					)}
				</div>
			</Modal>
		</>
	);
}
