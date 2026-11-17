import {
	Badge,
	Button,
	type ButtonSize,
	type ButtonVariant,
	SegmentedControl,
	Toggle,
} from "@bigtablet/design-system";
import { type ReactNode, useState } from "react";
import { type DocPage, exampleOf, Md, PropsTable, sourceOf } from "./docs";
import { CodeBlock } from "./guides";
import "./lab.scss";

// 독자 템플릿 방향 시안 3개 - 첫 화면과 Button 페이지만. 고르면 사이트 전체에 적용한다.
// 공통 재료는 DS 토큰뿐(흑백 + 의미가 정해진 상태 색) - 차별은 색이 아니라 형태 · 타이포 · 배치에서 낸다.

type Direction = "a" | "b" | "c";
type View = "home" | "button";

interface LabProps {
	slug: string;
	pages: DocPage[];
	themeControl: ReactNode;
}

const LEDE =
	"66개 컴포넌트와 디자인 토큰입니다. React와 서버 템플릿(Thymeleaf · JSP · PHP)에서 같은 모양으로 씁니다.";

export function Lab({ slug, pages, themeControl }: LabProps) {
	const [, dir = "a", view = "home"] = slug.split("/") as [string, Direction?, View?];
	const button = pages.find((p) => p.slug === "button") as DocPage;
	const groups = [...new Set(pages.map((p) => p.category))].map((c) => ({
		name: c,
		pages: pages.filter((p) => p.category === c),
	}));
	const props = { button, groups, pages, themeControl };
	return (
		<div className={`lab lab_${dir}`}>
			{dir === "a" && <IsoDirection view={view} {...props} />}
			{dir === "b" && <BenchDirection view={view} {...props} />}
			{dir === "c" && <IndexDirection view={view} {...props} />}
			<LabSwitcher dir={dir} view={view} />
		</div>
	);
}

interface DirectionProps {
	view: View;
	button: DocPage;
	groups: { name: string; pages: DocPage[] }[];
	pages: DocPage[];
	themeControl: ReactNode;
}

/** 시안 사이를 오가는 바 - 비교용, 고른 뒤에는 지운다 */
function LabSwitcher({ dir, view }: { dir: Direction; view: View }) {
	const go = (d: Direction, v: View) => {
		location.hash = `#/lab/${d}/${v}`;
	};
	return (
		<nav className="lab_switcher" aria-label="시안 전환">
			<SegmentedControl<Direction>
				size="sm"
				aria-label="방향"
				value={dir}
				onValueChange={(d) => go(d, view)}
				items={[
					{ value: "a", label: "A 육면체" },
					{ value: "b", label: "B 작업대" },
					{ value: "c", label: "C 색인" },
				]}
			/>
			<SegmentedControl<View>
				size="sm"
				aria-label="화면"
				value={view}
				onValueChange={(v) => go(dir, v)}
				items={[
					{ value: "home", label: "첫 화면" },
					{ value: "button", label: "Button" },
				]}
			/>
			<a href="#/" className="lab_switcher_back">
				지금 사이트로
			</a>
		</nav>
	);
}

function Demo({ id }: { id: string }) {
	const Comp = exampleOf(id);
	return Comp ? <Comp /> : null;
}

/* ─── A 육면체: 로고의 등각 격자를 바닥으로 ─────────────────────────────── */

