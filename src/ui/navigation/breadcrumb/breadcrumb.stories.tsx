import type { Meta, StoryObj } from "@storybook/react";
import { Slash } from "lucide-react";
import { Breadcrumb } from ".";

const meta: Meta<typeof Breadcrumb> = {
	title: "Components/Breadcrumb",
	component: Breadcrumb,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Breadcrumb**는 페이지 위계 네비게이션. 사용자에게 현재 위치 + 상위로 돌아갈 경로를 보여줌. 마지막 아이템은 현재 페이지로 자동 처리.

### 언제 쓰는가
- ✅ 깊은 위계(3단 이상)의 페이지에서 현재 위치 표시
- ❌ 글로벌 페이지 네비게이션은 **NavBar / Sidebar**
- ❌ 페이지 내 섹션 전환은 **Tabs**
- ❌ 순서가 있는 step indicator는 Stepper (별도)

### items 동작
- 마지막 항목 — 항상 \`<span aria-current="page">\` (비링크 텍스트)
- \`href\` 있음 → \`<a>\` 렌더 (페이지 이동)
- \`href\` 없이 \`onClick\`만 → \`<button>\` 렌더 (SPA 라우터 호출)

### 접근성
- 컨테이너: \`<nav aria-label="Breadcrumb">\`
- 리스트: \`<ol>\` (순서 의미 있음)
- 마지막: \`aria-current="page"\` — 스크린리더에 "현재 페이지" announce
- 구분자: \`aria-hidden="true"\` — 스크린리더 무시

### 커스텀 separator
기본 \`<ChevronRight size={14} />\`. \`separator\` prop으로 \`/\`, \`>\`, 커스텀 아이콘 교체 가능.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
	name: "기본",
	render: () => (
		<Breadcrumb
			items={[
				{ label: "홈", href: "/" },
				{ label: "블로그", href: "/blog" },
				{ label: "디자인 시스템 v3.0" },
			]}
		/>
	),
};

export const ShortPath: Story = {
	name: "2단계",
	render: () => (
		<Breadcrumb
			items={[
				{ label: "Settings", href: "/settings" },
				{ label: "Profile" },
			]}
		/>
	),
};

export const CustomSeparator: Story = {
	name: "구분자 커스텀",
	render: () => (
		<Breadcrumb
			separator={<Slash size={12} aria-hidden />}
			items={[
				{ label: "Docs", href: "/docs" },
				{ label: "Components", href: "/docs/components" },
				{ label: "Breadcrumb" },
			]}
		/>
	),
};

export const ButtonOnly: Story = {
	name: "버튼 onClick 사용",
	render: () => (
		<Breadcrumb
			items={[
				{ label: "Root", onClick: () => alert("root") },
				{ label: "Section", onClick: () => alert("section") },
				{ label: "Page" },
			]}
		/>
	),
};
