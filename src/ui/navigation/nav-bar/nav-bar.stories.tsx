import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Calendar } from "lucide-react";
import { useState } from "react";
import { Avatar } from "../../display/avatar";
import { Button } from "../../general/button";
import { IconButton } from "../../general/icon-button";
import { TextField } from "../../forms/textfield";
import { NavBar, NavLink } from ".";

const meta: Meta<typeof NavBar> = {
	title: "Components/NavBar",
	component: NavBar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**NavBar**는 페이지 상단 네비게이션 바. B2C/마케팅 페이지의 메인 헤더. \`NavLink\` 자식 + \`brand\` / \`actions\` 좌우 영역.

### 언제 쓰는가
- ✅ B2C/마케팅 페이지의 글로벌 상단 헤더
- ❌ Admin/dashboard 좌측은 **Sidebar**
- ❌ 페이지 위계는 **Breadcrumb**

### Variants
- \`variant="default"\` (기본) — 흰 bg + 하단 회색 border
- \`variant="transparent"\` — 투명 bg. Hero 이미지/그라데이션 위에 (부모가 배경 정의)
- \`variant="accent"\` — navy bg + 흰 텍스트. 강한 brand 톤

### sticky
\`sticky={true}\`로 \`position: sticky; top: 0\` + \`z-index: $z_level3\` 적용.
transparent + sticky 조합은 스크롤 시 외부 state로 variant를 전환하는 패턴이 흔함.

### 접근성
\`<header>\` + 내부 \`<nav>\` 시멘틱. \`active={true}\` → \`aria-current="page"\` 자동.
모든 link에 \`:focus-visible\` 시 \`focus_ring\` 표시.

### 반응형
max-width 1200px inner, 중앙 정렬.
compact (≤768px)에서 padding과 link gap 자동 축소.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof NavBar>;

function Brand({ invert = false }: { invert?: boolean }) {
	return (
		<img
			src="/images/logo/bigtablet.png"
			alt="Bigtablet"
			height={28}
			style={{ display: "block", filter: invert ? "brightness(0) invert(1)" : undefined }}
		/>
	);
}

// ─── Interactive demo — active 이동 시뮬레이션 ─────────────────────────────

export const InteractiveActive: Story = {
	name: "Interactive — 클릭 시 active 이동",
	parameters: {
		docs: {
			description: {
				story:
					"링크 클릭 시 active underline이 부드럽게 이동. 실제 페이지 이동 없이 SPA navigation 흉내.",
			},
		},
	},
	render: () => {
		const [active, setActive] = useState("home");
		const links = [
			{ id: "home", label: "Home" },
			{ id: "product", label: "제품" },
			{ id: "blog", label: "블로그" },
			{ id: "pricing", label: "요금제" },
			{ id: "contact", label: "문의" },
		];
		return (
			<>
				<NavBar brand={<Brand />} actions={<Button size="sm">로그인</Button>}>
					{links.map((link) => (
						<NavLink
							key={link.id}
							href={`#${link.id}`}
							active={active === link.id}
							onClick={(e) => {
								e.preventDefault();
								setActive(link.id);
							}}
						>
							{link.label}
						</NavLink>
					))}
				</NavBar>
				<div
					style={{
						padding: "32px 24px",
						color: "var(--bt-color-text-body)",
						maxWidth: 720,
						margin: "0 auto",
					}}
				>
					<p style={{ fontSize: 14, color: "var(--bt-color-text-caption)", marginBottom: 8 }}>
						현재 활성 페이지:
					</p>
					<h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
						{links.find((l) => l.id === active)?.label}
					</h2>
					<p style={{ fontSize: 14, marginTop: 16 }}>
						위 네비를 클릭하면 active underline이 부드럽게 이동합니다.
					</p>
				</div>
			</>
		);
	},
};

export const Default: Story = {
	name: "Default (흰 bg + border)",
	render: () => (
		<NavBar brand={<Brand />} actions={<Button size="sm">로그인</Button>}>
			<NavLink href="#" active>
				Home
			</NavLink>
			<NavLink href="#">제품</NavLink>
			<NavLink href="#">블로그</NavLink>
			<NavLink href="#">문의</NavLink>
		</NavBar>
	),
};

export const Accent: Story = {
	name: "Accent (navy bg)",
	render: () => (
		<NavBar
			variant="accent"
			brand={<Brand invert />}
			actions={
				<Button variant="outline" size="sm">
					로그인
				</Button>
			}
		>
			<NavLink href="#" active>
				Home
			</NavLink>
			<NavLink href="#">제품</NavLink>
			<NavLink href="#">블로그</NavLink>
		</NavBar>
	),
};

