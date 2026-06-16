import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { Textarea } from ".";

const meta: Meta<typeof Textarea> = {
	title: "Components/Forms/Textarea",
	component: Textarea,
	tags: ["autodocs"],
	argTypes: {
		size: { control: "select", options: ["sm", "md", "lg"] },
		resize: { control: "select", options: ["none", "vertical", "both"] },
		imeStrategy: { control: "select", options: ["delayed", "immediate"] },
		label: { control: "text" },
		supportingText: { control: "text" },
		error: { control: "boolean" },
		disabled: { control: "boolean" },
		showCounter: { control: "boolean" },
		fullWidth: { control: "boolean" },
		rows: { control: "number" },
		maxLength: { control: "number" },
	},
	args: {
		label: "내용",
		placeholder: "내용을 입력하세요",
		size: "md",
		rows: 3,
		fullWidth: true,
	},
	parameters: {
		docs: {
			description: {
				component: `
**Textarea** — 멀티라인 텍스트 입력. \`TextField\` 와 동일한 시각/토큰 (border / focus / error / label / helper / disabled).

- auto-grow: \`minRows\` / \`maxRows\` 지정 시 내용 따라 높이 자동 증가
- \`showCounter\` + \`maxLength\` → 글자 수 카운터
- \`resize\`: none / vertical (기본) / both
- 한글 IME: \`imeStrategy="immediate"\` 로 조합 중 실시간 콜백
				`,
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
	render: (args) => {
		const [v, setV] = React.useState("");
		return <div style={{ width: 420 }}><Textarea {...args} value={v} onChangeAction={setV} /></div>;
	},
};

export const AutoGrow: Story = {
	name: "Auto-grow (minRows/maxRows)",
	parameters: {
		docs: {
			description: {
				story: "`minRows={2}` `maxRows={6}` — 입력할수록 늘어나다 6행 초과 시 스크롤. resize 핸들 자동 비활성.",
			},
		},
	},
	render: () => {
		const [v, setV] = React.useState("");
		return (
			<div style={{ width: 420 }}>
				<Textarea
					label="자기소개"
					placeholder="여러 줄 입력해보세요"
					minRows={2}
					maxRows={6}
					fullWidth
					value={v}
					onChangeAction={setV}
				/>
			</div>
		);
	},
};

export const WithCounter: Story = {
	name: "글자 수 카운터",
	render: () => {
		const [v, setV] = React.useState("");
		return (
			<div style={{ width: 420 }}>
				<Textarea
					label="공지 내용"
					placeholder="최대 200자"
					maxLength={200}
					showCounter
					minRows={3}
					maxRows={8}
					fullWidth
					value={v}
					onChangeAction={setV}
				/>
			</div>
		);
	},
};

export const ErrorState: Story = {
	name: "에러 상태",
	render: () => (
		<div style={{ width: 420 }}>
			<Textarea
				label="문의 내용"
				error
				supportingText="내용을 입력해주세요."
				rows={3}
				fullWidth
				defaultValue=""
			/>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: "grid", gap: 16, width: 420 }}>
			<Textarea label="Small" size="sm" rows={2} fullWidth placeholder="sm" />
			<Textarea label="Medium" size="md" rows={2} fullWidth placeholder="md" />
			<Textarea label="Large" size="lg" rows={2} fullWidth placeholder="lg" />
		</div>
	),
};
