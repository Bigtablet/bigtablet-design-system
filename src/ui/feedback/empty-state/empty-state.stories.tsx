import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Search } from "lucide-react";
import { Button } from "../../general/button";
import { EmptyState } from ".";

const meta: Meta<typeof EmptyState> = {
	title: "Components/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	argTypes: {
		title: {
			control: "text",
			description: "제목 — h3로 렌더링.",
		},
		description: {
			control: "text",
			description: "보조 설명.",
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "크기 — sm: 24/16, md: 40/24, lg: 48/24",
		},
		illustration: {
			control: false,
			description: "일러스트 영역 (아이콘/이미지). aria-hidden 자동 부여.",
		},
		action: {
			control: false,
			description: "액션 영역 (Button 등) — 1~2개 권장.",
		},
	},
	args: {
		title: "받은 메일이 없습니다",
		description: "새 메일이 오면 여기 표시됩니다.",
		size: "md",
	},
	parameters: {
		docs: {
			description: {
				component: `
**EmptyState**는 데이터가 없는 영역을 채우는 **placeholder 컴포넌트**. illustration + title + description + action 슬롯으로 구성.

### 언제 사용하나요?
- 데이터/항목이 아직 없음 (받은 메일 0개, 첫 프로젝트)
- 검색 결과 없음 → \`size="sm"\`
- 권한 없어서 못 봄 (illustration: Lock 아이콘)

> 에러로 인한 로드 실패는 [Alert](./?path=/docs/components-alert--docs) \`variant="error"\`도 고려. 로딩 중은 Spinner/Skeleton, 페이지 전체 404/500은 전용 에러 페이지(Hero 패턴).

### EmptyState vs Alert(error)
| | EmptyState | Alert(error) |
|---|------------|--------------|
| 의도 | "지금은 비어있어요" | "문제가 생겼어요" |
| 톤 | 중립, 안내 | 경고, 행동 필요 |
| 위치 | 콘텐츠 영역 전체 | 상단 배너/인라인 |

### size
| size | 패딩 | 제목 | 권장 |
|------|------|------|------|
| \`sm\` | 24/16 | title.medium | 모달, 사이드바, 검색 결과 |
| \`md\` (기본) | 40/24 | title.large | 콘텐츠 영역 전체 |
| \`lg\` | 48/24 | heading.small | 페이지 메인, 온보딩 |

### 구성 패턴
각 슬롯은 모두 옵셔널 — 필요한 것만:
- **illustration only** — 가장 미니멀
- **title only** — "아직 데이터가 없습니다"
- **illustration + title + description** — 권장 기본
- **+ action** — 온보딩, 시작 가이드

action 슬롯은 Button 1–2개 권장. 더 많아지면 EmptyState의 명확함이 흐려진다.

### 접근성
- 루트는 \`<div>\` — 동적 변경 (검색 결과 등)은 \`role="status"\` 추가
- 제목은 \`<h3>\` 고정
- \`illustration\`은 \`aria-hidden\` 자동 부여 — 의미 전달이 필요하면 title/description에 텍스트로 동일 의미 포함

\`\`\`tsx
<EmptyState
  role="status"
  illustration={<Search size={40} />}
  title={\`"\${query}"에 대한 결과가 없습니다\`}
  size="sm"
/>
\`\`\`
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {
	name: "Playground (Controls로 조작)",
	parameters: {
		docs: {
			description: {
				story: "우측 Controls 패널에서 title/description/size를 바꿔보세요. illustration과 action은 sample 사용.",
			},
		},
	},
	args: {
		illustration: <Inbox size={48} />,
		action: <Button>새 메일 작성</Button>,
	},
};

export const Default: Story = {
	name: "기본 — 받은 메일",
	render: () => (
		<EmptyState
			illustration={<Inbox size={48} />}
			title="받은 메일이 없습니다"
			description="새 메일이 오면 여기 표시됩니다."
			action={<Button>새 메일 작성</Button>}
		/>
	),
};

export const SearchNoResults: Story = {
	name: "검색 결과 없음",
	render: () => (
		<EmptyState
			illustration={<Search size={40} />}
			title="검색 결과가 없습니다"
			description="다른 키워드로 검색해보세요."
			size="sm"
		/>
	),
};

export const Onboarding: Story = {
	name: "온보딩",
	render: () => (
		<EmptyState
			illustration={<Inbox size={64} />}
			title="첫 프로젝트를 만들어보세요"
			description="프로젝트를 만들면 팀원과 협업하고 진행 상황을 추적할 수 있습니다."
			action={
				<div style={{ display: "flex", gap: 8 }}>
					<Button>프로젝트 만들기</Button>
					<Button variant="outline">가이드 보기</Button>
				</div>
			}
			size="lg"
		/>
	),
};

export const Minimal: Story = {
	name: "최소 (title만)",
	render: () => <EmptyState title="아직 데이터가 없습니다" size="sm" />,
};
