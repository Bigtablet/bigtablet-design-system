import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Search } from "lucide-react";
import { Button } from "../button";
import { EmptyState } from ".";

const meta: Meta<typeof EmptyState> = {
	title: "Components/EmptyState",
	component: EmptyState,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**EmptyState**는 빈 화면/검색 결과 없음/시작 가이드 표시. illustration + title + description + action 슬롯.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

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
