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
**Accordion** — Progressively reveals content via expand/collapse panels. / 펼침/접힘으로 컨텐츠 점진 노출.

\`multiple={false}\` (default): one open at a time / \`multiple={true}\`: independent toggles. — \`multiple={false}\` (기본): 한 번에 하나 / \`multiple={true}\`: 독립 토글.
WAI-ARIA Disclosure handled automatically (\`aria-expanded\`, \`aria-controls\`, \`role="region"\`). / WAI-ARIA Disclosure 자동.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Accordion>;

const FAQ = [
	{ key: "1", title: "Bigtablet은 무엇인가요?", content: "B2B 매장 운영을 위한 통합 관리 솔루션입니다." },
	{ key: "2", title: "어떻게 시작하나요?", content: "무료 체험을 신청하시면 영업팀이 연락드립니다." },
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
	render: () => (
		<div style={{ width: 560 }}>
			<Accordion items={FAQ} multiple defaultOpenKeys={["1", "2"]} />
		</div>
	),
};

export const WithDisabled: Story = {
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
	parameters: { chromatic: { disableSnapshot: true } },
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
