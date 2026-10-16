import type { Meta, StoryObj } from "@storybook/react";
import { LayoutGrid, List } from "lucide-react";
import * as React from "react";
import { iconSize } from "../../../styles/icon";
import { Field } from "../field";
import { SELECTION_COMPARISON } from "../selection-comparison.docs";
import { SegmentedControl } from ".";

const meta: Meta<typeof SegmentedControl> = {
	title: "Components/Forms/SegmentedControl",
	component: SegmentedControl,
	tags: ["autodocs"],
	argTypes: {
		size: {
			control: "select",
			options: ["sm", "md"],
			description: "크기. 터치 화면에서 한 단계 커집니다.",
		},
		fullWidth: { control: "boolean", description: "부모 폭을 채우고 칸을 균등 분배." },
		disabled: { control: "boolean", description: "전체 비활성화." },
	},
	args: { size: "md", fullWidth: false, disabled: false },
	parameters: {
		docs: {
			description: {
				component: `
**SegmentedControl** - 짧은 옵션 중 **값 하나를 고르는** 컨트롤. native radio 기반이라 ←→ 이동·선택과 폼 제출을 브라우저가 처리하고, Home/End 를 더했습니다. 선택된 칸은 색과 함께 떠오른 표면(그림자)으로 구분됩니다.

${SELECTION_COMPARISON}
        `,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const currencies = [
	{ value: "USD", label: "USD" },
	{ value: "KRW", label: "KRW" },
];

export const Default: Story = {
	render: (args) => {
		const [value, setValue] = React.useState("USD");
		return (
			<SegmentedControl
				{...args}
				aria-label="통화"
				items={currencies}
				value={value}
				onValueChange={setValue}
			/>
		);
	},
};

const periods = [
	{ value: "1d", label: "1일" },
	{ value: "7d", label: "7일" },
	{ value: "30d", label: "30일" },
	{ value: "never", label: "만료 없음" },
];
export const Sizes: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
			<SegmentedControl aria-label="기간 (sm)" size="sm" defaultValue="7d" items={periods} />
			<SegmentedControl aria-label="기간 (md)" size="md" defaultValue="7d" items={periods} />
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
			<SegmentedControl aria-label="전체 비활성" disabled defaultValue="USD" items={currencies} />
			<SegmentedControl
				aria-label="한 칸 비활성"
				defaultValue="prod"
				items={[
					{ value: "prod", label: "운영" },
					{ value: "dev", label: "개발", disabled: true },
				]}
			/>
		</div>
	),
};

export const FullWidth: Story = {
	render: () => (
		<div style={{ width: 360 }}>
			<SegmentedControl
				aria-label="결제 수단"
				fullWidth
				defaultValue="card"
				items={[
					{ value: "card", label: "카드" },
					{ value: "transfer", label: "계좌이체" },
					{ value: "invoice", label: "청구서" },
				]}
			/>
		</div>
	),
};

export const WithIcons: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
			<SegmentedControl
				aria-label="보기 방식"
				defaultValue="list"
				items={[
					{ value: "list", label: "목록", icon: <List size={iconSize.sm} /> },
					{ value: "grid", label: "격자", icon: <LayoutGrid size={iconSize.sm} /> },
				]}
			/>
			{/* 아이콘만 둘 때는 ariaLabel 로 이름을 준다 */}
			<SegmentedControl
				aria-label="보기 방식 (아이콘만)"
				size="sm"
				defaultValue="list"
				items={[
					{ value: "list", icon: <List size={iconSize.sm} />, ariaLabel: "목록" },
					{ value: "grid", icon: <LayoutGrid size={iconSize.sm} />, ariaLabel: "격자" },
				]}
			/>
		</div>
	),
};

export const InField: Story = {
	name: "Field 와 함께",
	render: () => (
		<Field name="locale" label="언어" help="화면 표시 언어" required>
			<SegmentedControl
				defaultValue="ko"
				items={[
					{ value: "ko", label: "KO" },
					{ value: "en", label: "EN" },
				]}
			/>
		</Field>
	),
};
