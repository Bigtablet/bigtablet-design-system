import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../general/button";
import { Hero } from ".";

const meta: Meta<typeof Hero> = {
	title: "Components/Display/Hero",
	component: Hero,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
**Hero** — Large banner area at the top of a page. Renders \`<section>\` + \`<h1>\` (one per page). / **Hero** — 페이지 상단 큰 영역. \`<section>\` + \`<h1>\` (페이지당 하나).

Slots: \`eyebrow\` / \`title\` / \`subtitle\` / \`primaryAction\` / \`secondaryAction\` / \`children\`. / 슬롯: \`eyebrow\` / \`title\` / \`subtitle\` / \`primaryAction\` / \`secondaryAction\` / \`children\`.
Key props: \`height\` (sm/md/lg/full), \`overlay\` (\`dark\`/\`light\`/\`navy\`), \`align\`, \`backgroundImage\`, \`backgroundColor\`. / 주요 prop: \`height\` (sm/md/lg/full), \`overlay\` (\`dark\`/\`light\`/\`navy\`), \`align\`, \`backgroundImage\`, \`backgroundColor\`.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const SimpleText: Story = {
	render: () => (
		<Hero
			title="환영합니다"
			subtitle="오늘 하루도 좋은 시간 보내세요."
			backgroundColor="var(--bt-color-bg-solid-dim)"
		>
			<Button size="lg">시작하기</Button>
		</Hero>
	),
};

export const WithBackgroundImage: Story = {
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

export const LightOverlay: Story = {
	name: "Light overlay (밝은 이미지)",
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
