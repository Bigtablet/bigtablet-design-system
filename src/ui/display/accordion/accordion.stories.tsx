import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Accordion } from ".";

const meta: Meta<typeof Accordion> = {
	title: "Components/Display/Accordion",
	component: Accordion,
	tags: ["autodocs"],
	argTypes: {
		multiple: { control: "boolean" },
		defaultOpenKeys: { control: "object" },
		openKeys: { control: false },
		onChange: { action: "changed" },
		items: { control: false },
	},
	args: { multiple: false, defaultOpenKeys: [] },
	parameters: {
		docs: {
			description: {
				component: `
**Accordion** - 펼침/접힘 패널로 콘텐츠를 점진적으로 노출한다.

\`multiple={false}\` (기본): 한 번에 하나만 열림 / \`multiple={true}\`: 패널마다 독립 토글.
WAI-ARIA Disclosure 패턴(\`aria-expanded\`, \`aria-controls\`, \`role="region"\`)을 자동 처리한다.
				`,
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
		content: "B2B 매장 운영을 위한 통합 관리 솔루션입니다.",
	},
	{
		key: "2",
		title: "어떻게 시작하나요?",
		content: "무료 체험을 신청하시면 영업팀이 연락드립니다.",
	},
	{ key: "3", title: "결제 방식은요?", content: "월간 / 연간 구독 방식입니다." },
];

export const Default: Story = {
	name: "Single (한 번에 하나)",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} />
		</div>
	),
};

export const Multiple: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"`multiple` 을 켜면 패널이 서로 독립적으로 열립니다. FAQ 처럼 **여러 항목을 나란히 펼쳐 두고 비교**할 때 씁니다.\n\n기본값(`false`)은 하나를 열면 나머지가 닫히는 형태로, 화면이 길어지는 것을 막고 싶을 때 씁니다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} multiple defaultOpenKeys={["1", "2"]} />
		</div>
	),
};

export const WithDisabled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"아직 열 수 없는 패널을 잠근 상태입니다. 조건이 안 갖춰졌을 때 항목을 **숨기는 대신 잠그면**, 무엇이 남았는지 사용자가 볼 수 있습니다.",
			},
		},
	},
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				items={[
					{ key: "a", title: "Available", content: "Open this." },
					{ key: "b", title: "Coming soon", content: "...", disabled: true },
					{ key: "c", title: "Available", content: "Another one." },
				]}
			/>
		</div>
	),
};

export const Controlled: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'열림 상태를 화면이 직접 들고 있는 형태입니다. "다음 단계로 넘어가면 이전 패널을 접는다" 처럼 **다른 동작과 연동해야 할 때만** 제어형으로 가세요.\n\n단순 펼침/접힘이라면 제어하지 않는 편이 코드가 짧습니다.',
			},
		},
		chromatic: { disableSnapshot: true },
	},
	render: () => {
		const [openKeys, setOpenKeys] = useState<string[]>(["1"]);
		return (
			<div style={{ width: 560 }}>
				<Accordion items={FAQ} openKeys={openKeys} onChange={setOpenKeys} multiple />
			</div>
		);
	},
};

export const RichContent: Story = {
	name: "Rich content (폼/리스트)",
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion
				multiple
				defaultOpenKeys={["form"]}
				items={[
					{
						key: "form",
						title: "추가 정보 입력",
						content: (
							<form style={{ display: "flex", flexDirection: "column", gap: 12 }}>
								<label style={{ fontSize: 13 }}>
									매장 이름
									<input
										type="text"
										placeholder="예: 강남 1호점"
										style={{
											display: "block",
											width: "100%",
											marginTop: 4,
											padding: 8,
											border: "1px solid var(--bt-color-border-default)",
											borderRadius: 6,
											background: "var(--bt-color-bg-solid)",
											color: "var(--bt-color-text-heading)",
										}}
									/>
								</label>
							</form>
						),
					},
					{
						key: "list",
						title: "체크리스트",
						content: (
							<ul style={{ paddingLeft: 20, margin: 0 }}>
								<li>POS 설치 확인</li>
								<li>네트워크 연결 확인</li>
								<li>직원 계정 발급</li>
							</ul>
						),
					},
				]}
			/>
		</div>
	),
};
