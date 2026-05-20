import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../general/button";
import { Hero } from ".";

const meta: Meta<typeof Hero> = {
	title: "Components/Hero",
	component: Hero,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**Hero**는 페이지 상단의 큰 영역을 차지하는 섹션 컴포넌트. **마케팅 페이지, 카페 메인, 캠페인 랜딩**처럼 첫 인상을 좌우하는 영역에 사용한다.

### 언제 사용하나요?
- 홈/랜딩 페이지 상단의 강조 영역
- 캠페인/프로모션 상단 비주얼
- 카테고리/주제 페이지 상단 소개 (\`height="sm"\`)

> 리스트의 한 카드라면 [MediaCard](./?path=/docs/components-mediacard--docs), 짧은 강조라면 일반 [Section](./?path=/docs/foundation-section--docs)을 사용하세요.

### 구성
- **eyebrow** — 작은 카테고리/태그 (uppercase)
- **title** — h1 메인 제목 (display.small.medium)
- **subtitle** — 부제목 (body.large, max-width 640)
- **primaryAction / secondaryAction** — CTA (Button filled/outline, size lg)
- **children** — 추가 액션 자유 슬롯

### height
| height | 데스크탑 / 모바일 | 권장 |
|--------|-------------------|------|
| \`sm\` | 320 / 240 | 서브 페이지 헤더 |
| \`md\` | 480 / 360 | 일반 마케팅 (기본) |
| \`lg\` | 640 / 480 | 메인 랜딩 |
| \`full\` | 100vh | 풀스크린 |

### overlay (텍스트 대비)
- \`'dark'\` / \`true\` — 검정 그라데이션 (밝은 이미지 위 흰 텍스트)
- \`'light'\` — 흰색 그라데이션 (어두운 이미지 위 어두운 텍스트)
- \`'navy'\` — Bigtablet 브랜드 navy 강조

### textColor 자동 결정 (\`auto\`)
- dark/navy overlay → \`inverse\` (흰색)
- 이미지만 있고 overlay 없음 → \`inverse\` (안전)
- 그 외 → \`default\`

### 접근성
- 루트는 \`<section>\` 랜드마크 + 제목은 \`<h1>\` 고정 — **페이지에 Hero 2개 금지**
- overlay는 \`aria-hidden="true"\` 자동 부여
- backgroundImage는 CSS 배경(alt 없음) — 의미 있는 이미지면 children으로 \`<img alt>\` 추가
- 큰 배경 이미지는 LCP에 영향 — \`<link rel="preload" as="image">\` 또는 Next.js \`<Image priority />\` 권장

### 반응형
compact breakpoint (<600px)에서 height와 title 폰트가 자동 축소된다 (\`display.small.medium\` → \`heading.large.medium\`).
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const SimpleText: Story = {
	name: "텍스트만",
	render: () => (
		<Hero
			title="환영합니다"
			subtitle="오늘 하루도 좋은 시간 보내세요."
			backgroundColor="#F4F4F4"
		>
			<Button size="lg">시작하기</Button>
		</Hero>
	),
};

export const WithBackgroundImage: Story = {
	name: "배경 이미지 + Overlay",
	render: () => (
		<Hero
			title="오늘의 메뉴"
			subtitle="신선한 원두로 내린 커피와 함께"
			eyebrow="CAFE BIGTABLET"
			backgroundImage="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80"
			overlay="dark"
			height="md"
			align="left"
		>
			<Button size="lg">메뉴 보기</Button>
			<Button variant="outline" size="lg">
				위치 안내
			</Button>
		</Hero>
	),
};

export const CenteredCallToAction: Story = {
	name: "중앙 정렬 CTA",
	render: () => (
		<Hero
			title="새로운 시작"
			subtitle="Bigtablet과 함께 더 스마트한 운영을 시작하세요."
			backgroundColor="#121212"
			textColor="inverse"
			align="center"
			height="lg"
		>
			<Button size="lg" variant="filled">
				무료 체험
			</Button>
			<Button variant="outline" size="lg">
				자세히 보기
			</Button>
		</Hero>
	),
};

export const Heights: Story = {
	name: "높이 비교 (sm / md / lg)",
	parameters: { chromatic: { disableSnapshot: true } },
	render: () => (
		<div style={{ display: "grid", gap: 16 }}>
			{(["sm", "md", "lg"] as const).map((h) => (
				<Hero
					key={h}
					title={`Height ${h}`}
					subtitle="배경색 위 텍스트만 표시"
					backgroundColor="#F4F4F4"
					height={h}
					align="center"
				/>
			))}
		</div>
	),
};

export const LightOverlay: Story = {
	name: "Light overlay (밝은 이미지 위)",
	render: () => (
		<Hero
			title="블로그"
			subtitle="제품 업데이트와 디자인 스토리"
			backgroundImage="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
			overlay="light"
			height="md"
			align="center"
		/>
	),
};
