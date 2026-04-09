import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
	title: "Guide/Introduction",
	tags: ["autodocs"],
	parameters: {
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

- **Guide** — 시작 가이드, 설치 방법, 사용법
- **Foundation** — 색상, 타이포그래피, 간격 등 디자인 토큰
- **Components** — 실제 UI 컴포넌트 (버튼, 인풋, 모달 등)

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
					background: "#f8f9fa",
					borderRadius: 12,
					border: "1px solid #e5e5e5",
				}}
			>
				<h3 style={{ margin: "0 0 16px", fontSize: 16 }}>빠른 시작</h3>
				<div style={{ display: "grid", gap: 12 }}>
					<Step number={1} title="Foundation 확인" description="디자인 토큰(색상, 타이포, 간격 등)이 최신 시안과 일치하는지 확인합니다." />
					<Step number={2} title="컴포넌트 검증" description="각 컴포넌트의 Props를 조작하며 기대한 대로 동작하는지 확인합니다." />
					<Step number={3} title="Chromatic 리뷰" description="PR에 연결된 Chromatic 링크에서 시각적 변경사항을 승인합니다." />
				</div>
			</section>

			<section
				style={{
					padding: 24,
					background: "#f8f9fa",
					borderRadius: 12,
					border: "1px solid #e5e5e5",
				}}
			>
				<h3 style={{ margin: "0 0 12px", fontSize: 16 }}>버전 정보</h3>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
					<InfoCard label="패키지" value="@bigtablet/design-system" />
					<InfoCard label="Storybook" value="v10" />
					<InfoCard label="React" value="19" />
					<InfoCard label="시각적 리뷰" value="Chromatic" />
				</div>
			</section>
		</div>
	),
};

function Step({ number, title, description }: { number: number; title: string; description: string }) {
	return (
		<div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
			<div
				style={{
					width: 28,
					height: 28,
					borderRadius: "50%",
					background: "#121212",
					color: "#fff",
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
				<p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.75, lineHeight: 1.5 }}>{description}</p>
			</div>
		</div>
	);
}

function InfoCard({ label, value }: { label: string; value: string }) {
	return (
		<div
			style={{
				padding: "12px 16px",
				background: "#fff",
				borderRadius: 8,
				border: "1px solid #e5e5e5",
			}}
		>
			<div style={{ fontSize: 11, opacity: 0.55, marginBottom: 4 }}>{label}</div>
			<div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
		</div>
	);
}
