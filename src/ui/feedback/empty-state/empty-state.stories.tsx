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
**EmptyState** — Placeholder for areas with no data. / **EmptyState** — 데이터 없는 영역 placeholder. Slots / 슬롯: \`illustration\` + \`title\` + \`description\` + \`action\`.

Sizes: \`sm\` (modal/sidebar / 모달·사이드바) / \`md\` (content area, default / 콘텐츠 영역, 기본) / \`lg\` (page main / 페이지 메인).
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
