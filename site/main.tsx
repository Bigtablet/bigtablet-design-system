import { SegmentedControl } from "@bigtablet/design-system";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { type DocPage, Page } from "./docs";
import "./site.scss";

// pages/*.tsx 가 내보내는 DocPage 를 모두 모은다 - 페이지 파일을 추가하면 끝
const CATEGORIES = [
	"System",
	"General",
	"Forms",
	"Display",
	"Feedback",
	"Navigation",
	"Overlay",
	"Layout",
];
const PAGES = Object.values(
	import.meta.glob<Record<string, DocPage>>("./pages/*.tsx", { eager: true }),
)
	.flatMap((m) => Object.values(m))
	.sort(
		(a, b) =>
			CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) ||
			a.title.localeCompare(b.title),
	);
const FIRST = PAGES[0] as DocPage;

type Theme = "light" | "dark" | "system";

// ponytail: 해시 라우팅 - 페이지가 수십 개가 되고 검색 · SEO 가 필요해지면 Next.js 로
function useSlug() {
	const read = () => location.hash.replace(/^#\/?/, "").split("#")[0] || FIRST.slug;
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

	const page = PAGES.find((p) => p.slug === slug) ?? FIRST;
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
				{CATEGORIES.map((c) => (
					<div key={c} className="site_nav_group">
						<p className="site_nav_title">{c}</p>
						{PAGES.filter((p) => p.category === c).map((p) => (
							<a
								key={p.slug}
								href={`#/${p.slug}`}
								aria-current={p.slug === page.slug ? "page" : undefined}
							>
								{p.title}
							</a>
						))}
					</div>
				))}
			</nav>
			<main className="site_main">
				<Page key={page.slug} page={page} theme={theme} />
			</main>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(<App />);
