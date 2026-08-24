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
	render: () => (
		<Breadcrumb items={[{ label: "Settings", href: "/settings" }, { label: "Profile" }]} />
	),
};

export const CustomSeparator: Story = {
	name: "구분자 커스텀",
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