function IsoDirection({ view, button, groups, themeControl }: DirectionProps) {
	return (
		<>
			<header className="a_top">
				<a href="#/lab/a/home" className="a_brand">
					<img src="/images/logo/bigtablet.png" alt="Bigtablet" width={84} height={27} />
					<span>디자인 시스템</span>
				</a>
				<nav className="a_nav" aria-label="주 메뉴">
					<a href="#/lab/a/home">컴포넌트</a>
					<a href="#/tokens/colors">토큰</a>
					<a href="#/install">설치</a>
				</nav>
				{themeControl}
			</header>
			{view === "home" ? (
				<main>
					<section className="a_hero">
						<div className="a_hero_text">
							<h1>Bigtablet 화면을 쌓는 부품 상자</h1>
							<p>
								<Md>{LEDE}</Md>
							</p>
							<div className="a_actions">
								<Button as="a" href="#/install" size="lg">
									설치하기
								</Button>
								<Button as="a" href="#/components" size="lg" variant="outline">
									컴포넌트 둘러보기
								</Button>
							</div>
						</div>
						<div className="a_box iso_floor" aria-hidden>
							<img className="a_mark" src="/images/logo/favicon.png" alt="" />
							<span className="a_part a_part_1" inert>
								<Button size="sm">저장</Button>
							</span>
							<span className="a_part a_part_2" inert>
								<Badge tone="success">결제 완료</Badge>
							</span>
							<span className="a_part a_part_3" inert>
								<Toggle ariaLabel="알림" defaultChecked />
							</span>
						</div>
					</section>
					<section className="a_groups" aria-label="컴포넌트 묶음">
						{groups.map((g) => (
							<div key={g.name} className="a_group">
								<h2>
									{g.name} <span>{g.pages.length}</span>
								</h2>
								<ul>
									{g.pages.map((p) => (
										<li key={p.slug}>
											<a href={`#/${p.slug}`}>{p.title}</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</section>
				</main>
			) : (
				<main className="a_doc">
					<header className="a_doc_head">
						<p className="a_crumb">{button.category}</p>
						<h1>
							{button.title} <span>{button.name}</span>
						</h1>
						<p>
							<Md>{button.summary}</Md>
						</p>
					</header>
					{button.examples.map((ex) => (
						<section key={ex.id} className="a_example">
							<h2>{ex.title}</h2>
							{ex.desc && (
								<p>
									<Md>{ex.desc}</Md>
								</p>
							)}
							<div className="a_stage iso_floor">
								<Demo id={ex.id} />
							</div>
						</section>
					))}
					<section className="a_example">
						<h2>Props</h2>
						<PropsTable name="ButtonProps" titled={false} />
					</section>
				</main>
			)}
		</>
	);
}

/* ─── B 작업대: 첫 화면이 실제로 눌러지는 화면, 컴포넌트는 놀이판 ──────────── */

function BenchDirection({ view, button, groups, themeControl }: DirectionProps) {
	return (
		<>
			<header className="b_top">
				<a href="#/lab/b/home" className="b_brand">
					<img src="/images/logo/favicon.png" alt="" width={22} height={22} />
					Bigtablet 디자인 시스템
				</a>
				{themeControl}
			</header>
			{view === "home" ? (
				<main className="b_home">
					<section className="b_intro">
						<h1>눌러 보면서 고르는 부품</h1>
						<p>
							<Md>{LEDE}</Md>
						</p>
						<div className="b_actions">
							<Button as="a" href="#/install">
								설치하기
							</Button>
							<Button as="a" href="#/lab/b/button" variant="outline">
								Button 놀이판 열기
							</Button>
						</div>
					</section>
					<figure className="b_bench">
						<iframe
							title="DS 컴포넌트로 만든 관리자 화면"
							src="preview.html?ex=app-shell%2Fadmin&bare"
						/>
						<figcaption>
							실제 컴포넌트로 만든 관리자 화면입니다. 메뉴를 누르고 사이드바를 접어 보세요.
						</figcaption>
					</figure>
					<section className="b_shelves" aria-label="컴포넌트 묶음">
						{groups.map((g) => (
							<a key={g.name} href={`#/${g.pages[0]?.slug ?? ""}`} className="b_shelf">
								<strong>{g.name}</strong>
								<span>{g.pages.map((p) => p.title).join(", ")}</span>
							</a>
						))}
					</section>
				</main>
			) : (
				<ButtonBench button={button} />
			)}
		</>
	);
}

function ButtonBench({ button }: { button: DocPage }) {
	const [variant, setVariant] = useState<ButtonVariant>("filled");
	const [size, setSize] = useState<ButtonSize>("md");
	const [danger, setDanger] = useState(false);
	const [disabled, setDisabled] = useState(false);
	const attrs = [
		variant !== "filled" && `variant="${variant}"`,
		size !== "md" && `size="${size}"`,
		danger && "danger",
		disabled && "disabled",
	].filter(Boolean);
	const code = `<Button${attrs.length ? ` ${attrs.join(" ")}` : ""}>저장</Button>`;
	return (
		<main className="b_doc">
			<section className="b_play" aria-label="Button 놀이판">
				<div className="b_play_stage">
					<Button variant={variant} size={size} danger={danger} disabled={disabled}>
						저장
					</Button>
				</div>
				<div className="b_controls">
					<label className="b_control">
						<span>모양</span>
						<SegmentedControl<ButtonVariant>
							size="sm"
							aria-label="모양"
							value={variant}
							onValueChange={setVariant}
							items={(["filled", "tonal", "outline", "text"] as const).map((v) => ({
								value: v,
								label: v,
							}))}
						/>
					</label>
					<label className="b_control">
						<span>크기</span>
						<SegmentedControl<ButtonSize>
							size="sm"
							aria-label="크기"
							value={size}
							onValueChange={setSize}
							items={(["sm", "md", "lg", "xl"] as const).map((v) => ({ value: v, label: v }))}
						/>
					</label>
					<div className="b_control">
						<span>위험한 동작</span>
						<Toggle ariaLabel="위험한 동작" checked={danger} onCheckedChange={setDanger} />
					</div>
					<div className="b_control">
						<span>비활성</span>
						<Toggle ariaLabel="비활성" checked={disabled} onCheckedChange={setDisabled} />
					</div>
				</div>
				<CodeBlock code={code} />
			</section>
			<article className="b_text">
				<h1>
					{button.title} <span>{button.name}</span>
				</h1>
				<p className="b_summary">
					<Md>{button.summary}</Md>
				</p>
				<h2>언제 쓰는가</h2>
				<ul className="b_when">
					{button.when.map(([situation, pick, self]) => (
						<li key={situation} data-self={self || undefined}>
							<span>{situation}</span>
							<strong>
								<Md>{pick}</Md>
							</strong>
						</li>
					))}
				</ul>
				<h2>예제</h2>
				{button.examples.map((ex) => (
					<div key={ex.id} className="b_example">
						<h3>{ex.title}</h3>
						<div className="b_example_stage">
							<Demo id={ex.id} />
						</div>
					</div>
				))}
				<h2>Props</h2>
				<PropsTable name="ButtonProps" titled={false} />
			</article>
		</main>
	);
}

/* ─── C 색인: 큰 한국어 이름이 주인공, 본문 옆 여백에 메모 ────────────────── */

function IndexDirection({ view, button, groups, pages, themeControl }: DirectionProps) {
	return (
		<>
			<header className="c_top">
				<a href="#/lab/c/home" className="c_brand">
					<img src="/images/logo/bigtablet.png" alt="Bigtablet" width={78} height={25} />
				</a>
				{themeControl}
			</header>
			{view === "home" ? (
				<main className="c_home">
					<section className="c_hero">
						<h1>
							디자인 시스템
							<br />
							찾아보기
						</h1>
						<p>
							<Md>{`${pages.length}개 컴포넌트를 쓰임새로 묶었습니다. 이름을 누르면 예제와 쓰는 법이 나옵니다.`}</Md>
						</p>
						<div className="c_install">
							<CodeBlock code="pnpm add @bigtablet/design-system" />
						</div>
					</section>
					<section className="c_index" aria-label="컴포넌트 찾아보기">
						{groups.map((g) => (
							<div key={g.name} className="c_row">
								<h2>{g.name}</h2>
								<ul>
									{g.pages.map((p) => (
										<li key={p.slug}>
											<a href={`#/${p.slug}`}>
												{p.name}
												<code>{p.title}</code>
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</section>
				</main>
			) : (
				<main className="c_doc">
					<header className="c_doc_head">
						<h1>{button.name}</h1>
						<code>{button.title}</code>
						<p>
							<Md>{button.summary}</Md>
						</p>
					</header>
					{button.examples.map((ex, i) => (
						<section key={ex.id} className="c_section">
							<aside className="c_margin">
								{i === 0 ? (
									<>
										<p>이럴 때 씁니다</p>
										{button.when
											.filter(([, , self]) => self)
											.map(([s]) => (
												<span key={s}>{s}</span>
											))}
										<p>이럴 때는 다른 것</p>
										{button.when
											.filter(([, , self]) => !self)
											.map(([s, pick]) => (
												<span key={s}>
													{s}: <Md>{pick}</Md>
												</span>
											))}
									</>
								) : (
									ex.desc && <Md>{ex.desc}</Md>
								)}
							</aside>
							<div className="c_body">
								<h2>{ex.title}</h2>
								{i === 0 && ex.desc && (
									<p>
										<Md>{ex.desc}</Md>
									</p>
								)}
								<div className="c_stage">
									<Demo id={ex.id} />
								</div>
								<details className="c_source">
									<summary>코드</summary>
									<CodeBlock code={sourceOf(ex.id)} />
								</details>
							</div>
						</section>
					))}
					<section className="c_section">
						<aside className="c_margin">타입에서 자동으로 만든 표입니다.</aside>
						<div className="c_body">
							<h2>Props</h2>
							<PropsTable name="ButtonProps" titled={false} />
						</div>
					</section>
				</main>
			)}
		</>
	);
}
