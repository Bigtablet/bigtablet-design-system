import type { Meta, StoryObj } from "@storybook/react";
import { Slash } from "lucide-react";
import { Breadcrumb } from ".";

const meta: Meta<typeof Breadcrumb> = {
	title: "Components/Navigation/Breadcrumb",
	component: Breadcrumb,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component: `
**Breadcrumb** - 페이지 위계 내비게이션. 마지막 항목에 \`aria-current="page"\` 가 자동으로 붙는다.

\`items\` 동작: \`href\` → \`<a>\` / \`onClick\` → \`<button>\` / 마지막 → \`<span>\`. \`separator\` prop 으로 구분자를 바꿀 수 있다.
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
	name: "기본",
	parameters: {
		docs: {
			description: {
				story:
					'**현재 위치를 알리는 용도지 이동 수단이 아닙니다.** 마지막 항목은 링크가 아니라 `<span>` 으로 렌더되고 `aria-current="page"` 가 붙습니다 - 지금 보고 있는 페이지를 다시 누르게 두지 않습니다.\n\n섹션을 바꾸는 것이 목적이면 `Tabs`, 화면을 옮기는 것이면 `NavBar`/`Sidebar` 쪽입니다.',
			},
		},
	},
	render: () => (
		<Breadcrumb
			items={[
				{ label: "동대구", href: "/" },
				{ label: "빅태블릿", href: "/bigtablet" },
				{ label: "디자인 시스템 v3.0" },
			]}
		/>
	),
};

export const ShortPath: Story = {
	name: "2단계",
	parameters: {
		docs: {
			description: {
				story:
					"2단계면 경로가 짧아 값이 크지 않습니다. **깊이가 3단계 이상일 때** 쓰세요 - 홈 → 현재 두 칸은 뒤로 가기 버튼과 다를 바가 없습니다.",
			},
		},
	},
	render: () => (
		<Breadcrumb items={[{ label: "Settings", href: "/settings" }, { label: "Profile" }]} />
	),
};

export const CustomSeparator: Story = {
	name: "구분자 커스텀",
	parameters: {
		docs: {
			description: {
				story:
					"`separator` 로 구분자를 바꿉니다. 문자열이든 노드든 받지만 **읽히는 텍스트는 넣지 마세요** - 스크린리더가 항목 사이마다 그 말을 읽습니다.\n\n기본값(`/`)은 장식으로 처리됩니다.",
			},
		},
	},
	render: () => (
		<Breadcrumb
			separator={<Slash size={12} aria-hidden />}
			items={[
				{ label: "Docs", href: "/docs" },
				{ label: "Components", href: "/docs/components" },
				{ label: "Breadcrumb" },
			]}
		/>
	),
};

export const ButtonOnly: Story = {
	name: "버튼 onClick 사용",
	parameters: {
		docs: {
			description: {
				story:
					"`href` 없이 `onClick` 만 주면 `<button>` 으로 렌더됩니다. 라우터를 직접 호출하거나 저장 확인을 먼저 띄워야 할 때 씁니다.\n\n라우터 `Link` 컴포넌트로 렌더하려면 `as` 를 쓰세요(3.18.0) - `<a>` 를 유지하면서 클라이언트 이동이 됩니다.",
			},
		},
	},
	render: () => (
		<Breadcrumb
			items={[
				{ label: "Root", onClick: () => alert("root") },
				{ label: "Section", onClick: () => alert("section") },
				{ label: "Page" },
			]}
		/>
	),
};
