import type { Meta, StoryObj } from "@storybook/react";
import { Slash } from "lucide-react";
import { Breadcrumb } from ".";

const meta: Meta<typeof Breadcrumb> = {
	title: "Components/Breadcrumb",
	component: Breadcrumb,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"**Breadcrumb**는 페이지 위계 네비게이션. 마지막 항목이 현재 페이지로 표시 (`aria-current=page`).",
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
				{ label: "홈", href: "/" },
				{ label: "블로그", href: "/blog" },
				{ label: "디자인 시스템 v3.0" },
			]}
		/>
	),
};

export const ShortPath: Story = {
	name: "2단계",
	render: () => (
		<Breadcrumb
			items={[
				{ label: "Settings", href: "/settings" },
				{ label: "Profile" },
			]}
		/>
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