export const Transparent: Story = {
	name: "Transparent (hero 위)",
	render: () => (
		<div
			style={{
				minHeight: 200,
				background: "linear-gradient(180deg, #7AA5D2, #47555E)",
				color: "#fff",
			}}
		>
			<NavBar variant="transparent" brand={<Brand invert />} actions={<Button size="sm">시작</Button>}>
				<NavLink href="#" active>
					소개
				</NavLink>
				<NavLink href="#">기능</NavLink>
				<NavLink href="#">요금제</NavLink>
			</NavBar>
			<div style={{ padding: 32 }}>
				<h1>Hero 영역</h1>
			</div>
		</div>
	),
};

// ─── Admin/Dashboard 헤더 패턴 (insight 스타일) ────────────────────────────

// OrganizationButton — logo + 이름 + 라벨 (insight 헤더 좌측 패턴)
const OrganizationButton = ({ name, role }: { name: string; role: string }) => (
	<button
		type="button"
		style={{
			display: "inline-flex",
			alignItems: "center",
			gap: 12,
			padding: "8px 12px",
			borderRadius: 8,
			border: "none",
			background: "transparent",
			cursor: "pointer",
			transition: "background 0.1s",
		}}
		onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.04)")}
		onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
	>
		<div
			style={{
				width: 40,
				height: 40,
				borderRadius: 8,
				background: "var(--bt-color-bg-solid-dim)",
				border: "1px solid var(--bt-color-border-default)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
				fontSize: 14,
				fontWeight: 600,
				color: "var(--bt-color-text-body)",
			}}
		>
			{name.charAt(0)}
		</div>
		<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
			<span style={{ fontSize: 14, fontWeight: 500, color: "var(--bt-color-text-heading)" }}>
				{name}
			</span>
			<span style={{ fontSize: 12, color: "var(--bt-color-text-caption)" }}>{role}</span>
		</div>
	</button>
);

// ProfileButton — 40px 원형 + border (insight 헤더 우측 패턴)
const ProfileButton = ({ name }: { name: string }) => (
	<button
		type="button"
		aria-label="프로필 열기"
		style={{
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			width: 40,
			height: 40,
			borderRadius: "50%",
			border: "1px solid var(--bt-color-border-default)",
			background: "var(--bt-color-bg-solid-dim)",
			cursor: "pointer",
			flexShrink: 0,
			fontSize: 14,
			fontWeight: 500,
			color: "var(--bt-color-text-body)",
			transition: "opacity 0.1s",
		}}
		onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
		onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
	>
		{name.charAt(0)}
	</button>
);

export const AdminHeader: Story = {
	name: "Admin 헤더 (insight 스타일 — fluid + Org + Profile)",
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				story:
					"insight-monorepo-web 정확한 헤더 패턴 — `layout=\"fluid\"` 풀폭 + OrganizationButton (logo + name + label) + search + IconButton actions + i18n + divider + 40px 원형 ProfileButton.",
			},
		},
	},
	render: () => {
		const [search, setSearch] = useState("");
		const [locale, setLocale] = useState("ko");
		return (
			<NavBar
				layout="fluid"
				brand={<OrganizationButton name="강남 1호점" role="Organization Info" />}
				searchSlot={
					<TextField
						size="sm"
						fullWidth
						placeholder="대시보드 / 매장 / 직원 검색"
						value={search}
						onChangeAction={setSearch}
					/>
				}
				actions={
					<>
						<IconButton
							variant="standard"
							size="sm"
							aria-label="캘린더 열기"
							icon={<Calendar size={18} />}
						/>
						<IconButton
							variant="standard"
							size="sm"
							aria-label="알림 보기"
							icon={<Bell size={18} />}
						/>
						<Button size="sm">팀 초대</Button>
					</>
				}
				locale={{
					current: locale,
					onChange: setLocale,
					options: [
						{ value: "ko", label: "한국어" },
						{ value: "en", label: "English" },
						{ value: "ja", label: "日本語" },
					],
				}}
				profile={<ProfileButton name="박상민" />}
			/>
		);
	},
};

export const LocaleSwitcherOnly: Story = {
	name: "Locale switcher만",
	parameters: {
		docs: {
			description: {
				story: "복잡한 admin 헤더 없이 i18n 토글만 보고 싶을 때.",
			},
		},
	},
	render: () => {
		const [locale, setLocale] = useState("en");
		return (
			<NavBar
				brand={<Brand />}
				locale={{
					current: locale,
					onChange: setLocale,
					options: [
						{ value: "ko", label: "한국어" },
						{ value: "en", label: "English" },
						{ value: "ja", label: "日本語" },
						{ value: "zh", label: "中文" },
					],
				}}
			/>
		);
	},
};
