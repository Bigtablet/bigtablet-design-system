import { EmptyState, SegmentedControl, TextField } from "@bigtablet/design-system";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { type DocPage, exampleOf, Md, Page } from "./docs";
import "./site.scss";

// pages/*.tsx 가 내보내는 DocPage 를 모두 모은다 - 페이지 파일을 추가하면 끝
const CATEGORIES = [
	"시작하기",
	"레이아웃",
	"버튼",
	"폼",
	"텍스트 입력",
	"선택",
	"날짜 · 시간",
	"파일",
	"데이터",
	"콘텐츠",
	"라벨 · 아이콘",
	"알림 · 상태",
	"로딩",
	"내비게이션",
	"오버레이",
];
const PAGES = Object.values(
	import.meta.glob<Record<string, DocPage>>("./pages/*.tsx", { eager: true }),
)
	.flatMap((m) => Object.values(m))
	.sort(
		(a, b) =>
			CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) ||
			(a.order ?? 99) - (b.order ?? 99),
	);
const GROUPS = CATEGORIES.map((c) => ({ c, pages: PAGES.filter((p) => p.category === c) })).filter(
	(g) => g.pages.length > 0,
);

type Theme = "light" | "dark" | "system";

// ponytail: 해시 라우팅 - 페이지가 수십 개가 되고 검색 · SEO 가 필요해지면 Next.js 로
function useSlug() {
	const read = () => location.hash.replace(/^#\/?/, "").split("#")[0] ?? "";
	const [slug, setSlug] = useState(read);
	useEffect(() => {
		const on = () => {
			setSlug(read());
			window.scrollTo(0, 0);
		};
		window.addEventListener("hashchange", on);
		return () => window.removeEventListener("hashchange", on);
	}, []);
	return slug;
}

function App() {
	const slug = useSlug();
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem("bt-docs-theme") as Theme) ?? "system",
	);
	useEffect(() => {
		if (theme === "system") document.documentElement.removeAttribute("data-theme");
		else document.documentElement.setAttribute("data-theme", theme);
		localStorage.setItem("bt-docs-theme", theme);
	}, [theme]);

	// 없는 주소 · 빈 주소는 컴포넌트 홈
	const page = PAGES.find((p) => p.slug === slug);
	// 다른 페이지로 가면 사이드바에서 현재 항목이 보이게 - 사이드바 안에서만 움직인다
	useEffect(() => {
		document.querySelector('.site_nav [aria-current="page"]')?.scrollIntoView({ block: "nearest" });
	}, [page?.slug]);
	return (
		<div className="site">
			<header className="site_top">
				<a className="site_brand" href="#/">
					Bigtablet <span>Design System</span>
				</a>
				<SegmentedControl<Theme>
					size="sm"
					aria-label="테마"
					value={theme}
					onValueChange={setTheme}
					items={[
						{ value: "light", label: "라이트" },
						{ value: "dark", label: "다크" },
						{ value: "system", label: "시스템" },
					]}
				/>
			</header>
			<nav className="site_nav" aria-label="컴포넌트">
				<a href="#/" className="site_nav_home" aria-current={page ? undefined : "page"}>
					전체 컴포넌트
				</a>
				{GROUPS.map(({ c, pages }) => (
					<div key={c} className="site_nav_group">
						<p className="site_nav_title">
							{c}
							<span>{pages.length}</span>
						</p>
						{pages.map((p) => (
							<a
								key={p.slug}
								href={`#/${p.slug}`}
								aria-current={p.slug === page?.slug ? "page" : undefined}
							>
								<span className="site_nav_code">{p.title}</span>
								<span className="site_nav_name">{p.name}</span>
							</a>
						))}
					</div>
				))}
			</nav>
			<main className="site_main">
				{page ? <Page key={page.slug} page={page} theme={theme} /> : <Overview />}
			</main>
		</div>
	);
}

/** 컴포넌트 홈 - 검색 + 그룹별 카드(첫 예제 축소 미리보기 · 코드명 · 한국어 이름 · 한 줄 설명) */
function Overview() {
	const [query, setQuery] = useState("");
	const q = query.trim().toLowerCase();
	const match = (p: DocPage) =>
		!q || [p.title, p.name, p.category, p.summary].some((t) => t.toLowerCase().includes(q));
	const groups = GROUPS.map((g) => ({ ...g, pages: g.pages.filter(match) })).filter(
		(g) => g.pages.length,
	);
	return (
		<article className="doc_overview">
			<header className="ov_head">
				<h1>컴포넌트</h1>
				<p className="doc_summary">{PAGES.length}개 컴포넌트를 쓰임새별로 묶었습니다.</p>
				<div className="ov_search">
					<TextField
						aria-label="컴포넌트 검색"
						placeholder="이름 · 한국어 · 설명으로 찾기 (예: 날짜, Modal, 복사)"
						leadingIcon={<Search size={16} />}
						clearable
						value={query}
						onValueChange={setQuery}
						fullWidth
					/>
				</div>
			</header>
			{groups.length === 0 && (
				<EmptyState title="찾는 컴포넌트가 없습니다" description="다른 이름으로 찾아 보세요" />
			)}
			{groups.map(({ c, pages }) => (
				<section key={c} className="ov_group">
					<h2>
						{c} <span>{pages.length}</span>
					</h2>
					<div className="ov_grid">
						{pages.map((p) => {
							const Preview = p.examples[0] && exampleOf(p.examples[0].id);
							return (
								<a key={p.slug} href={`#/${p.slug}`} className="ov_card">
									{/* 미리보기는 그림 역할만 - 누르거나 포커스되지 않게 inert */}
									<div className="ov_preview" inert>
										<div className="ov_scale">{Preview && <Preview />}</div>
									</div>
									<div className="ov_text">
										<span className="ov_title">
											{p.title} <span>{p.name}</span>
										</span>
										<span className="ov_desc">
											<Md>{firstSentence(p.summary)}</Md>
										</span>
									</div>
								</a>
							);
						})}
					</div>
				</section>
			))}
		</article>
	);
}

const firstSentence = (text: string) => text.split(/(?<=다\.)\s/)[0] ?? text;

createRoot(document.getElementById("root")!).render(<App />);
