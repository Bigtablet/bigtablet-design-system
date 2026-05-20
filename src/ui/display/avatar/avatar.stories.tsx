import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from ".";

const meta: Meta<typeof Avatar> = {
	title: "Components/Avatar",
	component: Avatar,
	tags: ["autodocs"],
	argTypes: {
		src: {
			control: "text",
			description: "이미지 URL. 로드 실패 시 자동으로 initials fallback.",
		},
		name: {
			control: "text",
			description: "alt 텍스트 및 initials 추출용 이름.",
		},
		size: {
			control: "select",
			options: ["xs", "sm", "md", "lg", "xl"],
			description: "아바타 크기. xs=24 / sm=32 / md=40 / lg=48 / xl=64",
		},
		shape: {
			control: "select",
			options: ["circle", "square"],
			description: "모양. 사람=circle, 브랜드/조직=square 권장.",
		},
		bgColor: {
			control: "text",
			description: "initials 모드 배경색 (기본: navy accent).",
		},
	},
	args: {
		name: "박상민",
		size: "md",
		shape: "circle",
	},
	parameters: {
		docs: {
			description: {
				component: `
**Avatar**는 사용자 프로필을 표시한다. 이미지 우선, 실패하거나 없으면 \`name\`에서 추출한 **initials**로 자동 fallback. 기본 색상은 Bigtablet navy.

### 언제 사용하나요?
- 로그인한 사용자/멤버 표시
- 이미지가 없거나 미지정 사용자 (자동 initials fallback)
- 그룹/팀 아바타 스택 (음수 \`marginLeft\`로 겹침)
- 알림 점/카운트와 함께 (절대 위치 \`<Badge shape="dot/count" />\`)

### initials 추출 규칙
\`name\`을 공백으로 split해서:
- **1단어** ("박상민", "Madonna") → 첫 글자 (\`박\`, \`M\`)
- **2단어 이상** ("Sangmin Park") → 첫 + 마지막 단어의 첫 글자 (\`SP\`)
- 항상 \`toUpperCase()\`

한글 이름은 보통 1단어이므로 \`"박상민"\` → \`"박"\`. 두 글자 initial이 필요하면 \`name="박 상민"\`처럼 띄어쓰기.

### size
| size | px | 권장 위치 |
|------|-----|----------|
| \`xs\` | 24 | 댓글, 인라인 멘션 |
| \`sm\` | 32 | 리스트, 사이드바 |
| \`md\` | 40 | 헤더, 카드 (기본) |
| \`lg\` | 48 | 프로필 카드 |
| \`xl\` | 64 | 프로필 페이지 헤더 |

### shape
- \`circle\` (기본) — 사람 프로필
- \`square\` — 브랜드/조직 로고

### 접근성
- 이미지 모드: 내부 \`<img alt={name}>\`
- initials 모드: 루트 span에 \`role="img"\` + \`aria-label={name}\` 자동 부여, initials는 \`aria-hidden\`
- \`name=""\`이면 장식용 처리 (\`aria-label\` 없음)
- 클릭 가능한 아바타는 \`<button>\` / \`<a>\`로 감싸기 (Avatar 자체는 \`<span>\`)
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 prop을 바꿔보세요.",
			},
		},
	},
};

export const WithImage: Story = {
	name: "이미지",
	args: {
		src: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
		name: "John Doe",
	},
};

export const Initials: Story = {
	name: "Initials (이미지 없음)",
	args: { name: "박상민" },
};

export const MultiWord: Story = {
	name: "여러 단어",
	args: { name: "Sangmin Park" },
};

export const Sizes: Story = {
	name: "사이즈 비교",
	render: () => (
		<div style={{ display: "flex", gap: 12, alignItems: "center" }}>
			<Avatar name="S" size="xs" />
			<Avatar name="S" size="sm" />
			<Avatar name="S" size="md" />
			<Avatar name="S" size="lg" />
			<Avatar name="S" size="xl" />
		</div>
	),
};

export const Shapes: Story = {
	name: "circle vs square",
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="C" shape="circle" size="lg" />
			<Avatar name="S" shape="square" size="lg" />
		</div>
	),
};

export const CustomColors: Story = {
	name: "커스텀 컬러",
	render: () => (
		<div style={{ display: "flex", gap: 12 }}>
			<Avatar name="N" bgColor="#47555E" />
			<Avatar name="S" bgColor="#7AA5D2" />
			<Avatar name="B" bgColor="#5A8DCB" />
			<Avatar name="D" bgColor="#303841" />
		</div>
	),
};

export const Fallback: Story = {
	name: "이미지 로드 실패 시",
	args: { src: "/broken-path.jpg", name: "박상민" },
};
