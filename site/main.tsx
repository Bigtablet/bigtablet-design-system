import { cn, IconButton, Menu } from "@bigtablet/design-system";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CATEGORIES } from "./categories";
import { ComponentCard, type DocPage, Page } from "./docs";
import { FOUNDATIONS } from "./foundation";
import { GITHUB, GUIDES, Landing, NPM } from "./guides";
import { SiteSearch } from "./search";
import "./site.scss";

// pages/*.tsx 가 내보내는 DocPage 를 모두 모은다 - 페이지 파일을 추가하면 끝
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
	}, [slug]);
	// 첫 화면은 사이드바 없이 넓게 - 문서 한 페이지처럼 보이지 않게
	const isLanding = !page && slug === "";
	return (
		<div className={cn("site", isLanding && "site_landing")}>
			<header className="site_top">
				<a className="site_brand" href="#/">
					<img src="/images/logo/bigtablet.png" alt="Bigtablet" width={84} height={27} />
					<span>디자인 시스템</span>
				</a>
				<nav className="site_top_nav" aria-label="주 메뉴">
					<a href="#/components" aria-current={slug === "components" || page ? "page" : undefined}>
						컴포넌트
					</a>
					<a href="#/tokens/colors" aria-current={slug.startsWith("tokens/") ? "page" : undefined}>
						토큰
					</a>
					<a href="#/install" aria-current={slug === "install" ? "page" : undefined}>
						설치
					</a>
					<a href="#/ai" aria-current={slug === "ai" ? "page" : undefined}>
						AI
					</a>
				</nav>
				<SiteSearch pages={PAGES} />
				<div className="site_top_actions">
					<a className="site_top_link" href={GITHUB} target="_blank" rel="noreferrer">
						GitHub
					</a>
					<a className="site_top_link" href={NPM} target="_blank" rel="noreferrer">
						npm
					</a>
					<ThemeMenu theme={theme} onChange={setTheme} />
				</div>
			</header>
			{!isLanding && (
				<nav className="site_nav" aria-label="컴포넌트">
					<div className="site_nav_group">
						<p className="site_nav_title">시작하기</p>
						{GUIDES.map((g) => (
							<a
								key={g.slug}
								href={`#/${g.slug}`}
								aria-current={!page && slug === g.slug ? "page" : undefined}
							>
								{g.title}
							</a>
						))}
					</div>
					<div className="site_nav_group">
						<p className="site_nav_title">Foundation</p>
						{FOUNDATIONS.map((f) => (
							<a
								key={f.slug}
								href={`#/${f.slug}`}
								aria-current={slug === f.slug ? "page" : undefined}
							>
								{f.title}
							</a>
						))}
					</div>
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
			)}
			<main className="site_main">
				<Route slug={slug} page={page} theme={theme} />
			</main>
		</div>
	);
}

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);

const THEMES = [
	{ value: "light", label: "라이트", icon: Sun },
	{ value: "dark", label: "다크", icon: Moon },
	{ value: "system", label: "시스템 설정", icon: Monitor },
] as const;

/** 테마 - 지금 테마 아이콘 버튼을 누르면 셋 중 하나를 고르는 메뉴 */
function ThemeMenu({ theme, onChange }: { theme: Theme; onChange: (t: Theme) => void }) {
	const current = THEMES.find((t) => t.value === theme) ?? THEMES[2];
	const CurrentIcon = current.icon;
	return (
		<Menu
			align="end"
			trigger={<IconButton icon={<CurrentIcon />} aria-label={`테마: ${current.label}`} />}
			items={THEMES.map((t) => ({
				key: t.value,
				label: t.label,
				icon: t.value === theme ? <Check size={16} /> : <t.icon size={16} />,
				onSelect: () => onChange(t.value),
			}))}
		/>
	);
}

/** 문서 페이지 · 시작하기 가이드 · 전체 컴포넌트 · 첫 화면. 모르는 주소는 첫 화면 */
function Route({ slug, page, theme }: { slug: string; page?: DocPage; theme: Theme }) {
	if (page) return <Page key={page.slug} page={page} theme={theme} />;
	if (slug === "components") return <Overview />;
	const Guide = [...GUIDES, ...FOUNDATIONS].find((g) => g.slug === slug)?.Body;
	return Guide ? <Guide /> : <Landing pages={PAGES} />;
}

/** 컴포넌트 홈 - 그룹별 카드(첫 예제 축소 미리보기 · 코드명 · 한국어 이름 · 한 줄 설명). 검색은 헤더 */
function Overview() {
	return (
		<article className="doc_overview">
			<header className="doc_block doc_head">
				<h1>컴포넌트</h1>
				<p className="doc_lede">
					{PAGES.length}개 컴포넌트를 쓰임새별로 묶었습니다. 이름으로 찾으려면{" "}
					{isMac ? "⌘K" : "Ctrl K"} 를 누릅니다.
				</p>
			</header>
			{GROUPS.map(({ c, pages }) => (
				<section key={c} className="doc_block ov_group">
					<h2>
						{c} <span>{pages.length}</span>
					</h2>
					<div className="ov_grid">
						{pages.map((p) => (
							<ComponentCard key={p.slug} page={p} />
						))}
					</div>
				</section>
			))}
		</article>
	);
}

createRoot(document.getElementById("root")!).render(<App />);
