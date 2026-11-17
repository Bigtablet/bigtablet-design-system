import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Getting Started/Introduction",
	tags: ["autodocs"],
	parameters: {
		chromatic: { disableSnapshot: true },
		docs: {
			description: {
				component: `
### Bigtablet Design System

서비스 전반에 사용되는 **UI 컴포넌트와 디자인 토큰**을 관리하는 디자인 시스템입니다.

---

#### 이 문서는 누구를 위한 건가요?

| 역할 | 활용 방법 |
|------|----------|
| **디자이너** | Foundation 토큰 검증, 컴포넌트 시각적 리뷰 |
| **PM** | 컴포넌트 동작 확인, 변경사항 추적 |
| **개발자** | 컴포넌트 API 참고, 코드 예시 확인 |

---

#### 사이드바 구조

- **Getting Started** - Introduction, Installation
- **Cookbook** - 자주 쓰는 조합 레시피 (Form / Layout / Feedback / Data)
- **Examples** - 실전 페이지 조립 예제 (Page Composition)
- **Foundation** - 색상, 타이포그래피, 간격 등 디자인 토큰
- **Components** - 실제 UI 컴포넌트 (버튼, 인풋, 모달 등)

---

#### 지원 환경

| 환경 | Import |
|------|--------|
| React 19 | \`import { Button } from "@bigtablet/design-system"\` |
| Next.js (App Router) | \`import { Button } from "@bigtablet/design-system"\` |
| Vanilla (Thymeleaf, JSP, PHP) | \`bigtablet.min.css\` + \`bigtablet.min.js\` |
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj;

export const Overview: Story = {
	name: "시작하기",
	render: () => (
		<div style={{ display: "grid", gap: 24, maxWidth: 640 }}>
			<section
				style={{
					padding: 24,
					background: "var(--bt-color-bg-solid-dim)",
					borderRadius: 12,
					border: "1px solid var(--bt-color-border-default)",
				}}
			>
				<h3 style={{ margin: "0 0 16px", fontSize: 16 }}>빠른 시작</h3>
				<div style={{ display: "grid", gap: 12 }}>
					<Step
						number={1}
						title="설치"
						description="Getting Started / Installation 의 순서대로 패키지를 설치하고 Provider 로 감쌉니다."
					/>
					<Step
						number={2}
						title="고르기"
						description="Components 의 각 문서 첫 표 '언제 쓰는가' 로 상황에 맞는 컴포넌트를 고릅니다. Controls 로 Props 를 바꿔 보며 동작을 확인합니다."
					/>
					<Step
						number={3}
						title="스타일은 토큰으로"
						description="직접 스타일을 쓸 때는 Foundation 의 토큰(색상 · 간격 · 타이포)을 씁니다. 색 값을 하드코딩하면 다크 모드에서 깨집니다."
					/>
				</div>
			</section>

			<section
				style={{
					padding: 24,
					background: "var(--bt-color-bg-solid-dim)",
					borderRadius: 12,
					border: "1px solid var(--bt-color-border-default)",
				}}
			>
				<h3 style={{ margin: "0 0 12px", fontSize: 16 }}>버전 정보</h3>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
					<InfoCard label="패키지" value="@bigtablet/design-system" />
					<InfoCard label="Storybook" value="v10" />
					<InfoCard label="React" value="19" />
					<InfoCard label="시각 회귀" value="Playwright (test:visual)" />
				</div>
			</section>
		</div>
	),
};

function Step({
	number,
	title,
	description,
}: {
	number: number;
	title: string;
	description: string;
}) {
	return (
		<div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
			<div
				style={{
					width: 28,
					height: 28,
					borderRadius: "50%",
					background: "var(--bt-color-accent-default)",
					color: "var(--bt-color-accent-on-surface)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: 13,
					fontWeight: 600,
					flexShrink: 0,
				}}
			>
				{number}
			</div>
			<div>
				<strong style={{ fontSize: 14 }}>{title}</strong>
				<p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>
					{description}
				</p>
			</div>
		</div>
	);
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div
			style={{
				padding: "12px 16px",
				background: "var(--bt-color-bg-solid)",
				borderRadius: 8,
				border: "1px solid var(--bt-color-border-default)",
			}}
		>
			<div style={{ fontSize: 11, color: "var(--bt-color-text-caption)", marginBottom: 4 }}>
				{label}
			</div>
			<div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
		</div>
	);
}
