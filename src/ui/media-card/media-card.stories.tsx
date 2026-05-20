import type { Meta, StoryObj } from "@storybook/react";
import { MediaCard } from ".";

const SAMPLE_IMAGE = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80";
const SAMPLE_IMAGE_2 = "https://images.unsplash.com/photo-1481833761820-0509d3217039?w=800&q=80";
const SAMPLE_IMAGE_3 = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80";

const meta: Meta<typeof MediaCard> = {
	title: "Components/MediaCard",
	component: MediaCard,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**MediaCard**는 이미지를 포함한 카드 컴포넌트입니다. Blog/News/Product 같은 B2C 콘텐츠 리스트에 사용합니다.

### 언제 사용하나요?
- 블로그/뉴스 카드 리스트
- 카페 메뉴/상품 그리드
- 캠페인/이벤트 진열

### imagePosition
| 값 | 설명 |
|----|------|
| **top** (기본) | 이미지가 위, 텍스트가 아래 — 가장 흔한 카드 |
| **left** | 이미지가 왼쪽, 텍스트가 오른쪽 — 리스트 뷰. 모바일에서 자동 top |
| **overlay** | 이미지 위에 텍스트가 얹힘 + 그라데이션 — 강조 카드 |

### Next.js 사용 시
DS는 프레임워크 독립이라 \`<img>\`를 사용합니다. Next.js에서는 다음과 같이 wrap하세요:
\`\`\`tsx
<Link href="/blog/123">
  <MediaCard
    image={{ src: ..., alt: ... }}
    clickable
    heading="제목"
  />
</Link>
\`\`\`
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof MediaCard>;

export const ImageTop: Story = {
	name: "이미지 위 (기본)",
	render: () => (
		<div style={{ maxWidth: 320 }}>
			<MediaCard
				image={{ src: SAMPLE_IMAGE, alt: "커피 한 잔" }}
				heading="오늘의 커피"
				eyebrow="MENU"
				meta="2026-05-19 · 조회 1,240"
			>
				새로 들어온 에티오피아 예가체프 원두로 내린 핸드드립 커피입니다.
			</MediaCard>
		</div>
	),
};

export const ImageLeft: Story = {
	name: "이미지 왼쪽 (리스트)",
	render: () => (
		<div style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{[
				{ img: SAMPLE_IMAGE, title: "에티오피아 예가체프" },
				{ img: SAMPLE_IMAGE_2, title: "콜드 브루 라떼" },
				{ img: SAMPLE_IMAGE_3, title: "시즌 디저트 페어링" },
			].map((item, i) => (
				<MediaCard
					key={item.title}
					image={{ src: item.img, alt: item.title }}
					imagePosition="left"
					heading={item.title}
					eyebrow={i === 0 ? "NEW" : "MENU"}
					meta="2026-05-19"
					aspectRatio="4/3"
				>
					부드러운 산미와 깊은 향이 매력적입니다. 매장에서 직접 로스팅한 원두만 사용합니다.
				</MediaCard>
			))}
		</div>
	),
};

export const ImageOverlay: Story = {
	name: "이미지 위 텍스트 오버레이 (강조)",
	render: () => (
		<div style={{ maxWidth: 360 }}>
			<MediaCard
				image={{ src: SAMPLE_IMAGE, alt: "프로모션" }}
				imagePosition="overlay"
				eyebrow="HOT"
				heading="가을 시즌 한정 메뉴"
				meta="10/1 - 11/30"
				aspectRatio="3/4"
			>
				계절 한정 호박 라떼와 함께 따뜻한 가을을 즐겨보세요.
			</MediaCard>
		</div>
	),
};

export const Clickable: Story = {
	name: "클릭 가능 (hover lift)",
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
			{[
				{ img: SAMPLE_IMAGE, title: "에티오피아" },
				{ img: SAMPLE_IMAGE_2, title: "콜드 브루" },
				{ img: SAMPLE_IMAGE_3, title: "시즌 디저트" },
			].map((item) => (
				<MediaCard
					key={item.title}
					image={{ src: item.img, alt: item.title }}
					heading={item.title}
					eyebrow="MENU"
					clickable
					shadow="sm"
				>
					마우스를 올리면 살짝 떠오릅니다.
				</MediaCard>
			))}
		</div>
	),
};

export const Bordered: Story = {
	name: "테두리 (그림자 없이)",
	render: () => (
		<div style={{ maxWidth: 320 }}>
			<MediaCard
				image={{ src: SAMPLE_IMAGE, alt: "커피" }}
				heading="단정한 카드"
				bordered
				shadow="none"
			>
				그림자 없이 테두리로만 경계를 표현합니다.
			</MediaCard>
		</div>
	),
};

export const Grid: Story = {
	name: "그리드 레이아웃",
	parameters: { chromatic: { disableSnapshot: true } },
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
			{Array.from({ length: 6 }).map((_, i) => (
				<MediaCard
					// biome-ignore lint/suspicious/noArrayIndexKey: demo
					key={i}
					image={{ src: [SAMPLE_IMAGE, SAMPLE_IMAGE_2, SAMPLE_IMAGE_3][i % 3], alt: "" }}
					heading={`아이템 ${i + 1}`}
					eyebrow={i % 2 === 0 ? "NEW" : "BEST"}
					clickable
					meta="2026-05"
				>
					제품 또는 콘텐츠 설명이 여기에 들어갑니다.
				</MediaCard>
			))}
		</div>
	),
};
