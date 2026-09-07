import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Search } from "lucide-react";
import { Button } from "../../general/button";
import { EmptyState } from ".";

const meta: Meta<typeof EmptyState> = {
	title: "Components/Feedback/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	argTypes: {
		title: {
			control: "text",
			description: "제목 - h3로 렌더링.",
		},
		description: {
			control: "text",
			description: "보조 설명.",
		},
		size: {
			control: "select",
			options: ["sm", "md", "lg"],
			description: "크기 - sm: 24/16, md: 40/24, lg: 48/24",
		},
		illustration: {
			control: false,
			description: "일러스트 영역 (아이콘/이미지). aria-hidden 자동 부여.",
		},
		action: {
			control: false,
			description: "액션 영역 (Button 등) - 1~2개 권장.",
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
**EmptyState** - 데이터가 없는 영역을 채우는 placeholder. 슬롯: \`illustration\` + \`title\` + \`description\` + \`action\`.

크기: \`sm\` (모달·사이드바) / \`md\` (콘텐츠 영역, 기본) / \`lg\` (페이지 메인).
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
	name: "받은 메일 없음",
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
	parameters: {
		docs: {
			description: {
				story:
					"검색 결과 0건은 **오류가 아닙니다.** 무엇으로 찾았는지 문구에 담고, 조건을 지우는 버튼을 함께 둡니다.\n\n데이터를 못 불러온 실패라면 `EmptyState` 가 아니라 `ErrorState` 입니다.",
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					"설명과 버튼을 뺀 형태입니다. 사이드바나 작은 카드처럼 **자리가 좁고 사용자가 할 수 있는 일이 따로 없을 때** 씁니다.\n\n할 수 있는 일이 있으면 `action` 을 주는 편이 낫습니다 - 빈 화면만 보여 주면 막힌 것처럼 읽힙니다.",
			},
		},
	},
	render: () => <EmptyState title="아직 데이터가 없습니다" size="sm" />,
};
