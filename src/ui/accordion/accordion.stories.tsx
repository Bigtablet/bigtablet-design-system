import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from ".";

const meta: Meta<typeof Accordion> = {
	title: "Components/Accordion",
	component: Accordion,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Accordion**은 펼침/접힘 영역. FAQ/설정/details 패턴. `multiple`로 여러 개 동시 펼침 허용.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const FAQ = [
	{
		key: "1",
		title: "Bigtablet은 무엇인가요?",
		content: "B2B 매장 운영을 위한 통합 관리 솔루션입니다. 주문/재고/직원 관리 등을 제공합니다.",
	},
	{
		key: "2",
		title: "어떻게 시작하나요?",
		content: "무료 체험을 신청하시면 영업팀이 연락드려 도입을 도와드립니다.",
	},
	{
		key: "3",
		title: "결제 방식은요?",
		content: "월간 / 연간 구독 방식이며, 매장 규모에 따라 요금이 다릅니다. 견적은 상담 후 안내드립니다.",
	},
];

export const Default: Story = {
	name: "기본 (단일 펼침)",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} />
		</div>
	),
};

export const Multiple: Story = {
	name: "여러 개 동시 펼침",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} multiple defaultOpenKeys={["1", "2"]} />
		</div>
	),
};

export const WithDisabled: Story = {
	name: "비활성 아이템",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				items={[
					{ key: "a", title: "Available", content: "Open this." },
					{ key: "b", title: "Coming soon (disabled)", content: "...", disabled: true },
					{ key: "c", title: "Available", content: "Another one." },
				]}
			/>
		</div>
	),
};
